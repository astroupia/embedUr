import { PrismaService } from '../prisma/prisma.service';
import { AdminActionLogEntity } from './entities/admin-action-log.entity';
import { CompanyStatus, SystemNotificationLevel } from '../constants/enums';
export declare class AdminRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllCompanies(page?: number, limit?: number, status?: CompanyStatus, search?: string): Promise<{
        companies: any[];
        total: number;
    }>;
    findCompanyById(id: string): Promise<any>;
    updateCompanyStatus(id: string, status: CompanyStatus, reason?: string): Promise<any>;
    updateCompanyPlan(id: string, planId: string): Promise<any>;
    findCompanyUsers(companyId: string): Promise<any[]>;
    getGlobalUsageMetrics(): Promise<any>;
    getTopPerformingCompanies(limit?: number): Promise<any[]>;
    createSystemNotification(data: {
        message: string;
        level: SystemNotificationLevel;
        companyIds?: string[];
    }): Promise<any[]>;
    findSystemNotifications(page?: number, limit?: number): Promise<{
        notifications: any[];
        total: number;
    }>;
    createActionLog(data: {
        action: string;
        targetType: string;
        targetId: string;
        performedBy: string;
        details?: Record<string, any>;
    }): Promise<AdminActionLogEntity>;
    findActionLogs(filters: {
        action?: string;
        targetType?: string;
        targetId?: string;
        performedBy?: string;
        startDate?: Date;
        endDate?: Date;
    }, page?: number, limit?: number): Promise<{
        logs: AdminActionLogEntity[];
        total: number;
    }>;
    getPlatformHealth(): Promise<any>;
    private mapToEntity;
    private formatPeriod;
}
