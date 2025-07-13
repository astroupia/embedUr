import { ReplyEntity } from '../entities/reply.entity';
import { ReplyClassification, ReplySource } from '../constants/reply.constants';
import { ReplyResponseDto } from '../dto/reply.dto';

export class ReplyMapper {
  /**
   * Map Prisma model to ReplyEntity
   */
  static toEntity(model: any): ReplyEntity | null {
    if (!model) return null;

    return new ReplyEntity(
      model.id,
      model.content,
      model.classification as ReplyClassification,
      model.leadId,
      model.emailLogId,
      model.companyId,
      model.handledBy,
      model.source as ReplySource,
      model.metadata,
      model.createdAt,
      model.updatedAt,
    );
  }

  /**
   * Map ReplyEntity to DTO
   */
  static toDto(entity: ReplyEntity): ReplyResponseDto | null {
    if (!entity) return null;

    return {
      id: entity.id,
      content: entity.content,
      classification: entity.classification,
      leadId: entity.leadId,
      emailLogId: entity.emailLogId,
      companyId: entity.companyId,
      handledBy: entity.handledBy,
      source: entity.source,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      // Computed properties
      isInterested: entity.isInterested,
      isNegative: entity.isNegative,
      isNeutral: entity.isNeutral,
      isAutoReply: entity.isAutoReply,
      sentimentScore: entity.sentimentScore,
      requiresAttention: entity.requiresAttention,
      summary: entity.summary,
      priority: entity.priority,
      isRecent: entity.isRecent,
    };
  }

  /**
   * Map array of Prisma models to ReplyEntity array
   */
  static toEntityArray(models: any[]): ReplyEntity[] {
    if (!models || !Array.isArray(models)) return [];
    return models.map(model => this.toEntity(model)).filter((entity): entity is ReplyEntity => entity !== null);
  }

  /**
   * Map array of ReplyEntity to DTO array
   */
  static toDtoArray(entities: ReplyEntity[]): ReplyResponseDto[] {
    if (!entities || !Array.isArray(entities)) return [];
    return entities.map(entity => this.toDto(entity)).filter((dto): dto is ReplyResponseDto => dto !== null);
  }

  /**
   * Map Prisma model with relations to ReplyEntity
   */
  static toEntityWithRelations(model: any): ReplyEntity | null {
    if (!model) return null;

    const entity = this.toEntity(model);
    if (!entity) return null;

    // Add any additional logic for handling relations
    // For example, if you need to include lead or email log data
    if (model.lead) {
      // You could add lead information to metadata or create a separate DTO
    }

    if (model.emailLog) {
      // You could add email log information to metadata
    }

    return entity;
  }

  /**
   * Map DTO to Prisma create data
   */
  static toCreateData(dto: any, companyId: string): any {
    return {
      content: dto.content,
      leadId: dto.leadId,
      emailLogId: dto.emailLogId,
      companyId,
      source: dto.source || ReplySource.MANUAL,
      metadata: dto.metadata || null,
      classification: ReplyClassification.NEUTRAL, // Default classification
      handledBy: null, // Will be set when handled
    };
  }

  /**
   * Map DTO to Prisma update data
   */
  static toUpdateData(dto: any): any {
    const updateData: any = {};

    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.classification !== undefined) updateData.classification = dto.classification;
    if (dto.handledBy !== undefined) updateData.handledBy = dto.handledBy;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    return updateData;
  }

  /**
   * Map workflow completion data to update data
   */
  static toWorkflowUpdateData(workflowData: any): any {
    const updateData: any = {};

    if (workflowData.replySentiment) {
      updateData.classification = workflowData.replySentiment;
    }

    if (workflowData.handledBy) {
      updateData.handledBy = workflowData.handledBy;
    }

    if (workflowData.metadata) {
      updateData.metadata = {
        ...updateData.metadata,
        ...workflowData.metadata,
        workflowCompletedAt: new Date().toISOString(),
      };
    }

    return updateData;
  }

  /**
   * Create a summary for reply statistics
   */
  static createStatsSummary(replies: ReplyEntity[]): any {
    const total = replies.length;
    const byClassification = {
      [ReplyClassification.INTERESTED]: 0,
      [ReplyClassification.NOT_INTERESTED]: 0,
      [ReplyClassification.AUTO_REPLY]: 0,
      [ReplyClassification.UNSUBSCRIBE]: 0,
      [ReplyClassification.QUESTION]: 0,
      [ReplyClassification.NEUTRAL]: 0,
    };

    const bySource = {
      [ReplySource.SMARTLEAD]: 0,
      [ReplySource.MANUAL]: 0,
      [ReplySource.WEBHOOK]: 0,
    };

    let recentCount = 0;
    let totalSentimentScore = 0;
    let positiveCount = 0;

    replies.forEach(reply => {
      byClassification[reply.classification]++;
      bySource[reply.source]++;
      
      if (reply.isRecent) recentCount++;
      
      totalSentimentScore += reply.sentimentScore;
      if (reply.isInterested) positiveCount++;
    });

    const averageResponseTime = total > 0 ? totalSentimentScore / total : 0;
    const positiveRate = total > 0 ? (positiveCount / total) * 100 : 0;

    return {
      total,
      byClassification,
      bySource,
      recentCount,
      averageResponseTime,
      positiveRate,
    };
  }
} 