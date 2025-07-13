import { MetricName } from '../entities/usage-metric.entity';
export declare class CreateUsageMetricDto {
    metricName: MetricName;
    count?: number;
    period?: string;
    companyId: string;
}
