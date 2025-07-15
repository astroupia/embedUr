import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EnrichmentService } from '../services/enrichment.service';
import { TriggerEnrichmentDto, RetryEnrichmentDto } from '../dto/enrichment.dto';
import { QueryEnrichmentCursorDto } from '../dto/query-enrichment-cursor.dto';
import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
import { EnrichmentProvider } from '../constants/enrichment.constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CompleteEnrichmentDto } from '../dto/complete-enrichment.dto';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { EnrichmentRepository } from '../repositories/enrichment.repository';
import { EnrichmentStatus } from '../constants/enrichment.constants';

interface CurrentUserPayload {
  userId: string;
  companyId: string;
  role: string;
}

@ApiTags('enrichment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrichment')
export class EnrichmentController {
  private readonly logger = new Logger(EnrichmentController.name);

  constructor(
    private readonly enrichmentService: EnrichmentService,
    private readonly enrichmentRepository: EnrichmentRepository,
  ) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger enrichment for a lead' })
  @ApiResponse({
    status: 201,
    description: 'Enrichment triggered successfully',
    type: EnrichmentRequestEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async triggerEnrichment(
    @Body() triggerEnrichmentDto: TriggerEnrichmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<EnrichmentRequestEntity> {
    return this.enrichmentService.triggerEnrichment(
      triggerEnrichmentDto,
      user.companyId,
      user.userId,
    );
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed enrichment' })
  @ApiParam({ name: 'id', description: 'Enrichment Request ID' })
  @ApiResponse({
    status: 200,
    description: 'Enrichment retry started successfully',
    type: EnrichmentRequestEntity,
  })
  @ApiResponse({ status: 400, description: 'Enrichment cannot be retried' })
  @ApiResponse({ status: 404, description: 'Enrichment request not found' })
  async retryEnrichment(
    @Param('id') id: string,
    @Body() retryEnrichmentDto: RetryEnrichmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<EnrichmentRequestEntity> {
    return this.enrichmentService.retryEnrichment(
      id,
      user.companyId,
      retryEnrichmentDto,
      user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all enrichment requests with cursor-based pagination' })
  @ApiResponse({
    status: 200,
    description: 'Enrichment requests retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/EnrichmentRequestEntity' },
        },
        nextCursor: {
          type: 'string',
          nullable: true,
        },
      },
    },
  })
  async findAll(
    @Query() query: QueryEnrichmentCursorDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ data: EnrichmentRequestEntity[]; nextCursor: string | null }> {
    return this.enrichmentService.findAll(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get enrichment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Enrichment statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        successful: { type: 'number' },
        failed: { type: 'number' },
        pending: { type: 'number' },
        byProvider: {
          type: 'object',
          properties: {
            APOLLO: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                successful: { type: 'number' },
                failed: { type: 'number' },
              },
            },
            DROP_CONTACT: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                successful: { type: 'number' },
                failed: { type: 'number' },
              },
            },
            CLEARBIT: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                successful: { type: 'number' },
                failed: { type: 'number' },
              },
            },
          },
        },
        averageDurationSeconds: { type: 'number' },
      },
    },
  })
  async getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.enrichmentService.getStats(user.companyId);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get enrichment requests for a specific lead' })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({
    status: 200,
    description: 'Enrichment requests retrieved successfully',
    type: [EnrichmentRequestEntity],
  })
  async findByLead(
    @Param('leadId') leadId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<EnrichmentRequestEntity[]> {
    return this.enrichmentService.findByLead(leadId, user.companyId);
  }

  @Get('provider/:provider')
  @ApiOperation({ summary: 'Get enrichment requests by provider' })
  @ApiParam({ name: 'provider', enum: EnrichmentProvider })
  @ApiResponse({
    status: 200,
    description: 'Enrichment requests retrieved successfully',
    type: [EnrichmentRequestEntity],
  })
  async findByProvider(
    @Param('provider') provider: EnrichmentProvider,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<EnrichmentRequestEntity[]> {
    return this.enrichmentService.findByProvider(provider, user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an enrichment request by ID' })
  @ApiParam({ name: 'id', description: 'Enrichment Request ID' })
  @ApiResponse({
    status: 200,
    description: 'Enrichment request retrieved successfully',
    type: EnrichmentRequestEntity,
  })
  @ApiResponse({ status: 404, description: 'Enrichment request not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<EnrichmentRequestEntity> {
    return this.enrichmentService.findOne(id, user.companyId);
  }

  @Post('complete')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle enrichment completion webhook' })
  @ApiResponse({ status: 200, description: 'Enrichment completion processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CompleteEnrichmentDto })
  async handleEnrichmentComplete(@Body() dto: CompleteEnrichmentDto): Promise<{ success: boolean }> {
    this.logger.log(`Handling enrichment completion for lead ${dto.leadId}`);

    try {
      // Validate lead exists and belongs to company
      await this.enrichmentRepository.findLeadById(dto.leadId, dto.companyId);

      if (dto.status === EnrichmentStatus.SUCCESS && dto.outputData) {
        await this.updateLeadWithEnrichedData(dto.leadId, dto.companyId, dto.outputData);
        await this.updateEnrichmentRequest(dto.leadId, dto.companyId, dto);
        await this.logEnrichmentCompletion(dto.leadId, dto.companyId, dto);
      } else if (dto.status === EnrichmentStatus.FAILED) {
        await this.handleFailedEnrichment(dto.leadId, dto.companyId, dto.errorMessage);
      }

      this.logger.log(`Enrichment completion handled successfully for lead ${dto.leadId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to handle enrichment completion for lead ${dto.leadId}:`, error);
      throw new BadRequestException('Failed to process enrichment completion');
    }
  }

  private async updateLeadWithEnrichedData(
    leadId: string,
    companyId: string,
    outputData: any,
  ): Promise<void> {
    this.logger.log(`Updating lead ${leadId} with enriched data`);

    const enrichmentData = {
      ...outputData,
      lastEnrichedAt: new Date().toISOString(),
    };

    await this.enrichmentRepository.updateLeadEnrichmentData(leadId, companyId, enrichmentData);
  }

  private async updateEnrichmentRequest(
    leadId: string,
    companyId: string,
    dto: CompleteEnrichmentDto,
  ): Promise<void> {
    this.logger.log(`Updating enrichment request for lead ${leadId}`);

    const enrichmentRequest = await this.enrichmentRepository.findEnrichmentRequestByLead(leadId, companyId);

    if (enrichmentRequest) {
      await this.enrichmentRepository.updateEnrichmentRequestStatus(
        enrichmentRequest.id,
        companyId,
        dto.status,
        dto.outputData,
        dto.errorMessage,
      );
    } else {
      this.logger.warn(`No enrichment request found for lead ${leadId}`);
    }
  }

  private async handleFailedEnrichment(
    leadId: string,
    companyId: string,
    errorMessage?: string,
  ): Promise<void> {
    this.logger.log(`Handling failed enrichment for lead ${leadId}`);

    const enrichmentRequest = await this.enrichmentRepository.findEnrichmentRequestByLead(leadId, companyId);

    if (enrichmentRequest) {
      await this.enrichmentRepository.updateEnrichmentRequestStatus(
        enrichmentRequest.id,
        companyId,
        EnrichmentStatus.FAILED,
        undefined,
        errorMessage,
      );
    }

    await this.logEnrichmentCompletion(leadId, companyId, {
      leadId,
      companyId,
      status: EnrichmentStatus.FAILED,
      errorMessage,
    } as CompleteEnrichmentDto);
  }

  private async logEnrichmentCompletion(
    leadId: string,
    companyId: string,
    dto: CompleteEnrichmentDto,
  ): Promise<void> {
    this.logger.log(`Logging enrichment completion for lead ${leadId}`);

    const action = dto.status === EnrichmentStatus.SUCCESS ? 'Enrichment completed successfully' : 'Enrichment failed';
    const changes = {
      status: dto.status,
      outputData: dto.outputData,
      errorMessage: dto.errorMessage,
    };

    await this.enrichmentRepository.createAuditTrail(
      leadId,
      action,
      changes,
      companyId,
    );
  }
} 