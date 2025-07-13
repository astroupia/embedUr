"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentRequestEntity = void 0;
const enrichment_constants_1 = require("../constants/enrichment.constants");
class EnrichmentRequestEntity {
    id;
    provider;
    requestData;
    responseData;
    status;
    leadId;
    companyId;
    createdAt;
    updatedAt;
    errorMessage;
    retryCount;
    durationMs;
    constructor(id, provider, requestData, responseData, status, leadId, companyId, createdAt, updatedAt, errorMessage, retryCount, durationMs) {
        this.id = id;
        this.provider = provider;
        this.requestData = requestData;
        this.responseData = responseData;
        this.status = status;
        this.leadId = leadId;
        this.companyId = companyId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.errorMessage = errorMessage;
        this.retryCount = retryCount;
        this.durationMs = durationMs;
    }
    get isCompleted() {
        return this.status === enrichment_constants_1.EnrichmentStatus.SUCCESS ||
            this.status === enrichment_constants_1.EnrichmentStatus.FAILED ||
            this.status === enrichment_constants_1.EnrichmentStatus.TIMEOUT;
    }
    get isSuccessful() {
        return this.status === enrichment_constants_1.EnrichmentStatus.SUCCESS;
    }
    get isFailed() {
        return this.status === enrichment_constants_1.EnrichmentStatus.FAILED ||
            this.status === enrichment_constants_1.EnrichmentStatus.TIMEOUT;
    }
    get canBeRetried() {
        return this.isFailed &&
            (this.retryCount || 0) < 3 &&
            this.status !== enrichment_constants_1.EnrichmentStatus.TIMEOUT;
    }
    get durationSeconds() {
        return this.durationMs ? Math.round(this.durationMs / 1000) : null;
    }
    get hasError() {
        return this.errorMessage !== undefined && this.errorMessage.length > 0;
    }
    get providerName() {
        const providerNames = {
            [enrichment_constants_1.EnrichmentProvider.APOLLO]: 'Apollo',
            [enrichment_constants_1.EnrichmentProvider.DROP_CONTACT]: 'DropContact',
            [enrichment_constants_1.EnrichmentProvider.CLEARBIT]: 'Clearbit',
        };
        return providerNames[this.provider];
    }
    static create(provider, requestData, leadId, companyId) {
        return new EnrichmentRequestEntity('', provider, requestData, null, enrichment_constants_1.EnrichmentStatus.PENDING, leadId, companyId, new Date(), new Date(), undefined, 0, undefined);
    }
    withStatus(status, responseData, errorMessage) {
        const endTime = this.isCompleted ? new Date() : new Date();
        const durationMs = endTime && this.createdAt
            ? endTime.getTime() - this.createdAt.getTime()
            : this.durationMs;
        return new EnrichmentRequestEntity(this.id, this.provider, this.requestData, responseData || this.responseData, status, this.leadId, this.companyId, this.createdAt, endTime, errorMessage, this.retryCount, durationMs);
    }
    withRetry() {
        return new EnrichmentRequestEntity(this.id, this.provider, this.requestData, this.responseData, enrichment_constants_1.EnrichmentStatus.PENDING, this.leadId, this.companyId, this.createdAt, new Date(), undefined, (this.retryCount || 0) + 1, undefined);
    }
}
exports.EnrichmentRequestEntity = EnrichmentRequestEntity;
//# sourceMappingURL=enrichment-request.entity.js.map