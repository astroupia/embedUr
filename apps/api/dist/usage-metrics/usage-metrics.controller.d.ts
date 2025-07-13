import { UsageMetricsService } from './usage-metrics.service';
import { CreateUsageMetricDto } from './dto/create-usage-metric.dto';
import { UsageMetricResponseDto, UsageMetricsOverviewDto } from './dto/usage-metric-response.dto';
export declare class UsageMetricsController {
    private readonly usageMetricsService;
    constructor(usageMetricsService: UsageMetricsService);
    getCompanyMetrics(req: any, period?: string, metricNames?: string): Promise<UsageMetricResponseDto[]>;
    getUsageOverview(req: any): Promise<UsageMetricsOverviewDto>;
    getCurrentPeriodMetrics(req: any): Promise<UsageMetricResponseDto[]>;
    getMetricsStats(req: any): Promise<{
        totalMetrics: number;
        currentPeriodMetrics: number;
        mostUsedMetric: string;
        leastUsedMetric: string;
    }>;
    recordMetric(dto: CreateUsageMetricDto, req: any): Promise<UsageMetricResponseDto>;
}
export declare class AdminUsageMetricsController {
    private readonly usageMetricsService;
    constructor(usageMetricsService: UsageMetricsService);
    getAllCompaniesMetrics(period?: string, metricNames?: string): Promise<UsageMetricResponseDto[]>;
    getGlobalMetricsSummary(): Promise<{
        totalCompanies: number;
        totalLeads: number;
        totalWorkflows: number;
        totalAiInteractions: number;
        totalEmails: number;
        totalEnrichments: number;
    }>;
    getCompanyMetricsForAdmin(companyId: string): Promise<UsageMetricResponseDto[]>;
    getCompanyUsageOverviewForAdmin(companyId: string): Promise<UsageMetricsOverviewDto>;
}
