import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsageMetricEntity } from './entities/usage-metric.entity';
import { MetricName } from './entities/usage-metric.entity';

@Injectable()
export class UsageMetricsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    metricName: string;
    count: number;
    period: string;
    companyId: string;
  }): Promise<UsageMetricEntity> {
    const metric = await this.prisma.usageMetric.create({
      data: {
        metricName: data.metricName,
        count: data.count,
        period: data.period,
        companyId: data.companyId,
      },
    });

    return this.mapToEntity(metric);
  }

  async findOrCreate(
    metricName: string,
    companyId: string,
    period: string,
  ): Promise<UsageMetricEntity> {
    const existing = await this.prisma.usageMetric.findFirst({
      where: {
        metricName,
        companyId,
        period,
      },
    });

    if (existing) {
      return this.mapToEntity(existing);
    }

    // Create new metric record
    return this.create({
      metricName,
      count: 0,
      period,
      companyId,
    });
  }

  async incrementMetric(
    metricName: string,
    companyId: string,
    period: string,
    amount: number = 1,
  ): Promise<UsageMetricEntity> {
    // Use upsert to create if not exists, increment if exists
    const metric = await this.prisma.usageMetric.upsert({
      where: {
        metricName_companyId_period: {
          metricName,
          companyId,
          period,
        },
      },
      update: {
        count: {
          increment: amount,
        },
        recordedAt: new Date(),
      },
      create: {
        metricName,
        count: amount,
        period,
        companyId,
      },
    });

    return this.mapToEntity(metric);
  }

  async findByCompany(
    companyId: string,
    period?: string,
    metricNames?: string[],
  ): Promise<UsageMetricEntity[]> {
    const where: any = { companyId };

    if (period) {
      where.period = period;
    }

    if (metricNames && metricNames.length > 0) {
      where.metricName = { in: metricNames };
    }

    const metrics = await this.prisma.usageMetric.findMany({
      where,
      orderBy: [
        { period: 'desc' },
        { metricName: 'asc' },
      ],
    });

    return metrics.map(metric => this.mapToEntity(metric));
  }

  async findByCompanyAndPeriod(
    companyId: string,
    period: string,
  ): Promise<UsageMetricEntity[]> {
    const metrics = await this.prisma.usageMetric.findMany({
      where: {
        companyId,
        period,
      },
      orderBy: { metricName: 'asc' },
    });

    return metrics.map(metric => this.mapToEntity(metric));
  }

  async getCurrentPeriodMetrics(companyId: string): Promise<UsageMetricEntity[]> {
    const currentPeriod = this.formatPeriod(new Date());
    return this.findByCompanyAndPeriod(companyId, currentPeriod);
  }

  async getMonthlyMetrics(
    companyId: string,
    year: number,
    month: number,
  ): Promise<UsageMetricEntity[]> {
    const period = `${year}-${String(month).padStart(2, '0')}`;
    return this.findByCompanyAndPeriod(companyId, period);
  }

  async getDailyMetrics(
    companyId: string,
    date: Date,
  ): Promise<UsageMetricEntity[]> {
    const period = this.formatPeriod(date);
    return this.findByCompanyAndPeriod(companyId, period);
  }

  async getAggregatedMetrics(
    companyId: string,
    startDate: Date,
    endDate: Date,
    metricNames?: string[],
  ): Promise<UsageMetricEntity[]> {
    const where: any = {
      companyId,
      period: {
        gte: this.formatPeriod(startDate),
        lte: this.formatPeriod(endDate),
      },
    };

    if (metricNames && metricNames.length > 0) {
      where.metricName = { in: metricNames };
    }

    const metrics = await this.prisma.usageMetric.findMany({
      where,
      orderBy: [
        { period: 'desc' },
        { metricName: 'asc' },
      ],
    });

    return metrics.map(metric => this.mapToEntity(metric));
  }

  async getAllCompaniesMetrics(
    period?: string,
    metricNames?: string[],
  ): Promise<UsageMetricEntity[]> {
    const where: any = {};

    if (period) {
      where.period = period;
    }

    if (metricNames && metricNames.length > 0) {
      where.metricName = { in: metricNames };
    }

    const metrics = await this.prisma.usageMetric.findMany({
      where,
      orderBy: [
        { companyId: 'asc' },
        { period: 'desc' },
        { metricName: 'asc' },
      ],
    });

    return metrics.map(metric => this.mapToEntity(metric));
  }

  async getCompanyMetricsSummary(companyId: string): Promise<{
    totalLeads: number;
    totalWorkflows: number;
    totalAiInteractions: number;
    totalEmails: number;
    totalEnrichments: number;
    totalReplies: number;
  }> {
    const currentPeriod = this.formatPeriod(new Date());
    const metrics = await this.findByCompanyAndPeriod(companyId, currentPeriod);

    const summary = {
      totalLeads: 0,
      totalWorkflows: 0,
      totalAiInteractions: 0,
      totalEmails: 0,
      totalEnrichments: 0,
      totalReplies: 0,
    };

    metrics.forEach(metric => {
      switch (metric.metricName) {
        case MetricName.LEADS_CREATED:
          summary.totalLeads = metric.count;
          break;
        case MetricName.WORKFLOWS_EXECUTED:
          summary.totalWorkflows = metric.count;
          break;
        case MetricName.AI_INTERACTIONS:
          summary.totalAiInteractions = metric.count;
          break;
        case MetricName.EMAILS_SENT:
          summary.totalEmails = metric.count;
          break;
        case MetricName.ENRICHMENT_REQUESTS:
          summary.totalEnrichments = metric.count;
          break;
        case MetricName.REPLIES_CLASSIFIED:
          summary.totalReplies = metric.count;
          break;
      }
    });

    return summary;
  }

  async getGlobalMetricsSummary(): Promise<{
    totalCompanies: number;
    totalLeads: number;
    totalWorkflows: number;
    totalAiInteractions: number;
    totalEmails: number;
    totalEnrichments: number;
  }> {
    const currentPeriod = this.formatPeriod(new Date());
    const metrics = await this.getAllCompaniesMetrics(currentPeriod);

    const summary = {
      totalCompanies: 0,
      totalLeads: 0,
      totalWorkflows: 0,
      totalAiInteractions: 0,
      totalEmails: 0,
      totalEnrichments: 0,
    };

    const companies = new Set<string>();

    metrics.forEach(metric => {
      companies.add(metric.companyId);

      switch (metric.metricName) {
        case MetricName.LEADS_CREATED:
          summary.totalLeads += metric.count;
          break;
        case MetricName.WORKFLOWS_EXECUTED:
          summary.totalWorkflows += metric.count;
          break;
        case MetricName.AI_INTERACTIONS:
          summary.totalAiInteractions += metric.count;
          break;
        case MetricName.EMAILS_SENT:
          summary.totalEmails += metric.count;
          break;
        case MetricName.ENRICHMENT_REQUESTS:
          summary.totalEnrichments += metric.count;
          break;
      }
    });

    summary.totalCompanies = companies.size;
    return summary;
  }

  async cleanupOldMetrics(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.usageMetric.deleteMany({
      where: {
        recordedAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  private mapToEntity(data: any): UsageMetricEntity {
    return new UsageMetricEntity(
      data.id,
      data.metricName,
      data.count,
      data.period,
      data.companyId,
      data.recordedAt,
    );
  }

  private formatPeriod(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get company with plan information
   */
  async getCompanyWithPlan(companyId: string): Promise<any> {
    return this.prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true },
    });
  }

  /**
   * Create quota alert notification
   */
  async createQuotaAlert(
    companyId: string,
    metricName: string,
    level: 'WARNING' | 'EXCEEDED',
    current: number,
    limit: number,
  ): Promise<void> {
    try {
      const message = level === 'EXCEEDED'
        ? `Quota exceeded: ${metricName} (${current}/${limit})`
        : `Quota warning: ${metricName} approaching limit (${current}/${limit})`;

      await this.prisma.systemNotification.create({
        data: {
          companyId,
          message,
          level: level === 'EXCEEDED' ? 'ERROR' : 'WARNING',
        },
      });
    } catch (error) {
      // Log error but don't throw to avoid breaking the main flow
      console.error(`Failed to create quota alert for company ${companyId}`, error);
    }
  }
} 