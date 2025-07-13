import { N8nRepository } from '../repositories/n8n.repository';
import { AuditTrailService } from '../../workflows/services/audit-trail.service';
import { $Enums } from '../../../generated/prisma';
export declare class N8nService {
    private readonly n8nRepository;
    private readonly auditTrailService;
    private readonly logger;
    constructor(n8nRepository: N8nRepository, auditTrailService: AuditTrailService);
    logWebhookEvent(data: {
        source: $Enums.WebhookSource;
        payload: Record<string, any>;
        companyId: string;
    }): Promise<void>;
    getWebhookEvents(companyId: string, limit?: number): Promise<any[]>;
    getWebhookEventsBySource(source: $Enums.WebhookSource, companyId: string, limit?: number): Promise<any[]>;
    getUsageMetrics(companyId: string, period?: string): Promise<any[]>;
    createSystemNotification(data: {
        message: string;
        level: $Enums.SystemNotificationLevel;
        companyId: string;
    }): Promise<void>;
    getSystemNotifications(companyId: string, limit?: number): Promise<any[]>;
    markNotificationAsRead(notificationId: string, companyId: string): Promise<void>;
    cleanupOldData(): Promise<{
        webhookEvents: number;
        usageMetrics: number;
    }>;
    getDashboardData(companyId: string): Promise<{
        recentWebhooks: any[];
        recentNotifications: any[];
        usageMetrics: any[];
    }>;
    handleWebhookError(source: $Enums.WebhookSource, companyId: string, error: Error, payload?: Record<string, any>): Promise<void>;
}
