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
exports.CampaignRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const campaign_mapper_1 = require("../mappers/campaign.mapper");
const campaign_constants_1 = require("../constants/campaign.constants");
let CampaignRepository = class CampaignRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, companyId) {
        try {
            if (dto.aiPersonaId) {
                await this.validateAIPersonaOwnership(dto.aiPersonaId, companyId);
            }
            if (dto.workflowId) {
                await this.validateWorkflowOwnership(dto.workflowId, companyId);
            }
            const data = campaign_mapper_1.CampaignMapper.toPrismaCreate(dto, companyId);
            const campaign = await this.prisma.campaign.create({ data });
            return campaign_mapper_1.CampaignMapper.toEntity(campaign);
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Campaign with this name already exists for this company');
            }
            throw error;
        }
    }
    async findWithCursor(companyId, query) {
        const { cursor, take = 20, status, search } = query;
        const takeNumber = typeof take === 'string' ? parseInt(take, 10) : take;
        const where = { companyId };
        if (status) {
            where.status = status;
        }
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        const items = await this.prisma.campaign.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: takeNumber + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            include: {
                aiPersona: true,
                workflow: true,
                _count: {
                    select: { leads: true },
                },
            },
        });
        const hasMore = items.length > takeNumber;
        const data = hasMore ? items.slice(0, -1) : items;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return {
            data: data.map(item => campaign_mapper_1.CampaignMapper.toEntity(item, item.aiPersona || undefined, item.workflow || undefined, item._count.leads)),
            nextCursor,
        };
    }
    async findOne(id, companyId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id, companyId },
            include: {
                aiPersona: true,
                workflow: true,
                _count: {
                    select: { leads: true },
                },
            },
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign with ID ${id} not found`);
        }
        return campaign_mapper_1.CampaignMapper.toEntity(campaign, campaign.aiPersona || undefined, campaign.workflow || undefined, campaign._count.leads);
    }
    async update(id, companyId, dto) {
        const existingCampaign = await this.findOne(id, companyId);
        if (!existingCampaign.isEditable) {
            throw new common_1.BadRequestException('Campaign cannot be edited in its current status');
        }
        if (dto.status && !existingCampaign.canTransitionTo(dto.status)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${existingCampaign.status} to ${dto.status}`);
        }
        if (dto.aiPersonaId) {
            await this.validateAIPersonaOwnership(dto.aiPersonaId, companyId);
        }
        if (dto.workflowId) {
            await this.validateWorkflowOwnership(dto.workflowId, companyId);
        }
        const data = campaign_mapper_1.CampaignMapper.toPrismaUpdate(dto);
        const campaign = await this.prisma.campaign.update({
            where: { id },
            data,
            include: {
                aiPersona: true,
                workflow: true,
                _count: {
                    select: { leads: true },
                },
            },
        });
        return campaign_mapper_1.CampaignMapper.toEntity(campaign, campaign.aiPersona || undefined, campaign.workflow || undefined, campaign._count.leads);
    }
    async archive(id, companyId) {
        const existingCampaign = await this.findOne(id, companyId);
        if (!existingCampaign.canArchive()) {
            throw new common_1.BadRequestException('Campaign cannot be archived in its current status');
        }
        const campaign = await this.prisma.campaign.update({
            where: { id },
            data: { status: campaign_constants_1.CampaignStatus.ARCHIVED },
            include: {
                aiPersona: true,
                workflow: true,
                _count: {
                    select: { leads: true },
                },
            },
        });
        return campaign_mapper_1.CampaignMapper.toEntity(campaign, campaign.aiPersona || undefined, campaign.workflow || undefined, campaign._count.leads);
    }
    async remove(id, companyId) {
        const existingCampaign = await this.findOne(id, companyId);
        if (!existingCampaign.isDeletable) {
            throw new common_1.BadRequestException('Campaign cannot be deleted in its current status');
        }
        await this.prisma.campaign.delete({
            where: { id },
        });
    }
    async findByStatus(status, companyId) {
        const campaigns = await this.prisma.campaign.findMany({
            where: { status, companyId },
            orderBy: { createdAt: 'desc' },
            include: {
                aiPersona: true,
                workflow: true,
                _count: {
                    select: { leads: true },
                },
            },
        });
        return campaigns.map(campaign => campaign_mapper_1.CampaignMapper.toEntity(campaign, campaign.aiPersona || undefined, campaign.workflow || undefined, campaign._count.leads));
    }
    async countByCompany(companyId) {
        return this.prisma.campaign.count({
            where: { companyId },
        });
    }
    async countByStatus(status, companyId) {
        return this.prisma.campaign.count({
            where: { status, companyId },
        });
    }
    async countActiveByCompany(companyId) {
        return this.prisma.campaign.count({
            where: {
                companyId,
                status: { in: [campaign_constants_1.CampaignStatus.ACTIVE, campaign_constants_1.CampaignStatus.PAUSED] },
            },
        });
    }
    async validateAIPersonaOwnership(aiPersonaId, companyId) {
        const aiPersona = await this.prisma.aIPersona.findFirst({
            where: { id: aiPersonaId, companyId },
        });
        if (!aiPersona) {
            throw new common_1.BadRequestException('AI Persona not found or does not belong to this company');
        }
    }
    async validateWorkflowOwnership(workflowId, companyId) {
        const workflow = await this.prisma.workflow.findFirst({
            where: { id: workflowId, companyId },
        });
        if (!workflow) {
            throw new common_1.BadRequestException('Workflow not found or does not belong to this company');
        }
    }
};
exports.CampaignRepository = CampaignRepository;
exports.CampaignRepository = CampaignRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignRepository);
//# sourceMappingURL=campaign.repository.js.map