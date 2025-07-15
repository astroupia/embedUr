import { AdminRepository } from '../../admin/admin.repository';
export interface AuditTrailLogData {
    entity: string;
    entityId: string;
    action: string;
    performedById?: string;
    companyId: string;
    changes?: Record<string, any>;
}
export declare class AuditTrailService {
    private readonly adminRepository;
    constructor(adminRepository: AdminRepository);
    log(data: AuditTrailLogData): Promise<void>;
    logWorkflowEvent(workflowId: string, action: string, companyId: string, performedById?: string, details?: Record<string, any>): Promise<void>;
    logWorkflowExecutionEvent(executionId: string, action: string, companyId: string, performedById?: string, details?: Record<string, any>): Promise<void>;
    logTargetAudienceTranslatorEvent(translationId: string, action: string, companyId: string, performedById?: string, details?: Record<string, any>): Promise<void>;
    logEnrichmentEvent(enrichmentId: string, action: string, companyId: string, performedById?: string, details?: Record<string, any>): Promise<void>;
}
