import { AdminRepository } from './admin.repository';
import { AdminMapper } from './admin.mapper';
import { UpdateCompanyStatusDto, UpdateCompanyPlanDto, CompanyAdminResponseDto, CompanyListResponseDto } from './dto/company-admin.dto';
import { CreateSystemNotificationDto, SystemNotificationResponseDto } from './dto/system-notification.dto';
import { AdminActionLogFilterDto, AdminActionLogListResponseDto } from './dto/admin-action-log.dto';
import { GlobalMetricsSummaryDto, PlatformHealthDto } from './dto/global-metrics.dto';
import { CompanyStatus } from '../constants/enums';
export declare class AdminService {
    private readonly repository;
    private readonly mapper;
    private readonly logger;
    constructor(repository: AdminRepository, mapper: AdminMapper);
    getAllCompanies(page?: number, limit?: number, status?: CompanyStatus, search?: string): Promise<CompanyListResponseDto>;
    getCompanyById(id: string): Promise<CompanyAdminResponseDto>;
    updateCompanyStatus(id: string, dto: UpdateCompanyStatusDto, adminUserId: string): Promise<CompanyAdminResponseDto>;
    updateCompanyPlan(id: string, dto: UpdateCompanyPlanDto, adminUserId: string): Promise<CompanyAdminResponseDto>;
    getCompanyUsers(companyId: string): Promise<any[]>;
    getGlobalMetricsSummary(): Promise<GlobalMetricsSummaryDto>;
    getPlatformHealth(): Promise<PlatformHealthDto>;
    createSystemNotification(dto: CreateSystemNotificationDto, adminUserId: string): Promise<SystemNotificationResponseDto[]>;
    getSystemNotifications(page?: number, limit?: number): Promise<{
        notifications: SystemNotificationResponseDto[];
        total: number;
        unreadCount: number;
    }>;
    getActionLogs(filters: AdminActionLogFilterDto, page?: number, limit?: number): Promise<AdminActionLogListResponseDto>;
    private logAdminAction;
    private validateStatusTransition;
    private validateAdminAccess;
}
