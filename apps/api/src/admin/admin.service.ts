import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { AdminMapper } from './admin.mapper';
import { AdminActionLogEntity, AdminActionType, AdminTargetType } from './entities/admin-action-log.entity';
import { UpdateCompanyStatusDto, UpdateCompanyPlanDto, CompanyAdminResponseDto, CompanyListResponseDto } from './dto/company-admin.dto';
import { CreateSystemNotificationDto, SystemNotificationResponseDto } from './dto/system-notification.dto';
import { AdminActionLogFilterDto, AdminActionLogListResponseDto } from './dto/admin-action-log.dto';
import { GlobalMetricsSummaryDto, PlatformHealthDto } from './dto/global-metrics.dto';
import { CompanyStatus } from '../constants/enums';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly repository: AdminRepository,
    private readonly mapper: AdminMapper,
  ) {}

  // ========== COMPANY MANAGEMENT ==========

  /**
   * Get all companies with pagination and filtering
   */
  async getAllCompanies(
    page: number = 1,
    limit: number = 20,
    status?: CompanyStatus,
    search?: string,
  ): Promise<CompanyListResponseDto> {
    try {
      const { companies, total } = await this.repository.findAllCompanies(page, limit, status, search);
      const mappedCompanies = AdminMapper.toCompanyAdminResponseDtos(companies);
      
      return {
        companies: mappedCompanies,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error fetching companies', error);
      throw new BadRequestException('Failed to fetch companies');
    }
  }

  /**
   * Get company details by ID
   */
  async getCompanyById(id: string): Promise<CompanyAdminResponseDto> {
    try {
      const company = await this.repository.findCompanyById(id);
      if (!company) {
        throw new BadRequestException('Company not found');
      }
      
      return AdminMapper.toCompanyAdminResponseDto(company);
    } catch (error) {
      this.logger.error(`Error fetching company ${id}`, error);
      throw new BadRequestException('Failed to fetch company details');
    }
  }

  /**
   * Update company status
   */
  async updateCompanyStatus(
    id: string,
    dto: UpdateCompanyStatusDto,
    adminUserId: string,
  ): Promise<CompanyAdminResponseDto> {
    try {
      // Validate status transition
      this.validateStatusTransition(id, dto.status);

      const company = await this.repository.updateCompanyStatus(id, dto.status, dto.reason);
      
      // Log the action
      await this.logAdminAction({
        action: AdminActionType.COMPANY_STATUS_UPDATE,
        targetType: AdminTargetType.COMPANY,
        targetId: id,
        performedBy: adminUserId,
        details: {
          previousStatus: company.status,
          newStatus: dto.status,
          reason: dto.reason,
        },
      });

      return AdminMapper.toCompanyAdminResponseDto(company);
    } catch (error) {
      this.logger.error(`Error updating company status ${id}`, error);
      throw new BadRequestException('Failed to update company status');
    }
  }

  /**
   * Update company plan
   */
  async updateCompanyPlan(
    id: string,
    dto: UpdateCompanyPlanDto,
    adminUserId: string,
  ): Promise<CompanyAdminResponseDto> {
    try {
      const company = await this.repository.updateCompanyPlan(id, dto.planId);
      
      // Log the action
      await this.logAdminAction({
        action: AdminActionType.COMPANY_PLAN_CHANGE,
        targetType: AdminTargetType.COMPANY,
        targetId: id,
        performedBy: adminUserId,
        details: {
          newPlanId: dto.planId,
          reason: dto.reason,
        },
      });

      return AdminMapper.toCompanyAdminResponseDto(company);
    } catch (error) {
      this.logger.error(`Error updating company plan ${id}`, error);
      throw new BadRequestException('Failed to update company plan');
    }
  }

  /**
   * Get users for a specific company
   */
  async getCompanyUsers(companyId: string): Promise<any[]> {
    try {
      const users = await this.repository.findCompanyUsers(companyId);
      return AdminMapper.toCompanyUsersResponseDtos(users);
    } catch (error) {
      this.logger.error(`Error fetching users for company ${companyId}`, error);
      throw new BadRequestException('Failed to fetch company users');
    }
  }

  // ========== GLOBAL METRICS ==========

  /**
   * Get global metrics summary
   */
  async getGlobalMetricsSummary(): Promise<GlobalMetricsSummaryDto> {
    try {
      const metrics = await this.repository.getGlobalUsageMetrics();
      const topPerformingCompanies = await this.repository.getTopPerformingCompanies(5);
      
      return AdminMapper.toGlobalMetricsSummaryDto({
        ...metrics,
        topPerformingCompanies,
        recentActivity: [], // This would be populated from recent admin actions
      });
    } catch (error) {
      this.logger.error('Error fetching global metrics', error);
      throw new BadRequestException('Failed to fetch global metrics');
    }
  }

  /**
   * Get platform health status
   */
  async getPlatformHealth(): Promise<PlatformHealthDto> {
    try {
      const health = await this.repository.getPlatformHealth();
      return AdminMapper.toPlatformHealthDto(health);
    } catch (error) {
      this.logger.error('Error fetching platform health', error);
      throw new BadRequestException('Failed to fetch platform health');
    }
  }

  // ========== SYSTEM NOTIFICATIONS ==========

  /**
   * Create system-wide notification
   */
  async createSystemNotification(
    dto: CreateSystemNotificationDto,
    adminUserId: string,
  ): Promise<SystemNotificationResponseDto[]> {
    try {
      const notifications = await this.repository.createSystemNotification({
        message: dto.message,
        level: dto.level,
        companyIds: dto.targetCompanyIds,
      });

      // Log the action
      await this.logAdminAction({
        action: AdminActionType.SYSTEM_NOTIFICATION,
        targetType: AdminTargetType.SYSTEM,
        targetId: 'SYSTEM',
        performedBy: adminUserId,
        details: {
          message: dto.message,
          level: dto.level,
          targetCompanyIds: dto.targetCompanyIds,
          notificationCount: notifications.length,
        },
      });

      return AdminMapper.toSystemNotificationResponseDtos(notifications);
    } catch (error) {
      this.logger.error('Error creating system notification', error);
      throw new BadRequestException('Failed to create system notification');
    }
  }

  /**
   * Get system notifications
   */
  async getSystemNotifications(page: number = 1, limit: number = 20): Promise<{
    notifications: SystemNotificationResponseDto[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const { notifications, total } = await this.repository.findSystemNotifications(page, limit);
      const mappedNotifications = AdminMapper.toSystemNotificationResponseDtos(notifications);
      
      return {
        notifications: mappedNotifications,
        total,
        unreadCount: mappedNotifications.filter(n => !n.read).length,
      };
    } catch (error) {
      this.logger.error('Error fetching system notifications', error);
      throw new BadRequestException('Failed to fetch system notifications');
    }
  }

  // ========== ADMIN ACTION LOGS ==========

  /**
   * Get admin action logs with filtering
   */
  async getActionLogs(
    filters: AdminActionLogFilterDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<AdminActionLogListResponseDto> {
    try {
      const { logs, total } = await this.repository.findActionLogs(
        {
          action: filters.action,
          targetType: filters.targetType,
          targetId: filters.targetId,
          performedBy: filters.performedBy,
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        },
        page,
        limit,
      );

      return {
        logs: AdminMapper.toAdminActionLogResponseDtos(logs),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error fetching action logs', error);
      throw new BadRequestException('Failed to fetch action logs');
    }
  }

  // ========== PRIVATE BUSINESS LOGIC METHODS ==========

  /**
   * Log admin action for audit trail
   */
  private async logAdminAction(data: {
    action: string;
    targetType: string;
    targetId: string;
    performedBy: string;
    details?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.repository.createActionLog(data);
    } catch (error) {
      this.logger.error('Error logging admin action', error);
      // Don't throw here as it's not critical to the main operation
    }
  }

  /**
   * Validate company status transition
   */
  private validateStatusTransition(companyId: string, newStatus: CompanyStatus): void {
    // Add business rules for status transitions
    if (newStatus === CompanyStatus.PENDING_DELETION) {
      // Additional validation for deletion
      this.logger.warn(`Company ${companyId} marked for deletion`);
    }
  }

  /**
   * Check if user has admin privileges
   */
  private validateAdminAccess(userRole: string): void {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Insufficient privileges for admin operations');
    }
  }
} 