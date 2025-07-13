import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { ReplyService } from '../services/reply.service';
import { CreateReplyDto } from '../dto/reply.dto';
import { ReplySource } from '../constants/reply.constants';
import { PrismaService } from '../../prisma/prisma.service';

interface SmartleadWebhookPayload {
  leadId: string;
  emailId: string;
  replyContent: string;
  replySubject?: string;
  replyFrom?: string;
  replyTo?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface WebhookHeaders {
  'x-smartlead-signature'?: string;
  'x-webhook-token'?: string;
  'user-agent'?: string;
}

@ApiTags('webhooks')
@Controller('webhooks/replies')
export class ReplyWebhookController {
  private readonly logger = new Logger(ReplyWebhookController.name);

  constructor(
    private readonly replyService: ReplyService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Handle Smartlead reply webhook
   */
  @Post('smartlead')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Smartlead reply webhook' })
  @ApiHeader({ name: 'x-smartlead-signature', description: 'Smartlead webhook signature' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async handleSmartleadWebhook(
    @Body() payload: SmartleadWebhookPayload,
    @Headers() headers: WebhookHeaders,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received Smartlead webhook for lead ${payload.leadId}`);

    try {
      // Validate webhook signature (in production, implement proper signature validation)
      if (!this.validateSmartleadSignature(headers, payload)) {
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // Validate required fields
      if (!payload.leadId || !payload.emailId || !payload.replyContent) {
        throw new BadRequestException('Missing required fields: leadId, emailId, or replyContent');
      }

      // Get lead to resolve companyId
      const lead = await this.prisma.lead.findUnique({
        where: { id: payload.leadId },
        select: { companyId: true },
      });

      if (!lead) {
        throw new BadRequestException('Lead not found');
      }

      // Create reply DTO
      const replyDto: CreateReplyDto = {
        content: payload.replyContent,
        leadId: payload.leadId,
        emailLogId: payload.emailId, // Assuming emailId maps to emailLogId
        source: ReplySource.SMARTLEAD,
        metadata: {
          ...payload.metadata,
          replySubject: payload.replySubject,
          replyFrom: payload.replyFrom,
          replyTo: payload.replyTo,
          timestamp: payload.timestamp,
          webhookSource: 'smartlead',
        },
      };

      // Create the reply (this will trigger classification workflow)
      await this.replyService.create(replyDto, lead.companyId);

      this.logger.log(`Smartlead webhook processed successfully for lead ${payload.leadId}`);
      return {
        success: true,
        message: 'Reply processed successfully',
      };
    } catch (error) {
      this.logger.error(`Error processing Smartlead webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle generic reply webhook
   */
  @Post('generic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle generic reply webhook' })
  @ApiHeader({ name: 'x-webhook-token', description: 'Webhook authentication token' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async handleGenericWebhook(
    @Body() payload: any,
    @Headers() headers: WebhookHeaders,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log('Received generic reply webhook');

    try {
      // Validate webhook token
      if (!this.validateWebhookToken(headers)) {
        throw new UnauthorizedException('Invalid webhook token');
      }

      // Validate required fields
      if (!payload.leadId || !payload.emailLogId || !payload.content) {
        throw new BadRequestException('Missing required fields: leadId, emailLogId, or content');
      }

      // Get lead to resolve companyId
      const lead = await this.prisma.lead.findUnique({
        where: { id: payload.leadId },
        select: { companyId: true },
      });

      if (!lead) {
        throw new BadRequestException('Lead not found');
      }

      // Create reply DTO
      const replyDto: CreateReplyDto = {
        content: payload.content,
        leadId: payload.leadId,
        emailLogId: payload.emailLogId,
        source: ReplySource.WEBHOOK,
        metadata: {
          ...payload.metadata,
          webhookSource: 'generic',
          receivedAt: new Date().toISOString(),
        },
      };

      // Create the reply
      await this.replyService.create(replyDto, lead.companyId);

      this.logger.log(`Generic webhook processed successfully for lead ${payload.leadId}`);
      return {
        success: true,
        message: 'Reply processed successfully',
      };
    } catch (error) {
      this.logger.error(`Error processing generic webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle manual reply creation (for testing/debugging)
   */
  @Post('manual')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle manual reply creation' })
  @ApiResponse({ status: 200, description: 'Reply created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async handleManualReply(
    @Body() payload: {
      leadId: string;
      emailLogId: string;
      content: string;
      companyId: string;
      metadata?: Record<string, any>;
    },
  ): Promise<{ success: boolean; message: string; replyId?: string }> {
    this.logger.log(`Creating manual reply for lead ${payload.leadId}`);

    try {
      // Validate required fields
      if (!payload.leadId || !payload.emailLogId || !payload.content || !payload.companyId) {
        throw new BadRequestException('Missing required fields: leadId, emailLogId, content, or companyId');
      }

      // Create reply DTO
      const replyDto: CreateReplyDto = {
        content: payload.content,
        leadId: payload.leadId,
        emailLogId: payload.emailLogId,
        source: ReplySource.MANUAL,
        metadata: {
          ...payload.metadata,
          createdManually: true,
          createdAt: new Date().toISOString(),
        },
      };

      // Create the reply
      const reply = await this.replyService.create(replyDto, payload.companyId);

      this.logger.log(`Manual reply created successfully: ${reply.id}`);
      return {
        success: true,
        message: 'Reply created successfully',
        replyId: reply.id,
      };
    } catch (error) {
      this.logger.error(`Error creating manual reply: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate Smartlead webhook signature
   */
  private validateSmartleadSignature(headers: WebhookHeaders, payload: any): boolean {
    const signature = headers['x-smartlead-signature'];
    
    // In production, implement proper signature validation
    // For now, just check if signature exists
    if (!signature) {
      this.logger.warn('Missing Smartlead webhook signature');
      return false;
    }

    // TODO: Implement proper signature validation using Smartlead's public key
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.SMARTLEAD_WEBHOOK_SECRET)
    //   .update(JSON.stringify(payload))
    //   .digest('hex');
    
    // return crypto.timingSafeEqual(
    //   Buffer.from(signature, 'hex'),
    //   Buffer.from(expectedSignature, 'hex')
    // );

    return true; // Placeholder - always return true for now
  }

  /**
   * Validate webhook token
   */
  private validateWebhookToken(headers: WebhookHeaders): boolean {
    const token = headers['x-webhook-token'];
    
    if (!token) {
      this.logger.warn('Missing webhook token');
      return false;
    }

    // In production, validate against stored tokens
    const expectedToken = process.env.WEBHOOK_TOKEN || 'test-token';
    return token === expectedToken;
  }

  /**
   * Health check endpoint for webhooks
   */
  @Post('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook health check' })
  @ApiResponse({ status: 200, description: 'Webhook service is healthy' })
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
} 