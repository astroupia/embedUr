import { AdminActionLogEntity } from './entities/admin-action-log.entity';
import { CompanyAdminResponseDto, CompanyUsersResponseDto } from './dto/company-admin.dto';
import { SystemNotificationResponseDto } from './dto/system-notification.dto';
import { AdminActionLogResponseDto } from './dto/admin-action-log.dto';
import { GlobalMetricsSummaryDto, PlatformHealthDto } from './dto/global-metrics.dto';

export class AdminMapper {
  /**
   * Map company data to admin response DTO
   */
  static toCompanyAdminResponseDto(data: any): CompanyAdminResponseDto {
    return {
      id: data.id,
      name: data.name,
      schemaName: data.schemaName,
      status: data.status,
      planId: data.planId,
      industry: data.industry,
      location: data.location,
      website: data.website,
      description: data.description,
      logoUrl: data.logoUrl,
      bannerUrl: data.bannerUrl,
      employees: data.employees,
      revenue: data.revenue,
      linkedinUsername: data.linkedinUsername,
      twitterUsername: data.twitterUsername,
      facebookUsername: data.facebookUsername,
      instagramUsername: data.instagramUsername,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      plan: data.plan ? {
        id: data.plan.id,
        name: data.plan.name,
        description: data.plan.description,
        maxLeads: data.plan.maxLeads,
        maxWorkflows: data.plan.maxWorkflows,
        priceCents: data.plan.priceCents,
      } : undefined,
      userCount: data.users?.length || 0,
      activeUserCount: data.users?.filter((u: any) => u.updatedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0,
      lastActivityAt: data.users?.length > 0 ? 
        new Date(Math.max(...data.users.map((u: any) => u.updatedAt.getTime()))) : undefined,
    };
  }

  /**
   * Map user data to admin response DTO
   */
  static toCompanyUsersResponseDto(data: any): CompanyUsersResponseDto {
    return {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      linkedinUrl: data.linkedinUrl,
      profileUrl: data.profileUrl,
      twitterUsername: data.twitterUsername,
      facebookUsername: data.facebookUsername,
      instagramUsername: data.instagramUsername,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt,
      isActive: data.updatedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Map system notification data to response DTO
   */
  static toSystemNotificationResponseDto(data: any): SystemNotificationResponseDto {
    return {
      id: data.id,
      message: data.message,
      level: data.level,
      read: data.read,
      companyId: data.companyId,
      createdAt: data.createdAt,
    };
  }

  /**
   * Map admin action log entity to response DTO
   */
  static toAdminActionLogResponseDto(entity: AdminActionLogEntity, userData?: any): AdminActionLogResponseDto {
    return {
      id: entity.id,
      action: entity.action,
      targetType: entity.targetType,
      targetId: entity.targetId,
      details: entity.details,
      performedBy: entity.performedBy,
      timestamp: entity.timestamp,
      performedByUser: userData ? {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      } : undefined,
    };
  }

  /**
   * Map global metrics data to summary DTO
   */
  static toGlobalMetricsSummaryDto(data: any): GlobalMetricsSummaryDto {
    return {
      totalCompanies: data.totalCompanies,
      activeCompanies: data.activeCompanies,
      suspendedCompanies: data.suspendedCompanies,
      totalUsers: data.totalUsers,
      activeUsers: data.activeUsers,
      totalLeads: data.totalLeads,
      totalWorkflows: data.totalWorkflows,
      totalAiInteractions: data.totalAiInteractions,
      totalEmails: data.totalEmails,
      totalEnrichments: data.totalEnrichments,
      totalBookings: data.totalBookings || 0,
      totalCampaigns: data.totalCampaigns || 0,
      averageLeadsPerCompany: data.totalCompanies > 0 ? data.totalLeads / data.totalCompanies : 0,
      averageWorkflowsPerCompany: data.totalCompanies > 0 ? data.totalWorkflows / data.totalCompanies : 0,
      topPerformingCompanies: data.topPerformingCompanies || [],
      recentActivity: data.recentActivity || [],
    };
  }

  /**
   * Map platform health data to response DTO
   */
  static toPlatformHealthDto(data: any): PlatformHealthDto {
    return {
      status: data.status,
      databaseStatus: data.databaseStatus || 'connected',
      activeConnections: data.activeConnections || 0,
      systemLoad: data.systemLoad || 0,
      memoryUsage: data.memoryUsage || 0,
      diskUsage: data.diskUsage || 0,
      lastBackupAt: data.lastBackupAt,
      uptime: data.uptime || 0,
      alerts: data.alerts || [],
    };
  }

  /**
   * Map multiple companies to admin response DTOs
   */
  static toCompanyAdminResponseDtos(data: any[]): CompanyAdminResponseDto[] {
    return data.map(item => this.toCompanyAdminResponseDto(item));
  }

  /**
   * Map multiple users to admin response DTOs
   */
  static toCompanyUsersResponseDtos(data: any[]): CompanyUsersResponseDto[] {
    return data.map(item => this.toCompanyUsersResponseDto(item));
  }

  /**
   * Map multiple system notifications to response DTOs
   */
  static toSystemNotificationResponseDtos(data: any[]): SystemNotificationResponseDto[] {
    return data.map(item => this.toSystemNotificationResponseDto(item));
  }

  /**
   * Map multiple admin action logs to response DTOs
   */
  static toAdminActionLogResponseDtos(entities: AdminActionLogEntity[], userDataMap?: Record<string, any>): AdminActionLogResponseDto[] {
    return entities.map(entity => {
      const userData = userDataMap?.[entity.performedBy];
      return this.toAdminActionLogResponseDto(entity, userData);
    });
  }
} 