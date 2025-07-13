import { EnrichmentSortField, EnrichmentSortOrder } from '../constants/enrichment.constants';
export declare class QueryEnrichmentCursorDto {
    cursor?: string;
    limit?: number;
    sortBy?: EnrichmentSortField;
    sortOrder?: EnrichmentSortOrder;
    leadId?: string;
    provider?: string;
    status?: string;
}
