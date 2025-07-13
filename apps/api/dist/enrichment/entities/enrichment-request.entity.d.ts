import { EnrichmentProvider, EnrichmentStatus } from '../constants/enrichment.constants';
export declare class EnrichmentRequestEntity {
    readonly id: string;
    provider: EnrichmentProvider;
    requestData: Record<string, any>;
    readonly responseData: Record<string, any> | null;
    readonly status: EnrichmentStatus;
    readonly leadId: string;
    readonly companyId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly errorMessage?: string | undefined;
    readonly retryCount?: number | undefined;
    readonly durationMs?: number | undefined;
    constructor(id: string, provider: EnrichmentProvider, requestData: Record<string, any>, responseData: Record<string, any> | null, status: EnrichmentStatus, leadId: string, companyId: string, createdAt: Date, updatedAt: Date, errorMessage?: string | undefined, retryCount?: number | undefined, durationMs?: number | undefined);
    get isCompleted(): boolean;
    get isSuccessful(): boolean;
    get isFailed(): boolean;
    get canBeRetried(): boolean;
    get durationSeconds(): number | null;
    get hasError(): boolean;
    get providerName(): string;
    static create(provider: EnrichmentProvider, requestData: Record<string, any>, leadId: string, companyId: string): EnrichmentRequestEntity;
    withStatus(status: EnrichmentStatus, responseData?: Record<string, any>, errorMessage?: string): EnrichmentRequestEntity;
    withRetry(): EnrichmentRequestEntity;
}
