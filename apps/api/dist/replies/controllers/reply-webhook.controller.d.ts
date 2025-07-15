import { ReplyService } from '../services/reply.service';
import { PrismaService } from '../../prisma/prisma.service';
interface SmartleadWebhookPayload {
    leadId: string;
    emailId: string;
    replyContent: string;
    replySubject?: string;
    replyFrom?: string;
    replyTo?: string;
    timestamp?: string;
    metadata?: Record<string, any>;
}
interface WebhookHeaders {
    'x-smartlead-signature'?: string;
    'x-webhook-token'?: string;
    'user-agent'?: string;
}
export declare class ReplyWebhookController {
    private readonly replyService;
    private readonly prisma;
    private readonly logger;
    constructor(replyService: ReplyService, prisma: PrismaService);
    handleSmartleadWebhook(payload: SmartleadWebhookPayload, headers: WebhookHeaders): Promise<{
        success: boolean;
        message: string;
    }>;
    handleGenericWebhook(payload: any, headers: WebhookHeaders): Promise<{
        success: boolean;
        message: string;
    }>;
    handleManualReply(payload: {
        leadId: string;
        emailLogId: string;
        content: string;
        companyId: string;
        metadata?: Record<string, any>;
    }): Promise<{
        success: boolean;
        message: string;
        replyId?: string;
    }>;
    private validateSmartleadSignature;
    private validateWebhookToken;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
export {};
