import { $Enums } from '../../../generated/prisma';
export declare class N8nWebhookEventEntity {
    readonly id: string;
    readonly source: $Enums.WebhookSource;
    readonly payload: Record<string, any>;
    readonly companyId: string;
    readonly receivedAt: Date;
    constructor(id: string, source: $Enums.WebhookSource, payload: Record<string, any>, companyId: string, receivedAt: Date);
    static create(source: $Enums.WebhookSource, payload: Record<string, any>, companyId: string): {
        source: $Enums.WebhookSource;
        payload: Record<string, any>;
        companyId: string;
    };
    getWorkflowType(): string | null;
    getLeadId(): string | null;
    getWorkflowId(): string | null;
    isWorkflowCompletion(): boolean;
    isReplyHandling(): boolean;
    getStatus(): string | null;
    getErrorMessage(): string | null;
    getOutputData(): Record<string, any> | null;
    validatePayload(): boolean;
    getAuditTrailData(): {
        action: string;
        details: Record<string, any>;
    };
}
