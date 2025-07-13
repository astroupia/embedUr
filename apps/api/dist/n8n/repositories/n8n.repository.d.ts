import { PrismaService } from '../../prisma/prisma.service';
import { $Enums } from '../../../generated/prisma';
export declare class N8nRepository {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createWebhookEvent(data: {
        source: $Enums.WebhookSource;
        payload: Record<string, any>;
        companyId: string;
    }): Promise<void>;
    findWebhookEvents(companyId: string, limit?: number): Promise<any[]>;
    findWebhookEventsBySource(source: $Enums.WebhookSource, companyId: string, limit?: number): Promise<any[]>;
    createUsageMetric(data: {
        metricName: string;
        count: number;
        period: string;
        companyId: string;
    }): Promise<void>;
    getUsageMetrics(companyId: string, period: string): Promise<any[]>;
    createSystemNotification(data: {
        message: string;
        level: $Enums.SystemNotificationLevel;
        companyId: string;
    }): Promise<void>;
    findSystemNotifications(companyId: string, limit?: number): Promise<any[]>;
    markNotificationAsRead(notificationId: string, companyId: string): Promise<void>;
    cleanupOldWebhookEvents(daysOld?: number): Promise<number>;
    cleanupOldUsageMetrics(daysOld?: number): Promise<number>;
}
