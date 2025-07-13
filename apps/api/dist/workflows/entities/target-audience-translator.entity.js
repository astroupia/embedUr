"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetAudienceTranslatorEntity = void 0;
class TargetAudienceTranslatorEntity {
    id;
    inputFormat;
    targetAudienceData;
    structuredData;
    config;
    leads;
    enrichmentSchema;
    interpretedCriteria;
    reasoning;
    confidence;
    status;
    errorMessage;
    companyId;
    createdBy;
    createdAt;
    updatedAt;
    constructor(id, inputFormat, targetAudienceData, structuredData, config, leads, enrichmentSchema, interpretedCriteria, reasoning, confidence, status, errorMessage, companyId, createdBy, createdAt, updatedAt) {
        this.id = id;
        this.inputFormat = inputFormat;
        this.targetAudienceData = targetAudienceData;
        this.structuredData = structuredData;
        this.config = config;
        this.leads = leads;
        this.enrichmentSchema = enrichmentSchema;
        this.interpretedCriteria = interpretedCriteria;
        this.reasoning = reasoning;
        this.confidence = confidence;
        this.status = status;
        this.errorMessage = errorMessage;
        this.companyId = companyId;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    get isCompleted() {
        return this.status === 'SUCCESS' || this.status === 'FAILED';
    }
    get isSuccessful() {
        return this.status === 'SUCCESS';
    }
    get isFailed() {
        return this.status === 'FAILED';
    }
    get hasLeads() {
        return this.leads !== null && this.leads.length > 0;
    }
    get hasEnrichmentSchema() {
        return this.enrichmentSchema !== null;
    }
    get leadCount() {
        return this.leads?.length || 0;
    }
    get requiredFieldsCount() {
        return this.enrichmentSchema?.requiredFields.length || 0;
    }
    get optionalFieldsCount() {
        return this.enrichmentSchema?.optionalFields.length || 0;
    }
    static create(inputFormat, targetAudienceData, structuredData, config, companyId, createdBy) {
        return new TargetAudienceTranslatorEntity('', inputFormat, targetAudienceData, structuredData, config, null, null, null, null, null, 'PENDING', null, companyId, createdBy, new Date(), new Date());
    }
    withStatus(status, leads, enrichmentSchema, interpretedCriteria, reasoning, confidence, errorMessage) {
        return new TargetAudienceTranslatorEntity(this.id, this.inputFormat, this.targetAudienceData, this.structuredData, this.config, leads || this.leads, enrichmentSchema || this.enrichmentSchema, interpretedCriteria || this.interpretedCriteria, reasoning || this.reasoning, confidence || this.confidence, status, errorMessage || this.errorMessage, this.companyId, this.createdBy, this.createdAt, new Date());
    }
    withResults(leads, enrichmentSchema, interpretedCriteria, reasoning, confidence) {
        return this.withStatus('SUCCESS', leads, enrichmentSchema, interpretedCriteria, reasoning, confidence);
    }
    withError(errorMessage) {
        return this.withStatus('FAILED', undefined, undefined, undefined, undefined, undefined, errorMessage);
    }
}
exports.TargetAudienceTranslatorEntity = TargetAudienceTranslatorEntity;
//# sourceMappingURL=target-audience-translator.entity.js.map