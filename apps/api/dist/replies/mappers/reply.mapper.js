"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyMapper = void 0;
const reply_entity_1 = require("../entities/reply.entity");
const reply_constants_1 = require("../constants/reply.constants");
class ReplyMapper {
    static toEntity(model) {
        if (!model)
            return null;
        return new reply_entity_1.ReplyEntity(model.id, model.content, model.classification, model.leadId, model.emailLogId, model.companyId, model.handledBy, model.source, model.metadata, model.createdAt, model.updatedAt);
    }
    static toDto(entity) {
        if (!entity)
            return null;
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
    static toEntityArray(models) {
        if (!models || !Array.isArray(models))
            return [];
        return models.map(model => this.toEntity(model)).filter((entity) => entity !== null);
    }
    static toDtoArray(entities) {
        if (!entities || !Array.isArray(entities))
            return [];
        return entities.map(entity => this.toDto(entity)).filter((dto) => dto !== null);
    }
    static toEntityWithRelations(model) {
        if (!model)
            return null;
        const entity = this.toEntity(model);
        if (!entity)
            return null;
        if (model.lead) {
        }
        if (model.emailLog) {
        }
        return entity;
    }
    static toCreateData(dto, companyId) {
        return {
            content: dto.content,
            leadId: dto.leadId,
            emailLogId: dto.emailLogId,
            companyId,
            source: dto.source || reply_constants_1.ReplySource.MANUAL,
            metadata: dto.metadata || null,
            classification: reply_constants_1.ReplyClassification.NEUTRAL,
            handledBy: null,
        };
    }
    static toUpdateData(dto) {
        const updateData = {};
        if (dto.content !== undefined)
            updateData.content = dto.content;
        if (dto.classification !== undefined)
            updateData.classification = dto.classification;
        if (dto.handledBy !== undefined)
            updateData.handledBy = dto.handledBy;
        if (dto.metadata !== undefined)
            updateData.metadata = dto.metadata;
        return updateData;
    }
    static toWorkflowUpdateData(workflowData) {
        const updateData = {};
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
    static createStatsSummary(replies) {
        const total = replies.length;
        const byClassification = {
            [reply_constants_1.ReplyClassification.INTERESTED]: 0,
            [reply_constants_1.ReplyClassification.NOT_INTERESTED]: 0,
            [reply_constants_1.ReplyClassification.AUTO_REPLY]: 0,
            [reply_constants_1.ReplyClassification.UNSUBSCRIBE]: 0,
            [reply_constants_1.ReplyClassification.QUESTION]: 0,
            [reply_constants_1.ReplyClassification.NEUTRAL]: 0,
        };
        const bySource = {
            [reply_constants_1.ReplySource.SMARTLEAD]: 0,
            [reply_constants_1.ReplySource.MANUAL]: 0,
            [reply_constants_1.ReplySource.WEBHOOK]: 0,
        };
        let recentCount = 0;
        let totalSentimentScore = 0;
        let positiveCount = 0;
        replies.forEach(reply => {
            byClassification[reply.classification]++;
            bySource[reply.source]++;
            if (reply.isRecent)
                recentCount++;
            totalSentimentScore += reply.sentimentScore;
            if (reply.isInterested)
                positiveCount++;
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
exports.ReplyMapper = ReplyMapper;
//# sourceMappingURL=reply.mapper.js.map