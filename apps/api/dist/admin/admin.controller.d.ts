import { AdminService } from './admin.service';
import { UpdateCompanyStatusDto, UpdateCompanyPlanDto } from './dto/company-admin.dto';
import { CreateSystemNotificationDto } from './dto/system-notification.dto';
import { AdminActionLogFilterDto } from './dto/admin-action-log.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAllCompanies(page: number, limit: number, status?: string, search?: string): Promise<import("./dto/company-admin.dto").CompanyListResponseDto>;
    getCompanyById(id: string): Promise<import("./dto/company-admin.dto").CompanyAdminResponseDto>;
    updateCompanyStatus(id: string, dto: UpdateCompanyStatusDto, req: any): Promise<import("./dto/company-admin.dto").CompanyAdminResponseDto>;
    updateCompanyPlan(id: string, dto: UpdateCompanyPlanDto, req: any): Promise<import("./dto/company-admin.dto").CompanyAdminResponseDto>;
    getCompanyUsers(id: string): Promise<any[]>;
    getGlobalUsageMetrics(): Promise<import("./dto/global-metrics.dto").GlobalMetricsSummaryDto>;
    getPlatformHealth(): Promise<import("./dto/global-metrics.dto").PlatformHealthDto>;
    createSystemNotification(dto: CreateSystemNotificationDto, req: any): Promise<import("./dto/system-notification.dto").SystemNotificationResponseDto[]>;
    getSystemNotifications(page: number, limit: number): Promise<{
        notifications: import("./dto/system-notification.dto").SystemNotificationResponseDto[];
        total: number;
        unreadCount: number;
    }>;
    getActionLogs(filters: AdminActionLogFilterDto, page: number, limit: number): Promise<import("./dto/admin-action-log.dto").AdminActionLogListResponseDto>;
    getAdminDashboard(): Promise<{
        metrics: import("./dto/global-metrics.dto").GlobalMetricsSummaryDto;
        health: import("./dto/global-metrics.dto").PlatformHealthDto;
        lastUpdated: Date;
    }>;
    getRecentActivities(limit: number): Promise<import("./dto/admin-action-log.dto").AdminActionLogListResponseDto>;
    getSystemStatistics(): Promise<{
        totalCompanies: number;
        activeCompanies: number;
        totalUsers: number;
        totalLeads: number;
        totalWorkflows: number;
        totalAiInteractions: number;
        totalEmails: number;
        totalEnrichments: number;
        averageLeadsPerCompany: number;
        averageWorkflowsPerCompany: number;
        topPerformingCompanies: {
            companyId: string;
            companyName: string;
            leadsCreated: number;
            workflowsExecuted: number;
        }[];
    }>;
}
