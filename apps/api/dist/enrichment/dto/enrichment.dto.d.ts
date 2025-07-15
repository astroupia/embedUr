import { EnrichmentProvider } from '../constants/enrichment.constants';
export declare class TriggerEnrichmentDto {
    leadId: string;
    provider?: EnrichmentProvider;
    requestData?: Record<string, any>;
}
export declare class RetryEnrichmentDto {
    requestData?: Record<string, any>;
    provider?: EnrichmentProvider;
}
export declare class EnrichmentStatsDto {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    byProvider: Record<EnrichmentProvider, {
        total: number;
        successful: number;
        failed: number;
    }>;
    averageDurationSeconds: number;
}
