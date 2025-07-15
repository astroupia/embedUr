import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { ReplyRepository } from '../repositories/reply.repository';
import { LeadEventsService } from '../../leads/services/lead-events.service';
import { ReplyEntity } from '../entities/reply.entity';
import { CreateReplyDto, UpdateReplyDto, ReplyQueryDto, ReplyResponseDto, ReplyStatsDto } from '../dto/reply.dto';
import { ReplyMapper } from '../mappers/reply.mapper';
import { ReplySource } from '../constants/reply.constants';
import { $Enums } from '../../../generated/prisma';

@Injectable()
export class ReplyService {
  private readonly logger = new Logger(ReplyService.name);

  constructor(
    private readonly replyRepository: ReplyRepository,
    private readonly leadEvents: LeadEventsService,
  ) {}

  /**
   * Create new reply
   */
  async create(createDto: CreateReplyDto, companyId: string): Promise<ReplyResponseDto> {
    this.logger.log(`Creating reply for company ${companyId}`);

    const reply = await this.replyRepository.create(createDto, companyId);

    // Trigger AI classification workflow
    await this.triggerReplyClassification(reply);

    // Log the creation
    await this.leadEvents.logExecution(reply, 'REPLY_CREATED', {
      leadId: reply.leadId,
      emailLogId: reply.emailLogId,
      contentLength: reply.content.length,
    });

    this.logger.log(`Reply created successfully: ${reply.id}`);
    const responseDto = ReplyMapper.toDto(reply);
    if (!responseDto) {
      throw new Error('Failed to create reply DTO');
    }
    return responseDto;
  }

  /**
   * Find replies with pagination and filtering
   */
  async findAll(companyId: string, query: ReplyQueryDto): Promise<{
    data: ReplyResponseDto[];
    nextCursor: string | null;
  }> {
    this.logger.log(`Fetching replies for company ${companyId} with cursor: ${query.cursor}`);
    
    const result = await this.replyRepository.findWithCursor(companyId, query);
    
    this.logger.log(`Found ${result.data.length} replies for company ${companyId}`);
    return {
      data: ReplyMapper.toDtoArray(result.data),
      nextCursor: result.nextCursor,
    };
  }

  /**
   * Find reply by ID
   */
  async findOne(id: string, companyId: string): Promise<ReplyResponseDto> {
    this.logger.log(`Fetching reply ${id} for company ${companyId}`);
    
    const reply = await this.replyRepository.findOne(id, companyId);
    
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }
    
