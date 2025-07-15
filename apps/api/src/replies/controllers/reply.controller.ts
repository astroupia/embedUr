import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReplyService } from '../services/reply.service';
import {
  CreateReplyDto,
  UpdateReplyDto,
  ReplyQueryDto,
  ReplyResponseDto,
  ReplyStatsDto,
} from '../dto/reply.dto';
import { $Enums } from '../../../generated/prisma';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('replies')
@Controller('replies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReplyController {
  private readonly logger = new Logger(ReplyController.name);

  constructor(private readonly replyService: ReplyService) {}

  /**
   * Mark reply as handled
   */
  @Put('mark-handled/:id')
  @ApiOperation({ summary: 'Mark reply as handled' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply marked as handled', type: ReplyResponseDto })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @ApiResponse({ status: 409, description: 'Reply already handled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAsHandled(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ReplyResponseDto> {
    return this.replyService.markAsHandled(id, user.companyId, user.id);
  }

  /**
   * Manually classify a reply
   */
  @Post(':id/classify')
  @ApiOperation({ summary: 'Manually classify a reply' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply classified successfully', type: ReplyResponseDto })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @ApiResponse({ status: 409, description: 'Reply cannot be classified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async classifyReply(
    @Param('id') id: string,
    @Body() body: { classification: $Enums.ReplyClassification },
    @CurrentUser() user: any,
  ): Promise<ReplyResponseDto> {
    this.logger.log(`Classifying reply ${id} as ${body.classification} by user ${user.id}`);
    this.logger.log(`Classify endpoint called with body:`, body);
    return this.replyService.classifyReply(id, user.companyId, body.classification, user.id);
  }

  /**
   * Create a new reply
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reply' })
  @ApiResponse({ status: 201, description: 'Reply created successfully', type: ReplyResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() dto: CreateReplyDto,
    @CurrentUser() user: any,
  ): Promise<ReplyResponseDto> {
    this.logger.log(`Creating reply for user ${user.id} in company ${user.companyId}`);
    this.logger.log(`Create endpoint called with body:`, dto);
    return this.replyService.create(dto, user.companyId);
  }

  /**
   * Get all replies with pagination and filtering
   */
  @Get()
  @ApiOperation({ summary: 'Get all replies with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: ReplyQueryDto,
    @CurrentUser() user: any,
  ): Promise<{ data: ReplyResponseDto[]; nextCursor: string | null }> {
    this.logger.log(`Fetching replies for user ${user.id} in company ${user.companyId}`);
    return this.replyService.findAll(user.companyId, query);
  }

  /**
   * Get replies by lead
   */
  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get replies by lead ID' })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully', type: [ReplyResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByLead(
    @Param('leadId') leadId: string,
    @CurrentUser() user: any,
  ): Promise<ReplyResponseDto[]> {
    this.logger.log(`Fetching replies for lead ${leadId} in company ${user.companyId}`);
    return this.replyService.findByLead(leadId, user.companyId);
  }

  /**
   * Get replies by email log
   */
  @Get('email-log/:emailLogId')
  @ApiOperation({ summary: 'Get replies by email log ID' })
  @ApiParam({ name: 'emailLogId', description: 'Email log ID' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully', type: [ReplyResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByEmailLog(
    @Param('emailLogId') emailLogId: string,
    @CurrentUser() user: any,
  ): Promise<ReplyResponseDto[]> {
    this.logger.log(`Fetching replies for email log ${emailLogId} in company ${user.companyId}`);
    return this.replyService.findByEmailLog(emailLogId, user.companyId);
  }

  /**
   * Get replies by classification
   */
  @Get('classification/:classification')
  @ApiOperation({ summary: 'Get replies by classification' })
  @ApiParam({ name: 'classification', description: 'Reply classification', enum: $Enums.ReplyClassification })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully', type: [ReplyResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByClassification(
    @Param('classification') classification: $Enums.ReplyClassification,
    @CurrentUser() user: any,
  ): Promise<ReplyResponseDto[]> {
    this.logger.log(`Fetching replies with classification ${classification} in company ${user.companyId}`);
    return this.replyService.findByClassification(classification, user.companyId);
  }

  /**
   * Get replies requiring attention
   */
  @Get('attention/required')
  @ApiOperation({ summary: 'Get replies requiring attention' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully', type: [ReplyResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findRequiringAttention(@CurrentUser() user: any): Promise<ReplyResponseDto[]> {
    this.logger.log(`Fetching replies requiring attention in company ${user.companyId}`);
    return this.replyService.findRequiringAttention(user.companyId);
  }

  /**
   * Get reply statistics
   */
  @Get('stats/overview')
  @ApiOperation({ summary: 'Get reply statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: ReplyStatsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@CurrentUser() user: any): Promise<ReplyStatsDto> {
    this.logger.log(`Fetching reply stats for company ${user.companyId}`);
    return this.replyService.getStats(user.companyId);
  }

  /**
   * Get reply priority
   */
  @Get(':id/priority')
  @ApiOperation({ summary: 'Get reply priority' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Priority retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReplyPriority(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ priority: 'high' | 'medium' | 'low' }> {
    this.logger.log(`Getting priority for reply ${id} in company ${user.companyId}`);
    const priority = await this.replyService.getReplyPriority(id, user.companyId);
    return { priority };
  }

  /**
   * Get reply by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get reply by ID' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply retrieved successfully', type: ReplyResponseDto })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ReplyResponseDto> {
    this.logger.log(`Fetching reply ${id} for user ${user.id} in company ${user.companyId}`);
    return this.replyService.findOne(id, user.companyId);
  }

  /**
   * Update reply
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update reply' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply updated successfully', type: ReplyResponseDto })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @ApiResponse({ status: 409, description: 'Reply cannot be updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReplyDto,
    @CurrentUser() user: any,
  ): Promise<ReplyResponseDto> {
    this.logger.log(`Updating reply ${id} for user ${user.id} in company ${user.companyId}`);
    return this.replyService.update(id, user.companyId, dto);
  }

  /**
   * Delete reply
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete reply' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 204, description: 'Reply deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    this.logger.log(`Removing reply ${id} for user ${user.id} in company ${user.companyId}`);
    return this.replyService.remove(id, user.companyId);
  }
} 