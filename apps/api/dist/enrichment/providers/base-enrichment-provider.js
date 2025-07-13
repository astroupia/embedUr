"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEnrichmentProvider = void 0;
const common_1 = require("@nestjs/common");
const enrichment_constants_1 = require("../constants/enrichment.constants");
let BaseEnrichmentProvider = class BaseEnrichmentProvider {
    logger = new common_1.Logger(this.constructor.name);
    async enrich(request) {
        const startTime = Date.now();
        try {
            this.logger.log(`Starting enrichment with ${this.name} for request:`, request);
            if (!this.canHandle(request)) {
                throw new Error(`Provider ${this.name} cannot handle this request`);
            }
            if (!this.isAvailable()) {
                throw new Error(`Provider ${this.name} is not available`);
            }
            const result = await this.performEnrichment(request);
            const durationMs = Date.now() - startTime;
            this.logger.log(`Enrichment completed with ${this.name} in ${durationMs}ms`);
            return {
                ...result,
                durationMs,
            };
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            this.logger.error(`Enrichment failed with ${this.name}:`, error);
            return {
                success: false,
                error: error.message,
                durationMs,
            };
        }
    }
    canHandle(request) {
        return !!(request.email || request.fullName || request.linkedinUrl);
    }
    getConfig() {
        return {
            name: this.name,
            provider: this.provider,
            maxRetries: enrichment_constants_1.ENRICHMENT_BUSINESS_RULES.MAX_RETRY_ATTEMPTS,
            timeout: enrichment_constants_1.ENRICHMENT_BUSINESS_RULES.REQUEST_TIMEOUT_MS,
        };
    }
    isAvailable() {
        return true;
    }
    standardizeData(rawData) {
        return {
            fullName: rawData.fullName || rawData.name || rawData.firstName + ' ' + rawData.lastName,
            email: rawData.email,
            phone: rawData.phone || rawData.phoneNumber,
            jobTitle: rawData.jobTitle || rawData.title || rawData.position,
            department: rawData.department,
            company: rawData.company || rawData.companyName,
            companySize: rawData.companySize,
            companyIndustry: rawData.industry || rawData.companyIndustry,
            companyWebsite: rawData.companyWebsite || rawData.website,
            location: rawData.location || rawData.city + ', ' + rawData.country,
            linkedinUrl: rawData.linkedinUrl || rawData.linkedin,
            twitterUrl: rawData.twitterUrl || rawData.twitter,
            facebookUrl: rawData.facebookUrl || rawData.facebook,
            verifiedEmail: rawData.verifiedEmail || rawData.emailVerified,
            verifiedPhone: rawData.verifiedPhone || rawData.phoneVerified,
            rawData,
        };
    }
    async handleRateLimit(retryCount = 0) {
        if (retryCount >= enrichment_constants_1.ENRICHMENT_BUSINESS_RULES.MAX_RETRY_ATTEMPTS) {
            throw new Error('Maximum retry attempts exceeded');
        }
        const delay = Math.pow(2, retryCount) * enrichment_constants_1.ENRICHMENT_BUSINESS_RULES.RATE_LIMIT_DELAY_MS;
        this.logger.log(`Rate limited, waiting ${delay}ms before retry ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
};
exports.BaseEnrichmentProvider = BaseEnrichmentProvider;
exports.BaseEnrichmentProvider = BaseEnrichmentProvider = __decorate([
    (0, common_1.Injectable)()
], BaseEnrichmentProvider);
//# sourceMappingURL=base-enrichment-provider.js.map