export declare class UsageMetricResponseDto {
    id: string;
    metricName: string;
    count: number;
    period: string;
    companyId: string;
    recordedAt: Date;
    constructor(data: {
        id: string;
        metricName: string;
        count: number;
        period: string;
        companyId: string;
        recordedAt: Date;
    });
}
export declare class UsageMetricsOverviewDto {
    companyId: string;
    metrics: UsageMetricResponseDto[];
    planLimits: {
        leads: number;
        workflows: number;
        aiInteractions: number;
        emails: number;
        enrichments: number;
    };
    overageDetected: boolean;
    warnings: string[];
    constructor(data: {
        companyId: string;
        metrics: UsageMetricResponseDto[];
        planLimits: {
            leads: number;
            workflows: number;
            aiInteractions: number;
            emails: number;
            enrichments: number;
        };
        overageDetected: boolean;
        warnings: string[];
    });
}
