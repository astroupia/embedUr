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
var EnrichmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentService = void 0;
const common_1 = require("@nestjs/common");
const enrichment_repository_1 = require("../repositories/enrichment.repository");
const enrichment_events_service_1 = require("../events/enrichment-events.service");
const apollo_enrichment_provider_1 = require("../providers/apollo-enrichment-provider");
const enrichment_request_entity_1 = require("../entities/enrichment-request.entity");
const enrichment_constants_1 = require("../constants/enrichment.constants");
const lead_repository_1 = require("../../leads/repositories/lead.repository");
const lead_events_service_1 = require("../../leads/services/lead-events.service");
let EnrichmentService = EnrichmentService_1 = class EnrichmentService {
    enrichmentRepository;
    enrichmentEvents;
    apolloProvider;
    leadRepository;
    leadEvents;
    logger = new common_1.Logger(EnrichmentService_1.name);
    constructor(enrichmentRepository, enrichmentEvents, apolloProvider, leadRepository, leadEvents) {
        this.enrichmentRepository = enrichmentRepository;
        this.enrichmentEvents = enrichmentEvents;
        this.apolloProvider = apolloProvider;
        this.leadRepository = leadRepository;
        this.leadEvents = leadEvents;
    }
    async triggerEnrichment(dto, companyId, triggeredBy) {
        this.logger.log(`Triggering enrichment for lead ${dto.leadId} in company ${companyId}`);
        const lead = await this.leadRepository.findOne(dto.leadId, companyId);
        if (!lead) {
            throw new common_1.NotFoundException(enrichment_constants_1.ENRICHMENT_ERROR_MESSAGES.LEAD_NOT_FOUND);
        }
        const activeEnrichment = await this.enrichmentRepository.findActiveEnrichment(dto.leadId, companyId);
        if (activeEnrichment) {
            throw new common_1.BadRequestException(enrichment_constants_1.ENRICHMENT_ERROR_MESSAGES.ALREADY_ENRICHING);
        }
        const provider = dto.provider || await this.getDefaultProvider(companyId);
        const enrichment = enrichment_request_entity_1.EnrichmentRequestEntity.create(provider, {
            email: lead.email,
            fullName: lead.fullName,
            linkedinUrl: lead.linkedinUrl,
            ...dto.requestData,
        }, dto.leadId, companyId);
        const createdEnrichment = await this.enrichmentRepository.create(enrichment);
        await this.enrichmentEvents.logEnrichmentRequest(createdEnrichment, triggeredBy);
        this.processEnrichment(createdEnrichment.id, companyId).catch(error => {
            this.logger.error(`Enrichment processing failed for ${createdEnrichment.id}:`, error);
        });
        return createdEnrichment;
    }
    async retryEnrichment(enrichmentId, companyId, dto, triggeredBy) {
        this.logger.log(`Retrying enrichment ${enrichmentId} for company ${companyId}`);
        const originalEnrichment = await this.enrichmentRepository.findOne(enrichmentId, companyId);
        if (!originalEnrichment.canBeRetried) {
            throw new common_1.BadRequestException('Enrichment cannot be retried');
        }
        const retryEnrichment = originalEnrichment.withRetry();
        if (dto.requestData) {
            retryEnrichment.requestData = { ...retryEnrichment.requestData, ...dto.requestData };
        }
        if (dto.provider) {
            retryEnrichment.provider = dto.provider;
        }
        const createdRetry = await this.enrichmentRepository.create(retryEnrichment);
        await this.enrichmentEvents.logEnrichmentRetry(createdRetry, createdRetry.retryCount || 0);
        this.processEnrichment(createdRetry.id, companyId).catch(error => {
            this.logger.error(`Enrichment retry processing failed for ${createdRetry.id}:`, error);
        });
        return createdRetry;
    }
    async findAll(companyId, query) {
        this.logger.log(`Fetching enrichment requests for company ${companyId}`);
        return this.enrichmentRepository.findWithCursor(companyId, query);
    }
    async findOne(id, companyId) {
        this.logger.log(`Fetching enrichment request ${id} for company ${companyId}`);
        return this.enrichmentRepository.findOne(id, companyId);
    }
    async findByLead(leadId, companyId) {
        this.logger.log(`Fetching enrichment requests for lead ${leadId} in company ${companyId}`);
        return this.enrichmentRepository.findByLead(leadId, companyId);
    }
    async findByProvider(provider, companyId) {
        this.logger.log(`Fetching enrichment requests for provider ${provider} in company ${companyId}`);
        return this.enrichmentRepository.findByProvider(provider, companyId);
    }
    async getStats(companyId) {
        this.logger.log(`Fetching enrichment stats for company ${companyId}`);
        const stats = await this.enrichmentRepository.getStats(companyId);
        await this.enrichmentEvents.logEnrichmentStats(companyId, {
            total: stats.total,
            successful: stats.successful,
            failed: stats.failed,
            pending: stats.pending,
        });
        return stats;
    }
    async processEnrichment(enrichmentId, companyId) {
        try {
            const enrichment = await this.enrichmentRepository.findOne(enrichmentId, companyId);
            const inProgressEnrichment = enrichment.withStatus(enrichment_constants_1.EnrichmentStatus.IN_PROGRESS);
            await this.enrichmentRepository.update(enrichmentId, companyId, inProgressEnrichment);
            const provider = this.getProvider(enrichment.provider);
            if (!provider.isAvailable()) {
                throw new Error(`Provider ${enrichment.provider} is not available`);
            }
            const result = await provider.enrich(enrichment.requestData);
            if (result.success && result.data) {
                await this.updateLeadWithEnrichedData(enrichment.leadId, companyId, result.data, enrichmentId);
                const successfulEnrichment = enrichment.withStatus(enrichment_constants_1.EnrichmentStatus.SUCCESS, result.data);
                await this.enrichmentRepository.update(enrichmentId, companyId, successfulEnrichment);
                await this.enrichmentEvents.logEnrichmentCompletion(successfulEnrichment, true);
            }
            else {
                const failedEnrichment = enrichment.withStatus(enrichment_constants_1.EnrichmentStatus.FAILED, undefined, result.error);
                await this.enrichmentRepository.update(enrichmentId, companyId, failedEnrichment);
                await this.enrichmentEvents.logEnrichmentCompletion(failedEnrichment, false);
                await this.enrichmentEvents.notifyEnrichmentFailure(failedEnrichment, result.error || 'Unknown error');
            }
        }
        catch (error) {
            this.logger.error(`Enrichment processing failed for ${enrichmentId}:`, error);
            try {
                const enrichment = await this.enrichmentRepository.findOne(enrichmentId, companyId);
                const failedEnrichment = enrichment.withStatus(enrichment_constants_1.EnrichmentStatus.FAILED, undefined, error.message);
                await this.enrichmentRepository.update(enrichmentId, companyId, failedEnrichment);
                await this.enrichmentEvents.logEnrichmentCompletion(failedEnrichment, false);
                await this.enrichmentEvents.notifyEnrichmentFailure(failedEnrichment, error.message);
            }
            catch (updateError) {
                this.logger.error(`Failed to update enrichment status for ${enrichmentId}:`, updateError);
            }
        }
    }
    async updateLeadWithEnrichedData(leadId, companyId, enrichedData, enrichmentId) {
        const additionalFields = {};
        if (enrichedData.linkedinUrl) {
            additionalFields.linkedinUrl = enrichedData.linkedinUrl;
        }
        if (enrichedData.verifiedEmail) {
            additionalFields.verified = true;
        }
        await this.leadRepository.updateEnrichmentData(leadId, companyId, enrichedData, additionalFields);
        const updatedFields = Object.keys({ enrichedData, ...additionalFields });
        await this.enrichmentEvents.logLeadDataUpdate(leadId, companyId, updatedFields, enrichmentId);
    }
    getProvider(provider) {
        switch (provider) {
            case enrichment_constants_1.EnrichmentProvider.APOLLO:
                return this.apolloProvider;
            default:
                throw new Error(`Provider ${provider} not implemented`);
        }
    }
    async getDefaultProvider(companyId) {
        return enrichment_constants_1.EnrichmentProvider.APOLLO;
    }
    async triggerEnrichmentWorkflow(leadId, companyId) {
        this.logger.log(`Triggering enrichment workflow for lead ${leadId} in company ${companyId}`);
        const lead = await this.leadRepository.findOneWithCampaign(leadId, companyId);
        if (!lead.linkedinUrl || !lead.email) {
            throw new common_1.BadRequestException('Lead missing required fields: linkedinUrl and email');
        }
        const payload = {
            leadId: lead.id,
            name: lead.fullName,
            email: lead.email,
            company: lead.enrichmentData?.company || '',
            jobTitle: lead.enrichmentData?.jobTitle || '',
            linkedinUrl: lead.linkedinUrl,
            companyId: lead.companyId,
            campaignId: lead.campaignId,
            clientId: lead.campaign?.name || 'default',
            credentials: {
                airtableApiKey: process.env.AIRTABLE_API_KEY,
                openRouterApiKey: process.env.OPENROUTER_API_KEY,
                emailVerificationApiKey: process.env.NEVERBOUNCE_API_KEY,
                clearbitApiKey: process.env.CLEARBIT_API_KEY,
            },
            config: {
                airtableBaseId: process.env.AIRTABLE_BASE_ID,
                airtableTableName: process.env.AIRTABLE_TABLE_NAME,
                backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                backendCompleteUrl: `${process.env.BACKEND_URL}/api/enrichment/complete`,
            },
            prompts: {
                enrichmentPrompt: 'Enrich with industry and company size from web search',
            },
        };
        const enrichmentRequest = enrichment_request_entity_1.EnrichmentRequestEntity.create(enrichment_constants_1.EnrichmentProvider.N8N, payload, leadId, companyId);
        const createdEnrichment = await this.enrichmentRepository.create(enrichmentRequest);
        await this.enrichmentEvents.logEnrichmentRequest(createdEnrichment, 'EnrichmentService');
        try {
            await this.leadEvents.triggerEnrichment({ id: leadId, companyId });
            this.logger.log(`Enrichment workflow triggered successfully for lead ${leadId}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger enrichment workflow for lead ${leadId}:`, error);
            const failedEnrichment = createdEnrichment.withStatus(enrichment_constants_1.EnrichmentStatus.FAILED);
            await this.enrichmentRepository.update(createdEnrichment.id, companyId, failedEnrichment);
            throw error;
        }
    }
};
exports.EnrichmentService = EnrichmentService;
exports.EnrichmentService = EnrichmentService = EnrichmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [enrichment_repository_1.EnrichmentRepository,
        enrichment_events_service_1.EnrichmentEventsService,
        apollo_enrichment_provider_1.ApolloEnrichmentProvider,
        lead_repository_1.LeadRepository,
        lead_events_service_1.LeadEventsService])
], EnrichmentService);
//# sourceMappingURL=enrichment.service.js.map