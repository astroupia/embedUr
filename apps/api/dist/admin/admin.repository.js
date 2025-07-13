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
exports.AdminRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const admin_action_log_entity_1 = require("./entities/admin-action-log.entity");
let AdminRepository = class AdminRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllCompanies(page = 1, limit = 20, status, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { industry: { contains: search, mode: 'insensitive' } },
                { website: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [companies, total] = await Promise.all([
            this.prisma.company.findMany({
                where,
                include: {
                    plan: true,
                    users: {
                        select: {
                            id: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.company.count({ where }),
        ]);
        return { companies, total };
    }
    async findCompanyById(id) {
        return this.prisma.company.findUnique({
            where: { id },
            include: {
                plan: true,
                users: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
    }
    async updateCompanyStatus(id, status, reason) {
        return this.prisma.company.update({
            where: { id },
            data: { status },
            include: { plan: true },
        });
    }
    async updateCompanyPlan(id, planId) {
        return this.prisma.company.update({
            where: { id },
            data: { planId },
            include: { plan: true },
        });
    }
    async findCompanyUsers(companyId) {
        return this.prisma.user.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getGlobalUsageMetrics() {
        const currentPeriod = this.formatPeriod(new Date());
        const [totalCompanies, activeCompanies, suspendedCompanies, totalUsers, activeUsers] = await Promise.all([
            this.prisma.company.count(),
            this.prisma.company.count({ where: { status: 'ACTIVE' } }),
            this.prisma.company.count({ where: { status: 'SUSPENDED' } }),
            this.prisma.user.count(),
            this.prisma.user.count({ where: { companyId: { not: undefined } } }),
        ]);
        const usageMetrics = await this.prisma.usageMetric.findMany({
            where: { period: currentPeriod },
        });
        const totalLeads = usageMetrics
            .filter(m => m.metricName === 'LEADS_CREATED')
            .reduce((sum, m) => sum + m.count, 0);
        const totalWorkflows = usageMetrics
            .filter(m => m.metricName === 'WORKFLOWS_EXECUTED')
            .reduce((sum, m) => sum + m.count, 0);
        const totalAiInteractions = usageMetrics
            .filter(m => m.metricName === 'AI_INTERACTIONS')
            .reduce((sum, m) => sum + m.count, 0);
        const totalEmails = usageMetrics
            .filter(m => m.metricName === 'EMAILS_SENT')
            .reduce((sum, m) => sum + m.count, 0);
        const totalEnrichments = usageMetrics
            .filter(m => m.metricName === 'ENRICHMENT_REQUESTS')
            .reduce((sum, m) => sum + m.count, 0);
        return {
            totalCompanies,
            activeCompanies,
            suspendedCompanies,
            totalUsers,
            activeUsers,
            totalLeads,
            totalWorkflows,
            totalAiInteractions,
            totalEmails,
            totalEnrichments,
        };
    }
    async getTopPerformingCompanies(limit = 10) {
        const currentPeriod = this.formatPeriod(new Date());
        const companies = await this.prisma.company.findMany({
            include: {
                plan: true,
                users: {
                    select: { id: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        const usageMetrics = await this.prisma.usageMetric.findMany({
            where: { period: currentPeriod },
        });
        return companies.map(company => {
            const companyMetrics = usageMetrics.filter(m => m.companyId === company.id);
            const leadsCreated = companyMetrics
                .find(m => m.metricName === 'LEADS_CREATED')?.count || 0;
            const workflowsExecuted = companyMetrics
                .find(m => m.metricName === 'WORKFLOWS_EXECUTED')?.count || 0;
            return {
                companyId: company.id,
                companyName: company.name,
                leadsCreated,
                workflowsExecuted,
                userCount: company.users.length,
            };
        }).sort((a, b) => b.leadsCreated - a.leadsCreated);
    }
    async createSystemNotification(data) {
        const notifications = [];
        if (data.companyIds && data.companyIds.length > 0) {
            for (const companyId of data.companyIds) {
                const notification = await this.prisma.systemNotification.create({
                    data: {
                        message: data.message,
                        level: data.level,
                        companyId,
                    },
                });
                notifications.push(notification);
            }
        }
        else {
            const companies = await this.prisma.company.findMany({
                select: { id: true },
            });
            for (const company of companies) {
                const notification = await this.prisma.systemNotification.create({
                    data: {
                        message: data.message,
                        level: data.level,
                        companyId: company.id,
                    },
                });
                notifications.push(notification);
            }
        }
        return notifications;
    }
    async findSystemNotifications(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.systemNotification.findMany({
                include: {
                    company: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.systemNotification.count(),
        ]);
        return { notifications, total };
    }
    async createActionLog(data) {
        const log = await this.prisma.adminActionLog.create({
            data: {
                action: data.action,
                targetType: data.targetType,
                targetId: data.targetId,
                performedBy: data.performedBy,
                details: data.details,
            },
        });
        return this.mapToEntity(log);
    }
    async findActionLogs(filters, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.action)
            where.action = filters.action;
        if (filters.targetType)
            where.targetType = filters.targetType;
        if (filters.targetId)
            where.targetId = filters.targetId;
        if (filters.performedBy)
            where.performedBy = filters.performedBy;
        if (filters.startDate || filters.endDate) {
            where.timestamp = {};
            if (filters.startDate)
                where.timestamp.gte = filters.startDate;
            if (filters.endDate)
                where.timestamp.lte = filters.endDate;
        }
        const [logs, total] = await Promise.all([
            this.prisma.adminActionLog.findMany({
                where,
                include: {
                    performedByUser: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.adminActionLog.count({ where }),
        ]);
        return {
            logs: logs.map(log => this.mapToEntity(log)),
            total,
        };
    }
    async getPlatformHealth() {
        const [totalCompanies, activeCompanies, totalUsers, recentActivity] = await Promise.all([
            this.prisma.company.count(),
            this.prisma.company.count({ where: { status: 'ACTIVE' } }),
            this.prisma.user.count(),
            this.prisma.adminActionLog.findMany({
                take: 10,
                orderBy: { timestamp: 'desc' },
                include: {
                    performedByUser: {
                        select: { id: true, email: true, firstName: true, lastName: true },
                    },
                },
            }),
        ]);
        return {
            totalCompanies,
            activeCompanies,
            totalUsers,
            recentActivity,
            status: 'healthy',
            uptime: Date.now(),
        };
    }
    mapToEntity(data) {
        return new admin_action_log_entity_1.AdminActionLogEntity(data.id, data.action, data.targetType, data.targetId, data.details, data.performedBy, data.timestamp);
    }
    formatPeriod(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminRepository);
//# sourceMappingURL=admin.repository.js.map