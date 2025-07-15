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
var ReplyRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const reply_mapper_1 = require("../mappers/reply.mapper");
const prisma_1 = require("../../../generated/prisma");
let ReplyRepository = ReplyRepository_1 = class ReplyRepository {
    prisma;
    logger = new common_1.Logger(ReplyRepository_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, companyId) {
        this.logger.log(`Creating reply for company ${companyId}`);
        const data = reply_mapper_1.ReplyMapper.toCreateData(dto, companyId);
        const reply = await this.prisma.reply.create({
            data,
            include: {
                lead: true,
                emailLog: true,
            },
        });
        this.logger.log(`Reply created: ${reply.id}`);
        return reply_mapper_1.ReplyMapper.toEntity(reply);
    }
    async findOne(id, companyId) {
        this.logger.log(`Finding reply ${id} in company ${companyId}`);
        const reply = await this.prisma.reply.findFirst({
            where: { id, companyId },
            include: {
                lead: true,
                emailLog: true,
            },
        });
        return reply ? reply_mapper_1.ReplyMapper.toEntity(reply) : null;
    }
    async findWithCursor(companyId, query) {
        this.logger.log(`Finding replies for company ${companyId} with cursor: ${query.cursor}`);
        const where = { companyId };
        if (query.leadId)
            where.leadId = query.leadId;
        if (query.emailLogId)
            where.emailLogId = query.emailLogId;
        if (query.classification)
            where.classification = query.classification;
        if (query.requiresAttention) {
            where.OR = [
                { classification: prisma_1.$Enums.ReplyClassification.INTERESTED },
                { classification: prisma_1.$Enums.ReplyClassification.QUESTION },
            ];
        }
        if (query.recent) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            where.createdAt = { gte: yesterday };
        }
        if (query.cursor) {
            where.id = { gt: query.cursor };
        }
        const limit = query.limit || 10;
        const replies = await this.prisma.reply.findMany({
            where,
            include: {
                lead: true,
                emailLog: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
        });
        const hasNext = replies.length > limit;
        const data = replies.slice(0, limit);
        const nextCursor = hasNext ? data[data.length - 1].id : null;
        return {
            data: reply_mapper_1.ReplyMapper.toEntityArray(data),
            nextCursor,
        };
    }
    async update(id, companyId, dto) {
        const data = reply_mapper_1.ReplyMapper.toUpdateData(dto);
        const reply = await this.prisma.reply.update({
            where: { id, companyId },
            data,
            include: {
                lead: true,
                emailLog: true,
            },
        });
        return reply_mapper_1.ReplyMapper.toEntity(reply);
    }
    async updateWithWorkflowData(id, companyId, workflowData) {
        this.logger.log(`Updating reply ${id} with workflow data in company ${companyId}`);
        const data = reply_mapper_1.ReplyMapper.toWorkflowUpdateData(workflowData);
        const reply = await this.prisma.reply.update({
            where: { id, companyId },
            data,
            include: {
                lead: true,
                emailLog: true,
            },
        });
        this.logger.log(`Reply updated with workflow data: ${reply.id}`);
        return reply_mapper_1.ReplyMapper.toEntity(reply);
    }
    async remove(id, companyId) {
        this.logger.log(`Removing reply ${id} from company ${companyId}`);
        await this.prisma.reply.delete({
            where: { id, companyId },
        });
        this.logger.log(`Reply removed: ${id}`);
    }
    async findByLead(leadId, companyId) {
        this.logger.log(`Finding replies for lead ${leadId} in company ${companyId}`);
        const replies = await this.prisma.reply.findMany({
            where: { leadId, companyId },
            include: {
                lead: true,
                emailLog: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return reply_mapper_1.ReplyMapper.toEntityArray(replies);
    }
    async findByEmailLog(emailLogId, companyId) {
        this.logger.log(`Finding replies for email log ${emailLogId} in company ${companyId}`);
        const replies = await this.prisma.reply.findMany({
            where: { emailLogId, companyId },
            include: {
                lead: true,
                emailLog: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return reply_mapper_1.ReplyMapper.toEntityArray(replies);
    }
    async findByClassification(classification, companyId) {
        this.logger.log(`Finding replies with classification ${classification} in company ${companyId}`);
        const replies = await this.prisma.reply.findMany({
            where: { classification, companyId },
            include: {
                lead: true,
                emailLog: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return reply_mapper_1.ReplyMapper.toEntityArray(replies);
    }
    async findRequiringAttention(companyId) {
        this.logger.log(`Finding replies requiring attention in company ${companyId}`);
        const replies = await this.prisma.reply.findMany({
            where: {
                companyId,
                OR: [
                    { classification: prisma_1.$Enums.ReplyClassification.INTERESTED },
                    { classification: prisma_1.$Enums.ReplyClassification.QUESTION },
                ],
            },
            include: {
                lead: true,
                emailLog: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return reply_mapper_1.ReplyMapper.toEntityArray(replies);
    }
    async findRecent(companyId, days = 7) {
        this.logger.log(`Finding recent replies for company ${companyId} (last ${days} days)`);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const replies = await this.prisma.reply.findMany({
            where: {
                companyId,
                createdAt: { gte: cutoffDate },
            },
            include: {
                lead: true,
                emailLog: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return reply_mapper_1.ReplyMapper.toEntityArray(replies);
    }
    async countByCompany(companyId) {
        return this.prisma.reply.count({
            where: { companyId },
        });
    }
    async countByClassification(classification, companyId) {
        this.logger.log(`Counting replies with classification ${classification} in company ${companyId}`);
        return this.prisma.reply.count({
            where: { classification, companyId },
        });
    }
    async countRecent(companyId, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.prisma.reply.count({
            where: {
                companyId,
                createdAt: { gte: cutoffDate },
            },
        });
    }
    async getStats(companyId) {
        this.logger.log(`Getting reply stats for company ${companyId}`);
        const [total, recent, classificationStats,] = await Promise.all([
            this.countByCompany(companyId),
            this.countRecent(companyId),
            this.getClassificationStats(companyId),
        ]);
        return {
            total,
            recent,
            byClassification: classificationStats,
        };
    }
    async getClassificationStats(companyId) {
        const stats = await this.prisma.reply.groupBy({
            by: ['classification'],
            where: { companyId },
            _count: {
                classification: true,
            },
        });
        const result = {
            [prisma_1.$Enums.ReplyClassification.INTERESTED]: 0,
            [prisma_1.$Enums.ReplyClassification.NOT_INTERESTED]: 0,
            [prisma_1.$Enums.ReplyClassification.AUTO_REPLY]: 0,
            [prisma_1.$Enums.ReplyClassification.UNSUBSCRIBE]: 0,
            [prisma_1.$Enums.ReplyClassification.QUESTION]: 0,
            [prisma_1.$Enums.ReplyClassification.NEUTRAL]: 0,
        };
        for (const stat of stats) {
            result[stat.classification] = stat._count.classification;
        }
        return result;
    }
    async findEmailLogByLeadAndEmailId(leadId, emailId, companyId) {
        this.logger.log(`Finding email log for lead ${leadId} with email ID ${emailId}`);
        let emailLog = await this.prisma.emailLog.findFirst({
            where: {
                id: emailId,
                leadId,
                companyId,
            },
        });
        if (!emailLog) {
            emailLog = await this.prisma.emailLog.findFirst({
                where: {
                    leadId,
                    companyId,
                    metadata: {
                        path: ['emailId'],
                        equals: emailId,
                    },
                },
            });
        }
        if (!emailLog) {
            throw new Error('Email log not found for this email ID');
        }
        return emailLog;
    }
    async createFromWebhook(data) {
        this.logger.log(`Creating reply from webhook for lead ${data.leadId}`);
        const reply = await this.prisma.reply.create({
            data: {
                leadId: data.leadId,
                emailLogId: data.emailLogId,
                companyId: data.companyId,
                content: data.content,
                classification: data.classification || prisma_1.$Enums.ReplyClassification.QUESTION,
                handledBy: data.handledBy,
            },
            include: {
                lead: true,
                emailLog: true,
            },
        });
        this.logger.log(`Reply created from webhook: ${reply.id}`);
        return reply_mapper_1.ReplyMapper.toEntity(reply);
    }
    async updateClassification(id, companyId, classification, handledBy) {
        this.logger.log(`Updating reply ${id} classification to ${classification}`);
        const reply = await this.prisma.reply.update({
            where: { id, companyId },
            data: {
                classification,
                handledBy,
            },
            include: {
                lead: true,
                emailLog: true,
            },
        });
        this.logger.log(`Reply classification updated: ${reply.id}`);
        return reply_mapper_1.ReplyMapper.toEntity(reply);
    }
};
exports.ReplyRepository = ReplyRepository;
exports.ReplyRepository = ReplyRepository = ReplyRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReplyRepository);
//# sourceMappingURL=reply.repository.js.map