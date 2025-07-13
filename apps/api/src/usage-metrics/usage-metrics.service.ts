import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UsageMetricsRepository } from './usage-metrics.repository';
import { UsageMetricEntity, MetricName } from './entities/usage-metric.entity';
import { CreateUsageMetricDto } from './dto/create-usage-metric.dto';
import { UsageMetricResponseDto, UsageMetricsOverviewDto } from './dto/usage-metric-response.dto';
import { UsageMetricsMapper } from './usage-metrics.mapper';

@Injectable()
export class UsageMetricsService {
  private readonly logger = new Logger(UsageMetricsService.name);

  constructor(
    private readonly repository: UsageMetricsRepository,
    private readonly mapper: UsageMetricsMapper,
  ) {}

  /**
   * Increment a metric for a company (internal use)
   */
  async incrementMetric(
    companyId: string,
    metricName: MetricName,
    period?: string,
    amount: number = 1,
  ): Promise<void> {
    try {
      const currentPeriod = period || this.formatPeriod(new Date());
      
      await this.repository.incrementMetric(
        metricName,
        companyId,
        currentPeriod,
        amount,
      );

      this.logger.log(`Incremented ${metricName} by ${amount} for company ${companyId}`);
      
      // Check for quota violations after incrementing
      await this.checkQuotaViolations(companyId, metricName);
    } catch (error) {
      this.logger.error(`Failed to increment metric ${metricName} for company ${companyId}`, error);
      throw error;
    }
  }

  /**
   * Record a new metric
   */
  async recordMetric(dto: CreateUsageMetricDto): Promise<UsageMetricResponseDto> {
    const currentPeriod = dto.period || this.formatPeriod(new Date());
    const count = dto.count || 1;
    
    const metric = await this.repository.incrementMetric(
      dto.metricName,
      dto.companyId,
      currentPeriod,
      count,
    );

    return UsageMetricsMapper.toResponseDto(metric);
  }

  /**
   * Get metrics for a company
   */
  async getCompanyMetrics(
    companyId: string,
    period?: string,
    metricNames?: MetricName[],
  ): Promise<UsageMetricResponseDto[]> {
    const metrics = await this.repository.findByCompany(
      companyId,
      period,
      metricNames,
    );

    return metrics.map(metric => UsageMetricsMapper.toResponseDto(metric));
  }

  /**
   * Get current period metrics for a company
   */
  async getCurrentPeriodMetrics(companyId: string): Promise<UsageMetricResponseDto[]> {
    const metrics = await this.repository.getCurrentPeriodMetrics(companyId);
    return metrics.map(metric => UsageMetricsMapper.toResponseDto(metric));
  }

  /**
   * Get usage overview for a company with plan limits
   */
  async getUsageOverview(companyId: string): Promise<UsageMetricsOverviewDto> {
    const currentMetrics = await this.repository.getCurrentPeriodMetrics(companyId);
    const company = await this.repository.getCompanyWithPlan(companyId);
    
    const planLimits = this.calculatePlanLimits(company);
    const { warnings, overageDetected } = this.analyzeQuotaUsage(currentMetrics, planLimits);

    return new UsageMetricsOverviewDto({
      companyId,
      metrics: currentMetrics.map(metric => UsageMetricsMapper.toResponseDto(metric)),
      planLimits,
      overageDetected,
      warnings,
    });
  }

  /**
   * Get all companies metrics (admin only)
   */
  async getAllCompaniesMetrics(
    period?: string,
    metricNames?: MetricName[],
  ): Promise<UsageMetricResponseDto[]> {
    const metrics = await this.repository.getAllCompaniesMetrics(period, metricNames);
    return metrics.map(metric => UsageMetricsMapper.toResponseDto(metric));
  }

  /**
   * Get global metrics summary (admin only)
   */
  async getGlobalMetricsSummary(): Promise<{
    totalCompanies: number;
    totalLeads: number;
    totalWorkflows: number;
    totalAiInteractions: number;
    totalEmails: number;
    totalEnrichments: number;
  }> {
    return this.repository.getGlobalMetricsSummary();
  }

  /**
   * Get metrics for a specific company (admin only)
   */
  async getCompanyMetricsForAdmin(companyId: string): Promise<UsageMetricResponseDto[]> {
    const metrics = await this.repository.findByCompany(companyId);
    return metrics.map(metric => UsageMetricsMapper.toResponseDto(metric));
  }

