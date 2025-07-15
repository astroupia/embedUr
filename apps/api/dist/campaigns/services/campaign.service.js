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
var CampaignService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const common_1 = require("@nestjs/common");
const campaign_repository_1 = require("../repositories/campaign.repository");
const campaign_events_service_1 = require("./campaign-events.service");
const campaign_constants_1 = require("../constants/campaign.constants");
const ai_persona_service_1 = require("../../ai-persona/ai-persona.service");
let CampaignService = CampaignService_1 = class CampaignService {
    campaignRepository;
    campaignEvents;
    aiPersonaService;
    logger = new common_1.Logger(CampaignService_1.name);
    constructor(campaignRepository, campaignEvents, aiPersonaService) {
        this.campaignRepository = campaignRepository;
        this.campaignEvents = campaignEvents;
        this.aiPersonaService = aiPersonaService;
    }
    async create(dto, companyId) {
        this.logger.log(`Creating campaign for company ${companyId}: ${dto.name}`);
        if (dto.aiPersonaId) {
            try {
                await this.aiPersonaService.findById(dto.aiPersonaId, companyId);
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    throw new common_1.BadRequestException('Invalid AI persona ID');
                }
                throw error;
            }
        }
        const campaign = await this.campaignRepository.create(dto, companyId);
        await this.campaignEvents.logExecution(campaign, 'CAMPAIGN_CREATED', {
            name: campaign.name,
            description: campaign.description,
            aiPersonaId: campaign.aiPersonaId,
            workflowId: campaign.workflowId,
        });
        this.logger.log(`Campaign created successfully: ${campaign.id}`);
        return campaign;
    }
    async findAll(companyId, query) {
        this.logger.log(`Fetching campaigns for company ${companyId} with cursor: ${query.cursor}`);
        const result = await this.campaignRepository.findWithCursor(companyId, query);
        this.logger.log(`Found ${result.data.length} campaigns for company ${companyId}`);
        return result;
    }
    async findOne(id, companyId) {
        this.logger.log(`Fetching campaign ${id} for company ${companyId}`);
        const campaign = await this.campaignRepository.findOne(id, companyId);
        this.logger.log(`Campaign ${id} found successfully`);
        return campaign;
    }
    async update(id, companyId, dto) {
        this.logger.log(`Updating campaign ${id} for company ${companyId}`);
        if (dto.aiPersonaId) {
            try {
                await this.aiPersonaService.findById(dto.aiPersonaId, companyId);
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    throw new common_1.BadRequestException('Invalid AI persona ID');
                }
                throw error;
            }
        }
        const currentCampaign = await this.campaignRepository.findOne(id, companyId);
        const previousStatus = currentCampaign.status;
        const updatedCampaign = await this.campaignRepository.update(id, companyId, dto);
        await this.campaignEvents.logExecution(updatedCampaign, 'CAMPAIGN_UPDATED', {
            previousData: {
                name: currentCampaign.name,
                status: previousStatus,
                aiPersonaId: currentCampaign.aiPersonaId,
                workflowId: currentCampaign.workflowId,
            },
            newData: {
                name: updatedCampaign.name,
                status: updatedCampaign.status,
                aiPersonaId: updatedCampaign.aiPersonaId,
                workflowId: updatedCampaign.workflowId,
            },
        });
        if (dto.status && dto.status !== previousStatus) {
            await this.handleStatusChange(updatedCampaign, previousStatus);
        }
        this.logger.log(`Campaign ${id} updated successfully`);
        return updatedCampaign;
    }
    async archive(id, companyId) {
        this.logger.log(`Archiving campaign ${id} for company ${companyId}`);
        const campaign = await this.campaignRepository.findOne(id, companyId);
        const previousStatus = campaign.status;
        const archivedCampaign = await this.campaignRepository.archive(id, companyId);
        await this.campaignEvents.logExecution(archivedCampaign, 'CAMPAIGN_ARCHIVED', {
            previousStatus,
            name: archivedCampaign.name,
        });
        this.logger.log(`Campaign ${id} archived successfully`);
        return archivedCampaign;
    }
    async remove(id, companyId) {
        this.logger.log(`Removing campaign ${id} for company ${companyId}`);
        const campaign = await this.campaignRepository.findOne(id, companyId);
        await this.campaignRepository.remove(id, companyId);
        await this.campaignEvents.logExecution(campaign, 'CAMPAIGN_DELETED', {
            name: campaign.name,
            status: campaign.status,
        });
        this.logger.log(`Campaign ${id} removed successfully`);
    }
    async findByStatus(status, companyId) {
        this.logger.log(`Fetching campaigns with status ${status} for company ${companyId}`);
        const campaigns = await this.campaignRepository.findByStatus(status, companyId);
        this.logger.log(`Found ${campaigns.length} campaigns with status ${status}`);
        return campaigns;
    }
    async getStats(companyId) {
        this.logger.log(`Fetching campaign stats for company ${companyId}`);
        const total = await this.campaignRepository.countByCompany(companyId);
        const active = await this.campaignRepository.countActiveByCompany(companyId);
        const byStatus = {
            [campaign_constants_1.CampaignStatus.DRAFT]: await this.campaignRepository.countByStatus(campaign_constants_1.CampaignStatus.DRAFT, companyId),
            [campaign_constants_1.CampaignStatus.ACTIVE]: await this.campaignRepository.countByStatus(campaign_constants_1.CampaignStatus.ACTIVE, companyId),
            [campaign_constants_1.CampaignStatus.PAUSED]: await this.campaignRepository.countByStatus(campaign_constants_1.CampaignStatus.PAUSED, companyId),
            [campaign_constants_1.CampaignStatus.COMPLETED]: await this.campaignRepository.countByStatus(campaign_constants_1.CampaignStatus.COMPLETED, companyId),
            [campaign_constants_1.CampaignStatus.ARCHIVED]: await this.campaignRepository.countByStatus(campaign_constants_1.CampaignStatus.ARCHIVED, companyId),
        };
        this.logger.log(`Campaign stats for company ${companyId}: total=${total}, active=${active}`);
        return { total, byStatus, active };
    }
    async activate(id, companyId) {
        this.logger.log(`Activating campaign ${id} for company ${companyId}`);
        const campaign = await this.campaignRepository.findOne(id, companyId);
        if (!campaign.canActivate()) {
            throw new common_1.BadRequestException(`Campaign cannot be activated from status ${campaign.status}`);
        }
        const updatedCampaign = await this.campaignRepository.update(id, companyId, { status: campaign_constants_1.CampaignStatus.ACTIVE });
        await this.campaignEvents.triggerCampaignActivation(updatedCampaign);
        this.logger.log(`Campaign ${id} activated successfully`);
        return updatedCampaign;
    }
    async pause(id, companyId) {
        this.logger.log(`Pausing campaign ${id} for company ${companyId}`);
        const campaign = await this.campaignRepository.findOne(id, companyId);
        if (!campaign.canPause()) {
            throw new common_1.BadRequestException(`Campaign cannot be paused from status ${campaign.status}`);
        }
        const updatedCampaign = await this.campaignRepository.update(id, companyId, { status: campaign_constants_1.CampaignStatus.PAUSED });
        await this.campaignEvents.triggerCampaignPause(updatedCampaign);
        this.logger.log(`Campaign ${id} paused successfully`);
        return updatedCampaign;
    }
    async complete(id, companyId) {
        this.logger.log(`Completing campaign ${id} for company ${companyId}`);
        const campaign = await this.campaignRepository.findOne(id, companyId);
        if (!campaign.canComplete()) {
            throw new common_1.BadRequestException(`Campaign cannot be completed from status ${campaign.status}`);
        }
        const updatedCampaign = await this.campaignRepository.update(id, companyId, { status: campaign_constants_1.CampaignStatus.COMPLETED });
        await this.campaignEvents.triggerCampaignCompletion(updatedCampaign);
        this.logger.log(`Campaign ${id} completed successfully`);
        return updatedCampaign;
    }
    async handleStatusChange(campaign, previousStatus) {
        await this.campaignEvents.triggerStatusChangeWorkflow(campaign, previousStatus);
        switch (campaign.status) {
            case campaign_constants_1.CampaignStatus.ACTIVE:
                await this.campaignEvents.triggerCampaignActivation(campaign);
                break;
            case campaign_constants_1.CampaignStatus.PAUSED:
                await this.campaignEvents.triggerCampaignPause(campaign);
                break;
            case campaign_constants_1.CampaignStatus.COMPLETED:
                await this.campaignEvents.triggerCampaignCompletion(campaign);
                break;
        }
    }
};
exports.CampaignService = CampaignService;
exports.CampaignService = CampaignService = CampaignService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [campaign_repository_1.CampaignRepository,
        campaign_events_service_1.CampaignEventsService,
        ai_persona_service_1.AIPersonaService])
], CampaignService);
//# sourceMappingURL=campaign.service.js.map