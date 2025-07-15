"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nWebhookEventMapper = void 0;
const n8n_webhook_event_entity_1 = require("../entities/n8n-webhook-event.entity");
class N8nWebhookEventMapper {
    static toEntity(prisma) {
        return new n8n_webhook_event_entity_1.N8nWebhookEventEntity(prisma.id, prisma.source, prisma.payload, prisma.companyId, prisma.receivedAt);
    }
    static toPrismaCreate(entity) {
        return {
            source: entity.source,
            payload: entity.payload,
            companyId: entity.companyId,
        };
    }
    static toEntities(prismaEvents) {
        return prismaEvents.map(this.toEntity);
    }
    static toResponseDto(entity) {
        return {
            id: entity.id,
            source: entity.source,
            workflowType: entity.getWorkflowType(),
            leadId: entity.getLeadId(),
            workflowId: entity.getWorkflowId(),
            status: entity.getStatus(),
            companyId: entity.companyId,
            receivedAt: entity.receivedAt.toISOString(),
        };
    }
    static toResponseDtos(entities) {
        return entities.map(this.toResponseDto);
    }
}
exports.N8nWebhookEventMapper = N8nWebhookEventMapper;
//# sourceMappingURL=n8n-webhook-event.mapper.js.map