  /**
   * Check if a company can perform an action based on their quota
   */
  async canPerformAction(
    companyId: string,
    metricName: MetricName,
    amount: number = 1,
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const company = await this.repository.getCompanyWithPlan(companyId);
      const currentMetrics = await this.repository.getCurrentPeriodMetrics(companyId);
      
      const currentMetric = currentMetrics.find(m => m.metricName === metricName);
      const currentCount = currentMetric?.count || 0;
      const planLimits = this.calculatePlanLimits(company);
      const limit = this.getLimitForMetric(metricName, planLimits);

      if (currentCount + amount > limit) {
        return {
          allowed: false,
          reason: `${metricName} limit would be exceeded (${currentCount + amount}/${limit})`,
        };
      }

      return { allowed: true };
    } catch (error) {
      this.logger.error(`Error checking quota for company ${companyId}`, error);
      return { allowed: false, reason: 'Error checking quota' };
    }
  }

  /**
   * Get metrics statistics
   */
  async getMetricsStats(companyId: string): Promise<{
    totalMetrics: number;
    currentPeriodMetrics: number;
    mostUsedMetric: string;
    leastUsedMetric: string;
  }> {
    const currentMetrics = await this.repository.getCurrentPeriodMetrics(companyId);
    
    if (currentMetrics.length === 0) {
      return {
        totalMetrics: 0,
        currentPeriodMetrics: 0,
        mostUsedMetric: 'N/A',
        leastUsedMetric: 'N/A',
      };
    }

    const sortedMetrics = currentMetrics.sort((a, b) => b.count - a.count);
    
    return {
      totalMetrics: currentMetrics.length,
      currentPeriodMetrics: currentMetrics.reduce((sum, m) => sum + m.count, 0),
      mostUsedMetric: sortedMetrics[0]?.metricName || 'N/A',
      leastUsedMetric: sortedMetrics[sortedMetrics.length - 1]?.metricName || 'N/A',
    };
  }

  /**
   * Clean up old metrics
   */
  async cleanupOldMetrics(daysOld: number = 90): Promise<number> {
    return this.repository.cleanupOldMetrics(daysOld);
  }

  // ========== PRIVATE BUSINESS LOGIC METHODS ==========

  /**
   * Check for quota violations and trigger alerts
   */
  private async checkQuotaViolations(companyId: string, metricName: MetricName): Promise<void> {
    try {
      const company = await this.repository.getCompanyWithPlan(companyId);
      const currentMetrics = await this.repository.getCurrentPeriodMetrics(companyId);
      
      const currentMetric = currentMetrics.find(m => m.metricName === metricName);
      if (!currentMetric) return;

      const planLimits = this.calculatePlanLimits(company);
      const limit = this.getLimitForMetric(metricName, planLimits);
      const usagePercentage = (currentMetric.count / limit) * 100;

      if (usagePercentage >= 100) {
        await this.repository.createQuotaAlert(companyId, metricName, 'EXCEEDED', currentMetric.count, limit);
      } else if (usagePercentage >= 80) {
        await this.repository.createQuotaAlert(companyId, metricName, 'WARNING', currentMetric.count, limit);
      }
    } catch (error) {
      this.logger.error(`Error checking quota violations for company ${companyId}`, error);
    }
  }

  /**
   * Calculate plan limits for a company
   */
  private calculatePlanLimits(company: any): {
    leads: number;
    workflows: number;
    aiInteractions: number;
    emails: number;
    enrichments: number;
  } {
    return {
      leads: company.plan?.maxLeads || 1000,
      workflows: company.plan?.maxWorkflows || 100,
      aiInteractions: 100, // Default limit
      emails: 5000, // Default limit
      enrichments: 200, // Default limit
    };
  }

  /**
   * Analyze quota usage and generate warnings
   */
  private analyzeQuotaUsage(
    metrics: UsageMetricEntity[],
    planLimits: any,
  ): { warnings: string[]; overageDetected: boolean } {
    const warnings: string[] = [];
    let overageDetected = false;

    metrics.forEach(metric => {
      const limit = this.getLimitForMetric(metric.metricName, planLimits);
      const usagePercentage = (metric.count / limit) * 100;

      if (usagePercentage >= 100) {
        overageDetected = true;
        warnings.push(`${metric.metricName} limit exceeded (${metric.count}/${limit})`);
      } else if (usagePercentage >= 80) {
        warnings.push(`${metric.metricName} approaching limit (${metric.count}/${limit})`);
      }
    });

    return { warnings, overageDetected };
  }

  /**
   * Get limit for a specific metric
   */
  private getLimitForMetric(metricName: string, planLimits: any): number {
    switch (metricName) {
      case MetricName.LEADS_CREATED:
        return planLimits.leads;
      case MetricName.WORKFLOWS_EXECUTED:
        return planLimits.workflows;
      case MetricName.AI_INTERACTIONS:
        return planLimits.aiInteractions;
      case MetricName.EMAILS_SENT:
        return planLimits.emails;
      case MetricName.ENRICHMENT_REQUESTS:
        return planLimits.enrichments;
      default:
        return 1000; // Default limit
    }
  }

  /**
   * Format date to period string
   */
  private formatPeriod(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
} 