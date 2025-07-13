import { N8nWebhookEventEntity } from '../entities/n8n-webhook-event.entity';
import { $Enums } from '../../../generated/prisma';

export class N8nWebhookEventMapper {
  /**
   * Map Prisma webhook event to entity
   */
  static toEntity(prisma: any): N8nWebhookEventEntity {
    return new N8nWebhookEventEntity(
      prisma.id,
      prisma.source,
      prisma.payload,
      prisma.companyId,
      prisma.receivedAt,
    );
  }

  /**
   * Map entity to Prisma create data
   */
  static toPrismaCreate(entity: N8nWebhookEventEntity): {
    source: $Enums.WebhookSource;
    payload: Record<string, any>;
    companyId: string;
  } {
    return {
      source: entity.source,
      payload: entity.payload,
      companyId: entity.companyId,
    };
  }

  /**
   * Map multiple Prisma webhook events to entities
   */
  static toEntities(prismaEvents: any[]): N8nWebhookEventEntity[] {
    return prismaEvents.map(this.toEntity);
  }

  /**
   * Map entity to response DTO
   */
  static toResponseDto(entity: N8nWebhookEventEntity): {
    id: string;
    source: string;
    workflowType: string | null;
    leadId: string | null;
    workflowId: string | null;
    status: string | null;
    companyId: string;
    receivedAt: string;
  } {
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

  /**
   * Map multiple entities to response DTOs
   */
  static toResponseDtos(entities: N8nWebhookEventEntity[]): ReturnType<typeof this.toResponseDto>[] {
    return entities.map(this.toResponseDto);
  }
} 