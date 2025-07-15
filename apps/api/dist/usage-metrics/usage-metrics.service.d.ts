import { UsageMetricsRepository } from './usage-metrics.repository';
import { MetricName } from './entities/usage-metric.entity';
import { CreateUsageMetricDto } from './dto/create-usage-metric.dto';
import { UsageMetricResponseDto, UsageMetricsOverviewDto } from './dto/usage-metric-response.dto';
import { UsageMetricsMapper } from './usage-metrics.mapper';
export declare class UsageMetricsService {
    private readonly repository;
    private readonly mapper;
    private readonly logger;
    constructor(repository: UsageMetricsRepository, mapper: UsageMetricsMapper);
    incrementMetric(companyId: string, metricName: MetricName, period?: string, amount?: number): Promise<void>;
    recordMetric(dto: CreateUsageMetricDto): Promise<UsageMetricResponseDto>;
    getCompanyMetrics(companyId: string, period?: string, metricNames?: MetricName[]): Promise<UsageMetricResponseDto[]>;
    getCurrentPeriodMetrics(companyId: string): Promise<UsageMetricResponseDto[]>;
    getUsageOverview(companyId: string): Promise<UsageMetricsOverviewDto>;
    getAllCompaniesMetrics(period?: string, metricNames?: MetricName[]): Promise<UsageMetricResponseDto[]>;
    getGlobalMetricsSummary(): Promise<{
        totalCompanies: number;
        totalLeads: number;
        totalWorkflows: number;
        totalAiInteractions: number;
        totalEmails: number;
        totalEnrichments: number;
    }>;
    getCompanyMetricsForAdmin(companyId: string): Promise<UsageMetricResponseDto[]>;
    canPerformAction(companyId: string, metricName: MetricName, amount?: number): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    getMetricsStats(companyId: string): Promise<{
        totalMetrics: number;
        currentPeriodMetrics: number;
        mostUsedMetric: string;
        leastUsedMetric: string;
    }>;
    cleanupOldMetrics(daysOld?: number): Promise<number>;
    private checkQuotaViolations;
    private calculatePlanLimits;
    private analyzeQuotaUsage;
    private getLimitForMetric;
    private formatPeriod;
}
