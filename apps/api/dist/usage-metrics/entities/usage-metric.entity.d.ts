export declare class UsageMetricEntity {
    readonly id: string;
    readonly metricName: string;
    readonly count: number;
    readonly period: string;
    readonly companyId: string;
    readonly recordedAt: Date;
    constructor(id: string, metricName: string, count: number, period: string, companyId: string, recordedAt: Date);
    get isCurrentPeriod(): boolean;
    get isOverLimit(): boolean;
    get periodType(): 'daily' | 'monthly' | 'yearly';
    static create(metricName: string, companyId: string, count?: number, period?: string): UsageMetricEntity;
    increment(amount?: number): UsageMetricEntity;
    withCount(count: number): UsageMetricEntity;
    private static formatPeriod;
}
export declare enum MetricName {
    LEADS_CREATED = "LEADS_CREATED",
    WORKFLOWS_EXECUTED = "WORKFLOWS_EXECUTED",
    AI_INTERACTIONS = "AI_INTERACTIONS",
    EMAILS_SENT = "EMAILS_SENT",
    ENRICHMENT_REQUESTS = "ENRICHMENT_REQUESTS",
    REPLIES_CLASSIFIED = "REPLIES_CLASSIFIED",
    CAMPAIGNS_CREATED = "CAMPAIGNS_CREATED",
    BOOKINGS_CREATED = "BOOKINGS_CREATED",
    API_CALLS = "API_CALLS"
}
export declare const METRIC_DESCRIPTIONS: Record<MetricName, string>;
