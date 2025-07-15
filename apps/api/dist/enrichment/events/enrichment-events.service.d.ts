import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
import { EnrichmentProvider } from '../constants/enrichment.constants';
import { AuditTrailService } from '../../workflows/services/audit-trail.service';
export declare class EnrichmentEventsService {
    private readonly auditTrailService;
    private readonly logger;
    constructor(auditTrailService: AuditTrailService);
    logEnrichmentRequest(enrichment: EnrichmentRequestEntity, triggeredBy: string): Promise<void>;
    logEnrichmentCompletion(enrichment: EnrichmentRequestEntity, success: boolean): Promise<void>;
    logEnrichmentRetry(enrichment: EnrichmentRequestEntity, retryCount: number): Promise<void>;
    notifyEnrichmentFailure(enrichment: EnrichmentRequestEntity, error: string): Promise<void>;
    notifyProviderUnavailable(provider: EnrichmentProvider, companyId: string): Promise<void>;
    logEnrichmentStats(companyId: string, stats: {
        total: number;
        successful: number;
        failed: number;
        pending: number;
    }): Promise<void>;
    logLeadDataUpdate(leadId: string, companyId: string, updatedFields: string[], enrichmentId: string): Promise<void>;
    logWorkflowCompletion(leadId: string, companyId: string, workflowName: string, success: boolean, outputData?: Record<string, any>, errorMessage?: string): Promise<void>;
    triggerNextWorkflow(leadId: string, companyId: string, currentWorkflow: string): Promise<void>;
}
