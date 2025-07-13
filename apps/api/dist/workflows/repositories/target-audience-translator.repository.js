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
var TargetAudienceTranslatorRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetAudienceTranslatorRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const target_audience_translator_entity_1 = require("../entities/target-audience-translator.entity");
const target_audience_translator_dto_1 = require("../dto/target-audience-translator.dto");
let TargetAudienceTranslatorRepository = TargetAudienceTranslatorRepository_1 = class TargetAudienceTranslatorRepository {
    prisma;
    logger = new common_1.Logger(TargetAudienceTranslatorRepository_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(entity) {
        this.logger.log(`Creating target audience translator for company ${entity.companyId}`);
        const created = await this.prisma.targetAudienceTranslator.create({
            data: {
                inputFormat: entity.inputFormat,
                targetAudienceData: entity.targetAudienceData,
                structuredData: entity.structuredData || undefined,
                config: entity.config || undefined,
                leads: entity.leads || undefined,
                enrichmentSchema: entity.enrichmentSchema || undefined,
                interpretedCriteria: entity.interpretedCriteria || undefined,
                reasoning: entity.reasoning,
                confidence: entity.confidence,
                status: entity.status,
                errorMessage: entity.errorMessage,
                companyId: entity.companyId,
                createdBy: entity.createdBy,
            },
        });
        return this.mapToEntity(created);
    }
    async findOne(id, companyId) {
        this.logger.log(`Finding target audience translator ${id} for company ${companyId}`);
        const found = await this.prisma.targetAudienceTranslator.findFirst({
            where: {
                id,
                companyId,
            },
        });
        if (!found) {
            return null;
        }
        return this.mapToEntity(found);
    }
    async update(id, companyId, entity) {
        this.logger.log(`Updating target audience translator ${id} for company ${companyId}`);
        const updated = await this.prisma.targetAudienceTranslator.update({
            where: {
                id,
                companyId,
            },
            data: {
                leads: entity.leads || undefined,
                enrichmentSchema: entity.enrichmentSchema || undefined,
                interpretedCriteria: entity.interpretedCriteria || undefined,
                reasoning: entity.reasoning,
                confidence: entity.confidence,
                status: entity.status,
                errorMessage: entity.errorMessage,
                updatedAt: new Date(),
            },
        });
        return this.mapToEntity(updated);
    }
    async findWithCursor(companyId, query) {
        this.logger.log(`Finding target audience translators for company ${companyId} with cursor: ${query.cursor}`);
        const take = Math.min(query.take || 20, 100);
        const skip = query.cursor ? 1 : 0;
        const cursor = query.cursor ? { id: query.cursor } : undefined;
        const where = {
            companyId,
        };
        if (query.search) {
            where.OR = [
                { targetAudienceData: { contains: query.search, mode: 'insensitive' } },
                { reasoning: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.inputFormat) {
            where.inputFormat = query.inputFormat;
        }
        const [data, total] = await Promise.all([
            this.prisma.targetAudienceTranslator.findMany({
                where,
                take,
                skip,
                cursor,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.targetAudienceTranslator.count({ where }),
        ]);
        const nextCursor = data.length === take && data.length < total ? data[data.length - 1].id : null;
        return {
            data: data.map(item => this.mapToEntity(item)),
            nextCursor,
        };
    }
    async findByStatus(status, companyId) {
        this.logger.log(`Finding target audience translators with status ${status} for company ${companyId}`);
        const found = await this.prisma.targetAudienceTranslator.findMany({
            where: {
                status,
                companyId,
            },
            orderBy: { createdAt: 'desc' },
        });
        return found.map(item => this.mapToEntity(item));
    }
    async findByInputFormat(inputFormat, companyId) {
        this.logger.log(`Finding target audience translators with input format ${inputFormat} for company ${companyId}`);
        const found = await this.prisma.targetAudienceTranslator.findMany({
            where: {
                inputFormat,
                companyId,
            },
            orderBy: { createdAt: 'desc' },
        });
        return found.map(item => this.mapToEntity(item));
    }
    async countByCompany(companyId) {
        return this.prisma.targetAudienceTranslator.count({
            where: { companyId },
        });
    }
    async countByStatus(status, companyId) {
        return this.prisma.targetAudienceTranslator.count({
            where: { status, companyId },
        });
    }
    async countByInputFormat(inputFormat, companyId) {
        return this.prisma.targetAudienceTranslator.count({
            where: { inputFormat, companyId },
        });
    }
    async getStats(companyId) {
        this.logger.log(`Getting target audience translator stats for company ${companyId}`);
        const [total, byStatus, byInputFormat, successful, failed, pending,] = await Promise.all([
            this.countByCompany(companyId),
            this.getStatusStats(companyId),
            this.getInputFormatStats(companyId),
            this.countByStatus('SUCCESS', companyId),
            this.countByStatus('FAILED', companyId),
            this.countByStatus('PENDING', companyId),
        ]);
        return {
            total,
            byStatus,
            byInputFormat,
            successful,
            failed,
            pending,
        };
    }
    async getStatusStats(companyId) {
        const stats = await this.prisma.targetAudienceTranslator.groupBy({
            by: ['status'],
            where: { companyId },
            _count: { status: true },
        });
        const result = {};
        stats.forEach(stat => {
            result[stat.status] = stat._count.status;
        });
        return result;
    }
    async getInputFormatStats(companyId) {
        const stats = await this.prisma.targetAudienceTranslator.groupBy({
            by: ['inputFormat'],
            where: { companyId },
            _count: { inputFormat: true },
        });
        const result = {
            [target_audience_translator_dto_1.InputFormat.FREE_TEXT]: 0,
            [target_audience_translator_dto_1.InputFormat.STRUCTURED_JSON]: 0,
            [target_audience_translator_dto_1.InputFormat.CSV_UPLOAD]: 0,
            [target_audience_translator_dto_1.InputFormat.FORM_INPUT]: 0,
        };
        stats.forEach(stat => {
            result[stat.inputFormat] = stat._count.inputFormat;
        });
        return result;
    }
    mapToEntity(prismaData) {
        return new target_audience_translator_entity_1.TargetAudienceTranslatorEntity(prismaData.id, prismaData.inputFormat, prismaData.targetAudienceData, prismaData.structuredData, prismaData.config, prismaData.leads, prismaData.enrichmentSchema, prismaData.interpretedCriteria, prismaData.reasoning, prismaData.confidence, prismaData.status, prismaData.errorMessage, prismaData.companyId, prismaData.createdBy, prismaData.createdAt, prismaData.updatedAt);
    }
};
exports.TargetAudienceTranslatorRepository = TargetAudienceTranslatorRepository;
exports.TargetAudienceTranslatorRepository = TargetAudienceTranslatorRepository = TargetAudienceTranslatorRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TargetAudienceTranslatorRepository);
//# sourceMappingURL=target-audience-translator.repository.js.map