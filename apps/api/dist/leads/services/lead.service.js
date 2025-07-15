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
var LeadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const common_1 = require("@nestjs/common");
const lead_repository_1 = require("../repositories/lead.repository");
const lead_events_service_1 = require("./lead-events.service");
const lead_constants_1 = require("../constants/lead.constants");
const campaign_service_1 = require("../../campaigns/services/campaign.service");
const usage_metrics_service_1 = require("../../usage-metrics/usage-metrics.service");
const usage_metric_entity_1 = require("../../usage-metrics/entities/usage-metric.entity");
let LeadService = LeadService_1 = class LeadService {
    leadRepository;
    leadEvents;
    campaignService;
    usageMetricsService;
    logger = new common_1.Logger(LeadService_1.name);
    constructor(leadRepository, leadEvents, campaignService, usageMetricsService) {
        this.leadRepository = leadRepository;
        this.leadEvents = leadEvents;
        this.campaignService = campaignService;
        this.usageMetricsService = usageMetricsService;
    }
    async create(dto, companyId) {
        this.logger.log(`Creating lead for company ${companyId}: ${dto.email}`);
        if (dto.campaignId) {
            try {
                await this.campaignService.findOne(dto.campaignId, companyId);
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    throw new common_1.BadRequestException('Invalid campaign ID');
                }
                throw error;
            }
        }
        const existingLead = await this.leadRepository.findByEmail(dto.email, companyId);
        if (existingLead) {
            throw new common_1.ConflictException('Lead with this email already exists');
        }
        const lead = await this.leadRepository.create(dto, companyId);
        await this.usageMetricsService.incrementMetric(companyId, usage_metric_entity_1.MetricName.LEADS_CREATED);
        await this.leadEvents.logExecution(lead, 'LEAD_CREATED', {
            fullName: lead.fullName,
            email: lead.email,
            linkedinUrl: lead.linkedinUrl,
        });
        if (lead.linkedinUrl) {
            await this.leadEvents.triggerEnrichment(lead);
        }
        this.logger.log(`Lead created successfully: ${lead.id}`);
        return lead;
    }
    async findAll(companyId, query) {
        this.logger.log(`Fetching leads for company ${companyId} with cursor: ${query.cursor}`);
        const result = await this.leadRepository.findWithCursor(companyId, query);
        this.logger.log(`Found ${result.data.length} leads for company ${companyId}`);
        return result;
    }
    async findOne(id, companyId) {
        this.logger.log(`Fetching lead ${id} for company ${companyId}`);
        const lead = await this.leadRepository.findOne(id, companyId);
        this.logger.log(`Lead ${id} found successfully`);
        return lead;
    }
    async update(id, companyId, dto) {
        this.logger.log(`Updating lead ${id} for company ${companyId}`);
        const currentLead = await this.leadRepository.findOne(id, companyId);
        const previousStatus = currentLead.status;
        if (dto.status && dto.status !== previousStatus) {
            if (!currentLead.canTransitionTo(dto.status)) {
                throw new common_1.BadRequestException(`Invalid status transition from ${previousStatus} to ${dto.status}`);
            }
        }
        const updatedLead = await this.leadRepository.update(id, companyId, dto);
        await this.leadEvents.logExecution(updatedLead, 'LEAD_UPDATED', {
            previousData: {
                fullName: currentLead.fullName,
                status: previousStatus,
                verified: currentLead.verified,
            },
            newData: {
                fullName: updatedLead.fullName,
                status: updatedLead.status,
                verified: updatedLead.verified,
            },
        });
        if (dto.status && dto.status !== previousStatus) {
            await this.leadEvents.triggerStatusChangeWorkflow(updatedLead, previousStatus);
        }
        if (dto.linkedinUrl && !currentLead.linkedinUrl) {
            await this.leadEvents.triggerEnrichment(updatedLead);
        }
        this.logger.log(`Lead ${id} updated successfully`);
        return updatedLead;
    }
    async remove(id, companyId) {
        this.logger.log(`Removing lead ${id} for company ${companyId}`);
        const lead = await this.leadRepository.findOne(id, companyId);
        await this.leadRepository.remove(id, companyId);
        await this.leadEvents.logExecution(lead, 'LEAD_DELETED', {
            fullName: lead.fullName,
            email: lead.email,
            status: lead.status,
        });
        this.logger.log(`Lead ${id} removed successfully`);
    }
    async findByStatus(status, companyId) {
        this.logger.log(`Fetching leads with status ${status} for company ${companyId}`);
        const leads = await this.leadRepository.findByStatus(status, companyId);
        this.logger.log(`Found ${leads.length} leads with status ${status}`);
        return leads;
    }
    async getStats(companyId) {
        this.logger.log(`Fetching lead stats for company ${companyId}`);
        const total = await this.leadRepository.countByCompany(companyId);
        const byStatus = {
            [lead_constants_1.LeadStatus.NEW]: await this.leadRepository.countByStatus(lead_constants_1.LeadStatus.NEW, companyId),
            [lead_constants_1.LeadStatus.CONTACTED]: await this.leadRepository.countByStatus(lead_constants_1.LeadStatus.CONTACTED, companyId),
            [lead_constants_1.LeadStatus.INTERESTED]: await this.leadRepository.countByStatus(lead_constants_1.LeadStatus.INTERESTED, companyId),
            [lead_constants_1.LeadStatus.NOT_INTERESTED]: await this.leadRepository.countByStatus(lead_constants_1.LeadStatus.NOT_INTERESTED, companyId),
            [lead_constants_1.LeadStatus.BOOKED]: await this.leadRepository.countByStatus(lead_constants_1.LeadStatus.BOOKED, companyId),
            [lead_constants_1.LeadStatus.DO_NOT_CONTACT]: await this.leadRepository.countByStatus(lead_constants_1.LeadStatus.DO_NOT_CONTACT, companyId),
        };
        this.logger.log(`Lead stats for company ${companyId}: total=${total}`);
        return { total, byStatus };
    }
    async triggerEnrichment(id, companyId) {
        this.logger.log(`Manually triggering enrichment for lead ${id}`);
        const lead = await this.leadRepository.findOne(id, companyId);
        await this.leadEvents.triggerEnrichment(lead);
        this.logger.log(`Enrichment triggered successfully for lead ${id}`);
    }
};
exports.LeadService = LeadService;
exports.LeadService = LeadService = LeadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [lead_repository_1.LeadRepository,
        lead_events_service_1.LeadEventsService,
        campaign_service_1.CampaignService,
        usage_metrics_service_1.UsageMetricsService])
], LeadService);
//# sourceMappingURL=lead.service.js.map