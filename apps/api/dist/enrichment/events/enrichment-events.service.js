"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EnrichmentEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentEventsService = void 0;
const common_1 = require("@nestjs/common");
const audit_trail_service_1 = require("../../workflows/services/audit-trail.service");
let EnrichmentEventsService = EnrichmentEventsService_1 = class EnrichmentEventsService {
    auditTrailService;
    logger = new common_1.Logger(EnrichmentEventsService_1.name);
    constructor(auditTrailService) {
        this.auditTrailService = auditTrailService;
    }
    async logEnrichmentRequest(enrichment, triggeredBy) {
        this.logger.log(`Enrichment request created: ${enrichment.id} for lead ${enrichment.leadId} by ${triggeredBy}`);
        await this.auditTrailService.logEnrichmentEvent(enrichment.id, 'ENRICHMENT_REQUESTED', enrichment.companyId, triggeredBy, {
            provider: enrichment.provider,
            leadId: enrichment.leadId,
        });
    }
    async logEnrichmentCompletion(enrichment, success) {
        const action = success ? 'ENRICHMENT_COMPLETED' : 'ENRICHMENT_FAILED';
        this.logger.log(`Enrichment ${action}: ${enrichment.id} for lead ${enrichment.leadId}`);
        await this.auditTrailService.logEnrichmentEvent(enrichment.id, action, enrichment.companyId, undefined, {
            status: enrichment.status,
            durationMs: enrichment.durationMs,
            errorMessage: enrichment.errorMessage,
        });
    }
    async logEnrichmentRetry(enrichment, retryCount) {
        this.logger.log(`Enrichment retry ${retryCount}: ${enrichment.id} for lead ${enrichment.leadId}`);
        await this.auditTrailService.logEnrichmentEvent(enrichment.id, 'ENRICHMENT_RETRY', enrichment.companyId, undefined, {
            retryCount,
            provider: enrichment.provider,
        });
    }
    async notifyEnrichmentFailure(enrichment, error) {
        this.logger.warn(`Enrichment failure notification: ${enrichment.id} - ${error}`);
    }
    async notifyProviderUnavailable(provider, companyId) {
        this.logger.warn(`Provider unavailable notification: ${provider} for company ${companyId}`);
    }
    async logEnrichmentStats(companyId, stats) {
        this.logger.log(`Enrichment stats for company ${companyId}:`, stats);
    }
    async logLeadDataUpdate(leadId, companyId, updatedFields, enrichmentId) {
        this.logger.log(`Lead data updated: ${leadId} with fields: ${updatedFields.join(', ')} via enrichment ${enrichmentId}`);
        await this.auditTrailService.log({
            entity: 'Lead',
            entityId: leadId,
            action: 'LEAD_ENRICHED',
            companyId,
            changes: {
                updatedFields,
                enrichmentId,
            },
        });
    }
    async logWorkflowCompletion(leadId, companyId, workflowName, success, outputData, errorMessage) {
        const action = success ? 'WORKFLOW_COMPLETED' : 'WORKFLOW_FAILED';
        this.logger.log(`Workflow ${action}: ${workflowName} for lead ${leadId}`);
        await this.auditTrailService.log({
            entity: 'Lead',
            entityId: leadId,
            action,
            companyId,
            changes: {
                workflowName,
                success,
                outputData,
                errorMessage,
            },
        });
    }
    async triggerNextWorkflow(leadId, companyId, currentWorkflow) {
        this.logger.log(`Triggering next workflow for lead ${leadId} after ${currentWorkflow}`);
    }
};
exports.EnrichmentEventsService = EnrichmentEventsService;
exports.EnrichmentEventsService = EnrichmentEventsService = EnrichmentEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_trail_service_1.AuditTrailService])
], EnrichmentEventsService);
//# sourceMappingURL=enrichment-events.service.js.map