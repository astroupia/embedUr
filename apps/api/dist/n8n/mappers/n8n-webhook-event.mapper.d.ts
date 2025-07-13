import { N8nWebhookEventEntity } from '../entities/n8n-webhook-event.entity';
import { $Enums } from '../../../generated/prisma';
export declare class N8nWebhookEventMapper {
    static toEntity(prisma: any): N8nWebhookEventEntity;
    static toPrismaCreate(entity: N8nWebhookEventEntity): {
        source: $Enums.WebhookSource;
        payload: Record<string, any>;
        companyId: string;
    };
    static toEntities(prismaEvents: any[]): N8nWebhookEventEntity[];
    static toResponseDto(entity: N8nWebhookEventEntity): {
        id: string;
        source: string;
        workflowType: string | null;
        leadId: string | null;
        workflowId: string | null;
        status: string | null;
        companyId: string;
        receivedAt: string;
    };
    static toResponseDtos(entities: N8nWebhookEventEntity[]): ReturnType<typeof this.toResponseDto>[];
}
