import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReplyEntity } from '../entities/reply.entity';
import { ReplyMapper } from '../mappers/reply.mapper';
import { CreateReplyDto, UpdateReplyDto, ReplyQueryDto } from '../dto/reply.dto';
import { ReplySource } from '../constants/reply.constants';
import { $Enums } from '../../../generated/prisma';

@Injectable()
export class ReplyRepository {
  private readonly logger = new Logger(ReplyRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new reply
   */
  async create(dto: CreateReplyDto, companyId: string): Promise<ReplyEntity> {
    this.logger.log(`Creating reply for company ${companyId}`);

    const data = ReplyMapper.toCreateData(dto, companyId);
    
    const reply = await this.prisma.reply.create({
      data,
      include: {
        lead: true,
        emailLog: true,
      },
    });

    this.logger.log(`Reply created: ${reply.id}`);
    return ReplyMapper.toEntity(reply)!;
  }

  /**
   * Find reply by ID within company scope
   */
  async findOne(id: string, companyId: string): Promise<ReplyEntity | null> {
    this.logger.log(`Finding reply ${id} in company ${companyId}`);

    const reply = await this.prisma.reply.findFirst({
      where: { id, companyId },
      include: {
        lead: true,
        emailLog: true,
      },
    });

    return reply ? ReplyMapper.toEntity(reply) : null;
  }

  /**
   * Find replies with pagination and filtering
   */
  async findWithCursor(companyId: string, query: ReplyQueryDto): Promise<{
    data: ReplyEntity[];
    nextCursor: string | null;
  }> {
    this.logger.log(`Finding replies for company ${companyId} with cursor: ${query.cursor}`);

    const where: any = { companyId };

    // Apply filters
    if (query.leadId) where.leadId = query.leadId;
    if (query.emailLogId) where.emailLogId = query.emailLogId;
    if (query.classification) where.classification = query.classification;
    if (query.requiresAttention) {
      where.OR = [
        { classification: $Enums.ReplyClassification.INTERESTED },
        { classification: $Enums.ReplyClassification.QUESTION },
      ];
    }
    if (query.recent) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      where.createdAt = { gte: yesterday };
    }

    // Apply cursor pagination
    if (query.cursor) {
      where.id = { gt: query.cursor };
    }

    const limit = query.limit || 10;
    const replies = await this.prisma.reply.findMany({
      where,
      include: {
        lead: true,
        emailLog: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Take one extra to check if there are more
    });

    const hasNext = replies.length > limit;
    const data = replies.slice(0, limit);
    const nextCursor = hasNext ? data[data.length - 1].id : null;

    return {
      data: ReplyMapper.toEntityArray(data),
      nextCursor,
    };
  }

  /**
   * Update reply
   */
  async update(id: string, companyId: string, dto: UpdateReplyDto): Promise<ReplyEntity> {
    const data = ReplyMapper.toUpdateData(dto);
    
    const reply = await this.prisma.reply.update({
      where: { id, companyId },
      data,
      include: {
        lead: true,
        emailLog: true,
      },
    });

    return ReplyMapper.toEntity(reply)!;
  }

  /**
   * Update reply with workflow completion data
   */
  async updateWithWorkflowData(id: string, companyId: string, workflowData: any): Promise<ReplyEntity> {
    this.logger.log(`Updating reply ${id} with workflow data in company ${companyId}`);

    const data = ReplyMapper.toWorkflowUpdateData(workflowData);
    
    const reply = await this.prisma.reply.update({
      where: { id, companyId },
      data,
      include: {
        lead: true,
        emailLog: true,
      },
    });

    this.logger.log(`Reply updated with workflow data: ${reply.id}`);
    return ReplyMapper.toEntity(reply)!;
  }

  /**
   * Delete reply
   */
  async remove(id: string, companyId: string): Promise<void> {
    this.logger.log(`Removing reply ${id} from company ${companyId}`);

    await this.prisma.reply.delete({
      where: { id, companyId },
    });

    this.logger.log(`Reply removed: ${id}`);
  }

  /**
   * Find replies by lead
   */
  async findByLead(leadId: string, companyId: string): Promise<ReplyEntity[]> {
    this.logger.log(`Finding replies for lead ${leadId} in company ${companyId}`);

    const replies = await this.prisma.reply.findMany({
      where: { leadId, companyId },
      include: {
        lead: true,
        emailLog: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ReplyMapper.toEntityArray(replies);
  }

  /**
   * Find replies by email log
   */
  async findByEmailLog(emailLogId: string, companyId: string): Promise<ReplyEntity[]> {
    this.logger.log(`Finding replies for email log ${emailLogId} in company ${companyId}`);

    const replies = await this.prisma.reply.findMany({
      where: { emailLogId, companyId },
      include: {
        lead: true,
        emailLog: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ReplyMapper.toEntityArray(replies);
  }

  /**
   * Find replies by classification
   */
  async findByClassification(classification: $Enums.ReplyClassification, companyId: string): Promise<ReplyEntity[]> {
    this.logger.log(`Finding replies with classification ${classification} in company ${companyId}`);

    const replies = await this.prisma.reply.findMany({
      where: { classification, companyId },
      include: {
        lead: true,
        emailLog: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ReplyMapper.toEntityArray(replies);
  }

  /**
   * Find replies that require attention
   */
  async findRequiringAttention(companyId: string): Promise<ReplyEntity[]> {
    this.logger.log(`Finding replies requiring attention in company ${companyId}`);

    const replies = await this.prisma.reply.findMany({
      where: {
        companyId,
        OR: [
          { classification: $Enums.ReplyClassification.INTERESTED },
          { classification: $Enums.ReplyClassification.QUESTION },
        ],
      },
      include: {
        lead: true,
        emailLog: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ReplyMapper.toEntityArray(replies);
  }

  /**
   * Find recent replies
   */
  async findRecent(companyId: string, days: number = 7): Promise<ReplyEntity[]> {
    this.logger.log(`Finding recent replies for company ${companyId} (last ${days} days)`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const replies = await this.prisma.reply.findMany({
      where: {
        companyId,
        createdAt: { gte: cutoffDate },
      },
      include: {
        lead: true,
        emailLog: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ReplyMapper.toEntityArray(replies);
  }

  /**
   * Count replies by company
   */
  async countByCompany(companyId: string): Promise<number> {
    return this.prisma.reply.count({
      where: { companyId },
    });
  }

  /**
   * Count replies by classification
   */
  async countByClassification(classification: $Enums.ReplyClassification, companyId: string): Promise<number> {
    this.logger.log(`Counting replies with classification ${classification} in company ${companyId}`);

    return this.prisma.reply.count({
      where: { classification, companyId },
    });
  }

  /**
   * Count recent replies
   */
  async countRecent(companyId: string, days: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.prisma.reply.count({
      where: {
        companyId,
        createdAt: { gte: cutoffDate },
      },
    });
  }

  /**
   * Get reply statistics
   */
  async getStats(companyId: string): Promise<any> {
    this.logger.log(`Getting reply stats for company ${companyId}`);

    const [
      total,
      recent,
      classificationStats,
    ] = await Promise.all([
      this.countByCompany(companyId),
      this.countRecent(companyId),
      this.getClassificationStats(companyId),
    ]);

    return {
      total,
      recent,
      byClassification: classificationStats,
    };
  }

  /**
   * Get classification statistics
   */
  private async getClassificationStats(companyId: string): Promise<Record<$Enums.ReplyClassification, number>> {
    const stats = await this.prisma.reply.groupBy({
      by: ['classification'],
      where: { companyId },
      _count: {
        classification: true,
      },
    });

    const result: Record<$Enums.ReplyClassification, number> = {
      [$Enums.ReplyClassification.INTERESTED]: 0,
      [$Enums.ReplyClassification.NOT_INTERESTED]: 0,
      [$Enums.ReplyClassification.AUTO_REPLY]: 0,
      [$Enums.ReplyClassification.UNSUBSCRIBE]: 0,
      [$Enums.ReplyClassification.QUESTION]: 0,
      [$Enums.ReplyClassification.NEUTRAL]: 0,
    };

    for (const stat of stats) {
      result[stat.classification as $Enums.ReplyClassification] = stat._count.classification;
    }

    return result;
  }

  /**
   * Find email log by lead and email ID
   */
  async findEmailLogByLeadAndEmailId(leadId: string, emailId: string, companyId: string): Promise<any> {
    this.logger.log(`Finding email log for lead ${leadId} with email ID ${emailId}`);

    // First try to find by ID (for test cases)
    let emailLog = await this.prisma.emailLog.findFirst({
      where: {
        id: emailId,
        leadId,
        companyId,
      },
    });

    // If not found by ID, try to find by metadata
    if (!emailLog) {
      emailLog = await this.prisma.emailLog.findFirst({
        where: {
          leadId,
          companyId,
          metadata: {
            path: ['emailId'],
            equals: emailId,
          },
        },
      });
    }

    if (!emailLog) {
      throw new Error('Email log not found for this email ID');
    }

    return emailLog;
  }

  /**
   * Create reply with specific data for webhook handling
   */
  async createFromWebhook(data: {
    leadId: string;
    emailLogId: string;
    companyId: string;
    content: string;
    classification?: $Enums.ReplyClassification;
    handledBy?: string;
  }): Promise<ReplyEntity> {
    this.logger.log(`Creating reply from webhook for lead ${data.leadId}`);

    const reply = await this.prisma.reply.create({
      data: {
        leadId: data.leadId,
        emailLogId: data.emailLogId,
        companyId: data.companyId,
        content: data.content,
        classification: data.classification || $Enums.ReplyClassification.QUESTION,
        handledBy: data.handledBy,
      },
      include: {
        lead: true,
        emailLog: true,
      },
    });

    this.logger.log(`Reply created from webhook: ${reply.id}`);
    return ReplyMapper.toEntity(reply)!;
  }

  /**
   * Update reply classification and handler
   */
  async updateClassification(id: string, companyId: string, classification: $Enums.ReplyClassification, handledBy: string): Promise<ReplyEntity> {
    this.logger.log(`Updating reply ${id} classification to ${classification}`);

    const reply = await this.prisma.reply.update({
      where: { id, companyId },
      data: {
        classification,
        handledBy,
      },
      include: {
        lead: true,
        emailLog: true,
      },
    });

    this.logger.log(`Reply classification updated: ${reply.id}`);
    return ReplyMapper.toEntity(reply)!;
  }
} 