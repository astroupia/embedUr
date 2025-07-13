import { PrismaService } from '../prisma/prisma.service';
import { UsageMetricEntity } from './entities/usage-metric.entity';
export declare class UsageMetricsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        metricName: string;
        count: number;
        period: string;
        companyId: string;
    }): Promise<UsageMetricEntity>;
    findOrCreate(metricName: string, companyId: string, period: string): Promise<UsageMetricEntity>;
    incrementMetric(metricName: string, companyId: string, period: string, amount?: number): Promise<UsageMetricEntity>;
    findByCompany(companyId: string, period?: string, metricNames?: string[]): Promise<UsageMetricEntity[]>;
    findByCompanyAndPeriod(companyId: string, period: string): Promise<UsageMetricEntity[]>;
    getCurrentPeriodMetrics(companyId: string): Promise<UsageMetricEntity[]>;
    getMonthlyMetrics(companyId: string, year: number, month: number): Promise<UsageMetricEntity[]>;
    getDailyMetrics(companyId: string, date: Date): Promise<UsageMetricEntity[]>;
    getAggregatedMetrics(companyId: string, startDate: Date, endDate: Date, metricNames?: string[]): Promise<UsageMetricEntity[]>;
    getAllCompaniesMetrics(period?: string, metricNames?: string[]): Promise<UsageMetricEntity[]>;
    getCompanyMetricsSummary(companyId: string): Promise<{
        totalLeads: number;
        totalWorkflows: number;
        totalAiInteractions: number;
        totalEmails: number;
        totalEnrichments: number;
        totalReplies: number;
    }>;
    getGlobalMetricsSummary(): Promise<{
        totalCompanies: number;
        totalLeads: number;
        totalWorkflows: number;
        totalAiInteractions: number;
        totalEmails: number;
        totalEnrichments: number;
    }>;
    cleanupOldMetrics(daysOld?: number): Promise<number>;
    private mapToEntity;
    private formatPeriod;
    getCompanyWithPlan(companyId: string): Promise<any>;
    createQuotaAlert(companyId: string, metricName: string, level: 'WARNING' | 'EXCEEDED', current: number, limit: number): Promise<void>;
}
