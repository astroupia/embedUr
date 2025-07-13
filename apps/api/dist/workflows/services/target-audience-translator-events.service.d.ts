import { TargetAudienceTranslatorEntity } from '../entities/target-audience-translator.entity';
import { AuditTrailService } from './audit-trail.service';
export declare class TargetAudienceTranslatorEventsService {
    private readonly auditTrailService;
    private readonly logger;
    constructor(auditTrailService: AuditTrailService);
    logCreation(translation: TargetAudienceTranslatorEntity, details: Record<string, any>): Promise<void>;
    logCompletion(translation: TargetAudienceTranslatorEntity, details: Record<string, any>): Promise<void>;
    logFailure(translation: TargetAudienceTranslatorEntity, details: Record<string, any>): Promise<void>;
    logRetry(translation: TargetAudienceTranslatorEntity, details: Record<string, any>): Promise<void>;
}