    this.logger.log(`Reply ${id} found successfully`);
    const responseDto = ReplyMapper.toDto(reply);
    if (!responseDto) {
      throw new Error('Failed to create reply DTO');
    }
    return responseDto;
  }

  /**
   * Update reply
   */
  async update(id: string, companyId: string, updateDto: UpdateReplyDto): Promise<ReplyResponseDto> {
    this.logger.log(`Updating reply ${id} for company ${companyId}`);

    // Get current reply to check if it can be updated
    const currentReply = await this.replyRepository.findOne(id, companyId);
    if (!currentReply) {
      throw new NotFoundException('Reply not found');
    }

    if (!currentReply.canBeUpdated()) {
      throw new ConflictException('Reply has already been handled and cannot be updated');
    }

    // Update the reply
    const updatedReply = await this.replyRepository.update(id, companyId, updateDto);

    // Log the update
    await this.leadEvents.logExecution(updatedReply, 'REPLY_UPDATED', {
      previousClassification: currentReply.classification,
      newClassification: updatedReply.classification,
      handledBy: updateDto.handledBy,
    });

    this.logger.log(`Reply ${id} updated successfully`);
    const responseDto = ReplyMapper.toDto(updatedReply);
    if (!responseDto) {
      throw new Error('Failed to create reply DTO');
    }
    return responseDto;
  }

  /**
   * Remove reply
   */
  async remove(id: string, companyId: string): Promise<void> {
    this.logger.log(`Removing reply ${id} for company ${companyId}`);

    // Get reply before deletion for logging
    const reply = await this.replyRepository.findOne(id, companyId);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Remove the reply
    await this.replyRepository.remove(id, companyId);

    // Log the deletion
    await this.leadEvents.logExecution(reply, 'REPLY_DELETED', {
      leadId: reply.leadId,
      emailLogId: reply.emailLogId,
      classification: reply.classification,
    });

    this.logger.log(`Reply ${id} removed successfully`);
  }

  /**
   * Find replies by lead
   */
  async findByLead(leadId: string, companyId: string): Promise<ReplyResponseDto[]> {
    this.logger.log(`Fetching replies for lead ${leadId} in company ${companyId}`);
    
    const replies = await this.replyRepository.findByLead(leadId, companyId);
    
    this.logger.log(`Found ${replies.length} replies for lead ${leadId}`);
    return ReplyMapper.toDtoArray(replies);
  }

  /**
   * Find replies by email log
   */
  async findByEmailLog(emailLogId: string, companyId: string): Promise<ReplyResponseDto[]> {
    this.logger.log(`Fetching replies for email log ${emailLogId} in company ${companyId}`);
    
    const replies = await this.replyRepository.findByEmailLog(emailLogId, companyId);
    
    this.logger.log(`Found ${replies.length} replies for email log ${emailLogId}`);
    return ReplyMapper.toDtoArray(replies);
  }

  /**
   * Find replies by classification
   */
  async findByClassification(classification: $Enums.ReplyClassification, companyId: string): Promise<ReplyResponseDto[]> {
    this.logger.log(`Fetching replies with classification ${classification} in company ${companyId}`);
    
    const replies = await this.replyRepository.findByClassification(classification, companyId);
    
    this.logger.log(`Found ${replies.length} replies with classification ${classification}`);
    return ReplyMapper.toDtoArray(replies);
  }

  /**
   * Find replies requiring attention
   */
  async findRequiringAttention(companyId: string): Promise<ReplyResponseDto[]> {
    this.logger.log(`Fetching replies requiring attention in company ${companyId}`);
    
    const replies = await this.replyRepository.findRequiringAttention(companyId);
    
    this.logger.log(`Found ${replies.length} replies requiring attention`);
    return ReplyMapper.toDtoArray(replies);
  }

  /**
   * Get reply statistics
   */
  async getStats(companyId: string): Promise<ReplyStatsDto> {
    this.logger.log(`Fetching reply stats for company ${companyId}`);

    const stats = await this.replyRepository.getStats(companyId);

    this.logger.log(`Reply stats for company ${companyId}: total=${stats.total}`);
    return stats;
  }

  /**
   * Handle workflow completion for reply classification
   */
  async handleWorkflowCompletion(workflowData: {
    replyId: string;
    companyId: string;
    replySentiment: $Enums.ReplyClassification;
    meetingLink?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    this.logger.log(`Handling workflow completion for reply ${workflowData.replyId}`);

    const { replyId, companyId, replySentiment, meetingLink, metadata } = workflowData;

    // Update reply with classification
    const updatedReply = await this.replyRepository.updateWithWorkflowData(replyId, companyId, {
      replySentiment,
      handledBy: 'AI',
      metadata: {
        ...metadata,
        workflowCompletedAt: new Date().toISOString(),
      },
    });

    // Log the classification
    await this.leadEvents.logExecution(updatedReply, 'REPLY_CLASSIFIED', {
      classification: replySentiment,
      meetingLink: meetingLink || null,
    });

    // If positive reply and meeting link provided, create booking
    if (replySentiment === $Enums.ReplyClassification.INTERESTED && meetingLink) {
      await this.createBookingFromReply(updatedReply, meetingLink, metadata);
    }

    this.logger.log(`Workflow completion handled for reply ${replyId}`);
  }

  /**
   * Trigger reply classification workflow
   */
  private async triggerReplyClassification(reply: ReplyEntity): Promise<void> {
    this.logger.log(`Triggering reply classification for reply ${reply.id}`);

    try {
      // This would typically call the lead events service to trigger the n8n workflow
      // For now, we'll just log that we would trigger it
      this.logger.log(`Would trigger reply classification workflow for reply ${reply.id}`);
      
      // In a real implementation, you would call:
      // await this.leadEvents.triggerReplyClassification(reply);
    } catch (error) {
      this.logger.error(`Failed to trigger reply classification for reply ${reply.id}:`, error);
      // Don't throw - the reply was created successfully, just the classification failed
    }
  }

  /**
   * Create booking from positive reply
   */
  private async createBookingFromReply(
    reply: ReplyEntity,
    meetingLink: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Creating booking from positive reply ${reply.id}`);

    try {
      // This would typically create a booking via the booking service
      // For now, we'll just log that we would create it
      this.logger.log(`Would create booking for reply ${reply.id} with meeting link: ${meetingLink}`);
      
      // In a real implementation, you would call:
      // await this.bookingService.createFromReply(reply, meetingLink, metadata);
    } catch (error) {
      this.logger.error(`Failed to create booking from reply ${reply.id}:`, error);
      // Don't throw - the reply classification was successful, just the booking failed
    }
  }

  /**
   * Classify reply manually
   */
  async classifyReply(id: string, companyId: string, classification: $Enums.ReplyClassification, handledBy: string): Promise<ReplyResponseDto> {
    this.logger.log(`Manually classifying reply ${id} as ${classification} by ${handledBy}`);

    const updatedReply = await this.replyRepository.update(id, companyId, {
      classification,
      handledBy,
    });

    // Log the manual classification
    await this.leadEvents.logExecution(updatedReply, 'REPLY_MANUALLY_CLASSIFIED', {
      classification,
      handledBy,
    });

    this.logger.log(`Reply ${id} classified successfully`);
    const responseDto = ReplyMapper.toDto(updatedReply);
    if (!responseDto) {
      throw new Error('Failed to create reply DTO');
    }
    return responseDto;
  }

  /**
   * Get reply priority for handling
   */
  async getReplyPriority(replyId: string, companyId: string): Promise<'high' | 'medium' | 'low'> {
    const reply = await this.replyRepository.findOne(replyId, companyId);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    return reply.priority;
  }

  /**
   * Mark reply as handled
   */
  async markAsHandled(id: string, companyId: string, handledBy: string): Promise<ReplyResponseDto> {
    const updatedReply = await this.replyRepository.update(id, companyId, {
      handledBy,
    });

    // Log the handling
    await this.leadEvents.logExecution(updatedReply, 'REPLY_MARKED_AS_HANDLED', {
      handledBy,
    });

    const responseDto = ReplyMapper.toDto(updatedReply);
    if (!responseDto) {
      throw new Error('Failed to create reply DTO');
    }
    return responseDto;
  }
} 