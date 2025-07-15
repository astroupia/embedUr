import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminActionLogEntity } from './entities/admin-action-log.entity';
import { CompanyStatus, SystemNotificationLevel } from '../constants/enums';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ========== COMPANY MANAGEMENT ==========

  async findAllCompanies(
    page: number = 1,
    limit: number = 20,
    status?: CompanyStatus,
    search?: string,
  ): Promise<{ companies: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: {
          plan: true,
          users: {
            select: {
              id: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return { companies, total };
  }

  async findCompanyById(id: string): Promise<any> {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        plan: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async updateCompanyStatus(
    id: string,
    status: CompanyStatus,
    reason?: string,
  ): Promise<any> {
    return this.prisma.company.update({
      where: { id },
      data: { status },
      include: { plan: true },
    });
  }

  async updateCompanyPlan(id: string, planId: string): Promise<any> {
    return this.prisma.company.update({
      where: { id },
      data: { planId },
      include: { plan: true },
    });
  }

  async findCompanyUsers(companyId: string): Promise<any[]> {
    return this.prisma.user.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========== USAGE METRICS ==========

  async getGlobalUsageMetrics(): Promise<any> {
    const currentPeriod = this.formatPeriod(new Date());
    
    const [totalCompanies, activeCompanies, suspendedCompanies, totalUsers, activeUsers] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      this.prisma.company.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { companyId: { not: undefined } } }),
    ]);

    const usageMetrics = await this.prisma.usageMetric.findMany({
      where: { period: currentPeriod },
    });

    const totalLeads = usageMetrics
      .filter(m => m.metricName === 'LEADS_CREATED')
      .reduce((sum, m) => sum + m.count, 0);
    
    const totalWorkflows = usageMetrics
      .filter(m => m.metricName === 'WORKFLOWS_EXECUTED')
      .reduce((sum, m) => sum + m.count, 0);
    
    const totalAiInteractions = usageMetrics
      .filter(m => m.metricName === 'AI_INTERACTIONS')
      .reduce((sum, m) => sum + m.count, 0);
    
    const totalEmails = usageMetrics
      .filter(m => m.metricName === 'EMAILS_SENT')
      .reduce((sum, m) => sum + m.count, 0);
    
    const totalEnrichments = usageMetrics
      .filter(m => m.metricName === 'ENRICHMENT_REQUESTS')
      .reduce((sum, m) => sum + m.count, 0);

    return {
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      totalUsers,
      activeUsers,
      totalLeads,
      totalWorkflows,
      totalAiInteractions,
      totalEmails,
      totalEnrichments,
    };
  }

  async getTopPerformingCompanies(limit: number = 10): Promise<any[]> {
    const currentPeriod = this.formatPeriod(new Date());
    
    const companies = await this.prisma.company.findMany({
      include: {
        plan: true,
        users: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const usageMetrics = await this.prisma.usageMetric.findMany({
      where: { period: currentPeriod },
    });

    return companies.map(company => {
      const companyMetrics = usageMetrics.filter(m => m.companyId === company.id);
      const leadsCreated = companyMetrics
        .find(m => m.metricName === 'LEADS_CREATED')?.count || 0;
      const workflowsExecuted = companyMetrics
        .find(m => m.metricName === 'WORKFLOWS_EXECUTED')?.count || 0;

      return {
        companyId: company.id,
        companyName: company.name,
        leadsCreated,
        workflowsExecuted,
        userCount: company.users.length,
      };
    }).sort((a, b) => b.leadsCreated - a.leadsCreated);
  }

  // ========== SYSTEM NOTIFICATIONS ==========

  async createSystemNotification(data: {
    message: string;
    level: SystemNotificationLevel;
    companyIds?: string[];
  }): Promise<any[]> {
    const notifications: any[] = [];

    if (data.companyIds && data.companyIds.length > 0) {
      // Create notifications for specific companies
      for (const companyId of data.companyIds) {
        const notification = await this.prisma.systemNotification.create({
          data: {
            message: data.message,
            level: data.level,
            companyId,
          },
        });
        notifications.push(notification);
      }
    } else {
      // Create notifications for all companies
      const companies = await this.prisma.company.findMany({
        select: { id: true },
      });

      for (const company of companies) {
        const notification = await this.prisma.systemNotification.create({
          data: {
            message: data.message,
            level: data.level,
            companyId: company.id,
          },
        });
        notifications.push(notification);
      }
    }

    return notifications;
  }

  async findSystemNotifications(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.systemNotification.findMany({
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.systemNotification.count(),
    ]);

    return { notifications, total };
  }

  // ========== ADMIN ACTION LOGS ==========

  async createActionLog(data: {
    action: string;
    targetType: string;
    targetId: string;
    performedBy: string;
    details?: Record<string, any>;
  }): Promise<AdminActionLogEntity> {
    const log = await this.prisma.adminActionLog.create({
      data: {
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        performedBy: data.performedBy,
        details: data.details,
      },
    });

    return this.mapToEntity(log);
  }

  async findActionLogs(
    filters: {
      action?: string;
      targetType?: string;
      targetId?: string;
      performedBy?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 20,
  ): Promise<{ logs: AdminActionLogEntity[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.action) where.action = filters.action;
    if (filters.targetType) where.targetType = filters.targetType;
    if (filters.targetId) where.targetId = filters.targetId;
    if (filters.performedBy) where.performedBy = filters.performedBy;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.adminActionLog.findMany({
        where,
        include: {
          performedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.adminActionLog.count({ where }),
    ]);

    return {
      logs: logs.map(log => this.mapToEntity(log)),
      total,
    };
  }

  // ========== PLATFORM HEALTH ==========

  async getPlatformHealth(): Promise<any> {
    const [totalCompanies, activeCompanies, totalUsers, recentActivity] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count(),
      this.prisma.adminActionLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          performedByUser: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return {
      totalCompanies,
      activeCompanies,
      totalUsers,
      recentActivity,
      status: 'healthy', // This would be determined by more complex logic
      uptime: Date.now(), // This would be calculated from system start time
    };
  }

  // ========== PRIVATE HELPER METHODS ==========

  private mapToEntity(data: any): AdminActionLogEntity {
    return new AdminActionLogEntity(
      data.id,
      data.action,
      data.targetType,
      data.targetId,
      data.details,
      data.performedBy,
      data.timestamp,
    );
  }

  private formatPeriod(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
} 