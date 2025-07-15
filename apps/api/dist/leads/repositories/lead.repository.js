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
exports.LeadRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const lead_mapper_1 = require("../mappers/lead.mapper");
let LeadRepository = class LeadRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, companyId) {
        try {
            const data = lead_mapper_1.LeadMapper.toPrismaCreate(dto, companyId);
            const lead = await this.prisma.lead.create({ data });
            return lead_mapper_1.LeadMapper.toEntity(lead);
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Lead with this email already exists for this company');
            }
            throw error;
        }
    }
    async findWithCursor(companyId, query) {
        const { cursor, take = 20, status, search, campaignId } = query;
        const takeNumber = typeof take === 'string' ? parseInt(take, 10) : take;
        const where = { companyId };
        if (status) {
            where.status = status;
        }
        if (campaignId) {
            where.campaignId = campaignId;
        }
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const items = await this.prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: takeNumber + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            include: {
                campaign: {
                    include: {
                        aiPersona: true,
                    },
                },
            },
        });
        const hasMore = items.length > takeNumber;
        const data = hasMore ? items.slice(0, -1) : items;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return {
            data: data.map(item => lead_mapper_1.LeadMapper.toEntity(item)),
            nextCursor,
        };
    }
    async findOne(id, companyId) {
        const lead = await this.prisma.lead.findFirst({
            where: { id, companyId },
            include: {
                campaign: {
                    include: {
                        aiPersona: true,
                    },
                },
            },
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        return lead_mapper_1.LeadMapper.toEntity(lead);
    }
    async update(id, companyId, dto) {
        await this.findOne(id, companyId);
        const data = lead_mapper_1.LeadMapper.toPrismaUpdate(dto);
        const lead = await this.prisma.lead.update({
            where: { id },
            data,
            include: {
                campaign: {
                    include: {
                        aiPersona: true,
                    },
                },
            },
        });
        return lead_mapper_1.LeadMapper.toEntity(lead);
    }
    async remove(id, companyId) {
        await this.findOne(id, companyId);
        await this.prisma.lead.delete({
            where: { id },
        });
    }
    async findByEmail(email, companyId) {
        const lead = await this.prisma.lead.findFirst({
            where: { email, companyId },
        });
        return lead ? lead_mapper_1.LeadMapper.toEntity(lead) : null;
    }
    async findByStatus(status, companyId) {
        const leads = await this.prisma.lead.findMany({
            where: { status, companyId },
            orderBy: { createdAt: 'desc' },
            include: {
                campaign: {
                    include: {
                        aiPersona: true,
                    },
                },
            },
        });
        return leads.map(lead_mapper_1.LeadMapper.toEntity);
    }
    async countByCompany(companyId) {
        return this.prisma.lead.count({
            where: { companyId },
        });
    }
    async countByStatus(status, companyId) {
        return this.prisma.lead.count({
            where: { status, companyId },
        });
    }
    async findOneWithCampaign(id, companyId) {
        const lead = await this.prisma.lead.findFirst({
            where: { id, companyId },
            include: { campaign: true },
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        return lead_mapper_1.LeadMapper.toEntity(lead);
    }
    async findOneWithEnrichmentData(id, companyId) {
        const lead = await this.prisma.lead.findFirst({
            where: { id, companyId },
            include: { campaign: true },
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        return lead_mapper_1.LeadMapper.toEntity(lead);
    }
    async updateEnrichmentData(id, companyId, enrichmentData, additionalFields) {
        const updateData = {
            enrichmentData,
            ...additionalFields,
        };
        const lead = await this.prisma.lead.updateMany({
            where: { id, companyId },
            data: updateData,
        });
        return this.findOne(id, companyId);
    }
    async updateStatus(id, companyId, status) {
        const lead = await this.prisma.lead.update({
            where: { id },
            data: { status },
        });
        return lead_mapper_1.LeadMapper.toEntity(lead);
    }
    async createAuditTrail(entityId, action, changes, companyId, performedById) {
        await this.prisma.auditTrail.create({
            data: {
                entity: 'Lead',
                entityId,
                action,
                changes,
                companyId,
                performedById,
            },
        });
    }
    async createEnrichmentRequest(leadId, data) {
        await this.prisma.enrichmentRequest.create({
            data: {
                provider: data.provider,
                requestData: data.requestData,
                status: 'PENDING',
                leadId,
                companyId: data.companyId,
            },
        });
    }
    async createEmailLog(leadId, data) {
        await this.prisma.emailLog.create({
            data: {
                status: data.status,
                leadId,
                campaignId: data.campaignId,
                companyId: data.companyId,
                metadata: data.metadata,
            },
        });
    }
    async createSystemNotification(message, level, companyId) {
        await this.prisma.systemNotification.create({
            data: {
                message,
                level: level,
                companyId,
            },
        });
    }
    async findOneWithCampaignAndAiPersona(id, companyId) {
        const lead = await this.prisma.lead.findFirst({
            where: { id, companyId },
            include: {
                campaign: {
                    include: {
                        aiPersona: true
                    }
                }
            },
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        return lead_mapper_1.LeadMapper.toEntity(lead);
    }
};
exports.LeadRepository = LeadRepository;
exports.LeadRepository = LeadRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadRepository);
//# sourceMappingURL=lead.repository.js.map