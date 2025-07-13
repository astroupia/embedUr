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
var EnrichmentRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const enrichment_mapper_1 = require("../mappers/enrichment.mapper");
const enrichment_constants_1 = require("../constants/enrichment.constants");
let EnrichmentRepository = EnrichmentRepository_1 = class EnrichmentRepository {
    prisma;
    logger = new common_1.Logger(EnrichmentRepository_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(entity) {
        this.logger.log(`Creating enrichment request for lead ${entity.leadId}`);
        const prismaData = enrichment_mapper_1.EnrichmentMapper.toPrismaCreate(entity);
        const created = await this.prisma.enrichmentRequest.create({
            data: prismaData,
        });
        this.logger.log(`Enrichment request created: ${created.id}`);
        return enrichment_mapper_1.EnrichmentMapper.toEntity(created);
    }
    async findOne(id, companyId) {
        this.logger.log(`Finding enrichment request ${id} for company ${companyId}`);
        const enrichment = await this.prisma.enrichmentRequest.findFirst({
            where: {
                id,
                companyId,
            },
        });
        if (!enrichment) {
            throw new Error('Enrichment request not found');
        }
        return enrichment_mapper_1.EnrichmentMapper.toEntity(enrichment);
    }
    async findWithCursor(companyId, query) {
        this.logger.log(`Finding enrichment requests for company ${companyId} with cursor: ${query.cursor}`);
        const { cursor, limit, sortBy, sortOrder, leadId, provider, status } = query;
        const where = { companyId };
        if (leadId)
            where.leadId = leadId;
        if (provider)
            where.provider = provider;
        if (status)
            where.status = status;
        let cursorCondition = {};
        if (cursor && sortBy) {
            cursorCondition = {
                [sortBy]: sortOrder === 'desc' ? { lt: cursor } : { gt: cursor },
            };
        }
        const enrichments = await this.prisma.enrichmentRequest.findMany({
            where: { ...where, ...cursorCondition },
            take: (limit || 20) + 1,
            orderBy: {
                [sortBy]: sortOrder,
            },
        });
        const hasNextPage = enrichments.length > (limit || 20);
        const data = enrichments.slice(0, limit || 20);
        const nextCursor = hasNextPage ? data[data.length - 1]?.id : null;
        return {
            data: enrichment_mapper_1.EnrichmentMapper.toEntityList(data),
            nextCursor,
        };
    }
    async findByLead(leadId, companyId) {
        this.logger.log(`Finding enrichment requests for lead ${leadId} in company ${companyId}`);
        const enrichments = await this.prisma.enrichmentRequest.findMany({
            where: {
                leadId,
                companyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return enrichment_mapper_1.EnrichmentMapper.toEntityList(enrichments);
    }
    async findByProvider(provider, companyId) {
        this.logger.log(`Finding enrichment requests for provider ${provider} in company ${companyId}`);
        const enrichments = await this.prisma.enrichmentRequest.findMany({
            where: {
                provider: provider,
                companyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return enrichment_mapper_1.EnrichmentMapper.toEntityList(enrichments);
    }
    async findByStatus(status, companyId) {
        this.logger.log(`Finding enrichment requests with status ${status} in company ${companyId}`);
        const enrichments = await this.prisma.enrichmentRequest.findMany({
            where: {
                status: status,
                companyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return enrichment_mapper_1.EnrichmentMapper.toEntityList(enrichments);
    }
    async update(id, companyId, entity) {
        this.logger.log(`Updating enrichment request ${id} for company ${companyId}`);
        const prismaData = enrichment_mapper_1.EnrichmentMapper.toPrismaUpdate(entity);
        const updated = await this.prisma.enrichmentRequest.updateMany({
            where: {
                id,
                companyId,
            },
            data: prismaData,
        });
        if (updated.count === 0) {
            throw new Error('Enrichment request not found');
        }
        return this.findOne(id, companyId);
    }
    async remove(id, companyId) {
        this.logger.log(`Removing enrichment request ${id} for company ${companyId}`);
        const deleted = await this.prisma.enrichmentRequest.deleteMany({
            where: {
                id,
                companyId,
            },
        });
        if (deleted.count === 0) {
            throw new Error('Enrichment request not found');
        }
    }
    async countByCompany(companyId) {
        return this.prisma.enrichmentRequest.count({
            where: { companyId },
        });
    }
    async countByProvider(provider, companyId) {
        return this.prisma.enrichmentRequest.count({
            where: {
                provider: provider,
                companyId,
            },
        });
    }
    async countByStatus(status, companyId) {
        return this.prisma.enrichmentRequest.count({
            where: {
                status: status,
                companyId,
            },
        });
    }
    async findActiveEnrichment(leadId, companyId) {
        this.logger.log(`Finding active enrichment for lead ${leadId} in company ${companyId}`);
        const activeStatuses = [enrichment_constants_1.EnrichmentStatus.PENDING, enrichment_constants_1.EnrichmentStatus.IN_PROGRESS];
        const enrichment = await this.prisma.enrichmentRequest.findFirst({
            where: {
                leadId,
                companyId,
                status: {
                    in: activeStatuses,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return enrichment ? enrichment_mapper_1.EnrichmentMapper.toEntity(enrichment) : null;
    }
    async getStats(companyId) {
        this.logger.log(`Getting enrichment stats for company ${companyId}`);
        const [total, successful, failed, pending, apolloStats, dropContactStats, clearbitStats, n8nStats, averageDuration,] = await Promise.all([
            this.countByCompany(companyId),
            this.countByStatus(enrichment_constants_1.EnrichmentStatus.SUCCESS, companyId),
            this.countByStatus(enrichment_constants_1.EnrichmentStatus.FAILED, companyId),
            this.countByStatus(enrichment_constants_1.EnrichmentStatus.PENDING, companyId),
            this.getProviderStats(enrichment_constants_1.EnrichmentProvider.APOLLO, companyId),
            this.getProviderStats(enrichment_constants_1.EnrichmentProvider.DROP_CONTACT, companyId),
            this.getProviderStats(enrichment_constants_1.EnrichmentProvider.CLEARBIT, companyId),
            this.getProviderStats(enrichment_constants_1.EnrichmentProvider.N8N, companyId),
            this.getAverageDuration(companyId),
        ]);
        return {
            total,
            successful,
            failed,
            pending,
            byProvider: {
                [enrichment_constants_1.EnrichmentProvider.APOLLO]: apolloStats,
                [enrichment_constants_1.EnrichmentProvider.DROP_CONTACT]: dropContactStats,
                [enrichment_constants_1.EnrichmentProvider.CLEARBIT]: clearbitStats,
                [enrichment_constants_1.EnrichmentProvider.N8N]: n8nStats,
            },
            averageDurationSeconds: averageDuration,
        };
    }
    async getProviderStats(provider, companyId) {
        const [total, successful, failed] = await Promise.all([
            this.countByProvider(provider, companyId),
            this.prisma.enrichmentRequest.count({
                where: {
                    provider: provider,
                    companyId,
                    status: enrichment_constants_1.EnrichmentStatus.SUCCESS,
                },
            }),
            this.prisma.enrichmentRequest.count({
                where: {
                    provider: provider,
                    companyId,
                    status: enrichment_constants_1.EnrichmentStatus.FAILED,
                },
            }),
        ]);
        return { total, successful, failed };
    }
    async getAverageDuration(companyId) {
        return 0;
    }
    async findLeadById(leadId, companyId) {
        this.logger.log(`Finding lead ${leadId} for company ${companyId}`);
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
        });
        if (!lead) {
            throw new Error('Lead not found');
        }
        return lead;
    }
    async updateLeadEnrichmentData(leadId, companyId, enrichmentData) {
        this.logger.log(`Updating enrichment data for lead ${leadId}`);
        await this.prisma.lead.updateMany({
            where: { id: leadId, companyId },
            data: { enrichmentData },
        });
    }
    async findEnrichmentRequestByLead(leadId, companyId) {
        this.logger.log(`Finding enrichment request for lead ${leadId} in company ${companyId}`);
        const enrichment = await this.prisma.enrichmentRequest.findFirst({
            where: {
                leadId,
                companyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return enrichment ? enrichment_mapper_1.EnrichmentMapper.toEntity(enrichment) : null;
    }
    async updateEnrichmentRequestStatus(id, companyId, status, responseData, errorMessage) {
        this.logger.log(`Updating enrichment request ${id} status to ${status}`);
        const updateData = { status };
        if (responseData)
            updateData.responseData = responseData;
        if (errorMessage)
            updateData.errorMessage = errorMessage;
        await this.prisma.enrichmentRequest.updateMany({
            where: { id, companyId },
            data: updateData,
        });
    }
    async createAuditTrail(entityId, action, changes, companyId, performedById) {
        this.logger.log(`Creating audit trail for ${action} on entity ${entityId}`);
        await this.prisma.auditTrail.create({
            data: {
                entity: 'Enrichment',
                entityId,
                action,
                changes,
                companyId,
                performedById,
            },
        });
    }
};
exports.EnrichmentRepository = EnrichmentRepository;
exports.EnrichmentRepository = EnrichmentRepository = EnrichmentRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrichmentRepository);
//# sourceMappingURL=enrichment.repository.js.map