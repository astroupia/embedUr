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
var TargetAudienceTranslatorEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetAudienceTranslatorEventsService = void 0;
const common_1 = require("@nestjs/common");
const audit_trail_service_1 = require("./audit-trail.service");
let TargetAudienceTranslatorEventsService = TargetAudienceTranslatorEventsService_1 = class TargetAudienceTranslatorEventsService {
    auditTrailService;
    logger = new common_1.Logger(TargetAudienceTranslatorEventsService_1.name);
    constructor(auditTrailService) {
        this.auditTrailService = auditTrailService;
    }
    async logCreation(translation, details) {
        this.logger.log(`Target audience translator created: ${translation.id} for company ${translation.companyId}`);
        await this.auditTrailService.logTargetAudienceTranslatorEvent(translation.id, 'TARGET_AUDIENCE_TRANSLATOR_CREATED', translation.companyId, translation.createdBy, details);
    }
    async logCompletion(translation, details) {
        this.logger.log(`Target audience translator completed: ${translation.id} for company ${translation.companyId}`);
        await this.auditTrailService.logTargetAudienceTranslatorEvent(translation.id, 'TARGET_AUDIENCE_TRANSLATOR_COMPLETED', translation.companyId, translation.createdBy, details);
    }
    async logFailure(translation, details) {
        this.logger.warn(`Target audience translator failed: ${translation.id} for company ${translation.companyId}`);
        await this.auditTrailService.logTargetAudienceTranslatorEvent(translation.id, 'TARGET_AUDIENCE_TRANSLATOR_FAILED', translation.companyId, translation.createdBy, details);
    }
    async logRetry(translation, details) {
        this.logger.log(`Target audience translator retry: ${translation.id} for company ${translation.companyId}`);
        await this.auditTrailService.logTargetAudienceTranslatorEvent(translation.id, 'TARGET_AUDIENCE_TRANSLATOR_RETRY', translation.companyId, translation.createdBy, details);
    }
};
exports.TargetAudienceTranslatorEventsService = TargetAudienceTranslatorEventsService;
exports.TargetAudienceTranslatorEventsService = TargetAudienceTranslatorEventsService = TargetAudienceTranslatorEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_trail_service_1.AuditTrailService])
], TargetAudienceTranslatorEventsService);
//# sourceMappingURL=target-audience-translator-events.service.js.map