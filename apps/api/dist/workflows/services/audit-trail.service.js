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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailService = void 0;
const common_1 = require("@nestjs/common");
const admin_repository_1 = require("../../admin/admin.repository");
let AuditTrailService = class AuditTrailService {
    adminRepository;
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    async log(data) {
        try {
            await this.adminRepository.createActionLog({
                action: data.action,
                targetType: data.entity,
                targetId: data.entityId,
                performedBy: data.performedById || process.env.SYSTEM_USER_ID || 'system',
                details: {
                    companyId: data.companyId,
                    changes: data.changes,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Failed to log audit trail entry:', error);
        }
    }
    async logWorkflowEvent(workflowId, action, companyId, performedById, details) {
        await this.log({
            entity: 'Workflow',
            entityId: workflowId,
            action,
            performedById,
            companyId,
            changes: details,
        });
    }
    async logWorkflowExecutionEvent(executionId, action, companyId, performedById, details) {
        await this.log({
            entity: 'WorkflowExecution',
            entityId: executionId,
            action,
            performedById,
            companyId,
            changes: details,
        });
    }
    async logTargetAudienceTranslatorEvent(translationId, action, companyId, performedById, details) {
        await this.log({
            entity: 'TargetAudienceTranslator',
            entityId: translationId,
            action,
            performedById,
            companyId,
            changes: details,
        });
    }
    async logEnrichmentEvent(enrichmentId, action, companyId, performedById, details) {
        await this.log({
            entity: 'EnrichmentRequest',
            entityId: enrichmentId,
            action,
            performedById,
            companyId,
            changes: details,
        });
    }
};
exports.AuditTrailService = AuditTrailService;
exports.AuditTrailService = AuditTrailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_repository_1.AdminRepository])
], AuditTrailService);
//# sourceMappingURL=audit-trail.service.js.map