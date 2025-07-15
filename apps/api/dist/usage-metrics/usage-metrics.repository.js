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
exports.UsageMetricsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const usage_metric_entity_1 = require("./entities/usage-metric.entity");
const usage_metric_entity_2 = require("./entities/usage-metric.entity");
let UsageMetricsRepository = class UsageMetricsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const metric = await this.prisma.usageMetric.create({
            data: {
                metricName: data.metricName,
                count: data.count,
                period: data.period,
                companyId: data.companyId,
            },
        });
        return this.mapToEntity(metric);
    }
    async findOrCreate(metricName, companyId, period) {
        const existing = await this.prisma.usageMetric.findFirst({
            where: {
                metricName,
                companyId,
                period,
            },
        });
        if (existing) {
            return this.mapToEntity(existing);
        }
        return this.create({
            metricName,
            count: 0,
            period,
            companyId,
        });
    }
    async incrementMetric(metricName, companyId, period, amount = 1) {
        const metric = await this.prisma.usageMetric.upsert({
            where: {
                metricName_companyId_period: {
                    metricName,
                    companyId,
                    period,
                },
            },
            update: {
                count: {
                    increment: amount,
                },
                recordedAt: new Date(),
            },
            create: {
                metricName,
                count: amount,
                period,
                companyId,
            },
        });
        return this.mapToEntity(metric);
    }
    async findByCompany(companyId, period, metricNames) {
        const where = { companyId };
        if (period) {
            where.period = period;
        }
        if (metricNames && metricNames.length > 0) {
            where.metricName = { in: metricNames };
        }
        const metrics = await this.prisma.usageMetric.findMany({
            where,
            orderBy: [
                { period: 'desc' },
                { metricName: 'asc' },
            ],
        });
        return metrics.map(metric => this.mapToEntity(metric));
    }
    async findByCompanyAndPeriod(companyId, period) {
        const metrics = await this.prisma.usageMetric.findMany({
            where: {
                companyId,
                period,
            },
            orderBy: { metricName: 'asc' },
        });
        return metrics.map(metric => this.mapToEntity(metric));
    }
    async getCurrentPeriodMetrics(companyId) {
        const currentPeriod = this.formatPeriod(new Date());
        return this.findByCompanyAndPeriod(companyId, currentPeriod);
    }
    async getMonthlyMetrics(companyId, year, month) {
        const period = `${year}-${String(month).padStart(2, '0')}`;
        return this.findByCompanyAndPeriod(companyId, period);
    }
    async getDailyMetrics(companyId, date) {
        const period = this.formatPeriod(date);
        return this.findByCompanyAndPeriod(companyId, period);
    }
    async getAggregatedMetrics(companyId, startDate, endDate, metricNames) {
        const where = {
            companyId,
            period: {
                gte: this.formatPeriod(startDate),
                lte: this.formatPeriod(endDate),
            },
        };
        if (metricNames && metricNames.length > 0) {
            where.metricName = { in: metricNames };
        }
        const metrics = await this.prisma.usageMetric.findMany({
            where,
            orderBy: [
                { period: 'desc' },
                { metricName: 'asc' },
            ],
        });
        return metrics.map(metric => this.mapToEntity(metric));
    }
    async getAllCompaniesMetrics(period, metricNames) {
        const where = {};
        if (period) {
            where.period = period;
        }
        if (metricNames && metricNames.length > 0) {
            where.metricName = { in: metricNames };
        }
        const metrics = await this.prisma.usageMetric.findMany({
            where,
            orderBy: [
                { companyId: 'asc' },
                { period: 'desc' },
                { metricName: 'asc' },
            ],
        });
        return metrics.map(metric => this.mapToEntity(metric));
    }
    async getCompanyMetricsSummary(companyId) {
        const currentPeriod = this.formatPeriod(new Date());
        const metrics = await this.findByCompanyAndPeriod(companyId, currentPeriod);
        const summary = {
            totalLeads: 0,
            totalWorkflows: 0,
            totalAiInteractions: 0,
            totalEmails: 0,
            totalEnrichments: 0,
            totalReplies: 0,
        };
        metrics.forEach(metric => {
            switch (metric.metricName) {
                case usage_metric_entity_2.MetricName.LEADS_CREATED:
                    summary.totalLeads = metric.count;
                    break;
                case usage_metric_entity_2.MetricName.WORKFLOWS_EXECUTED:
                    summary.totalWorkflows = metric.count;
                    break;
                case usage_metric_entity_2.MetricName.AI_INTERACTIONS:
                    summary.totalAiInteractions = metric.count;
                    break;
                case usage_metric_entity_2.MetricName.EMAILS_SENT:
                    summary.totalEmails = metric.count;
                    break;
                case usage_metric_entity_2.MetricName.ENRICHMENT_REQUESTS:
                    summary.totalEnrichments = metric.count;
                    break;
                case usage_metric_entity_2.MetricName.REPLIES_CLASSIFIED:
                    summary.totalReplies = metric.count;
                    break;
            }
        });
        return summary;
    }
    async getGlobalMetricsSummary() {
        const currentPeriod = this.formatPeriod(new Date());
        const metrics = await this.getAllCompaniesMetrics(currentPeriod);
        const summary = {
            totalCompanies: 0,
            totalLeads: 0,
            totalWorkflows: 0,
            totalAiInteractions: 0,
            totalEmails: 0,
            totalEnrichments: 0,
        };
        const companies = new Set();
        metrics.forEach(metric => {
            companies.add(metric.companyId);
            switch (metric.metricName) {
                case usage_metric_entity_2.MetricName.LEADS_CREATED:
                    summary.totalLeads += metric.count;
                    break;
                case usage_metric_entity_2.MetricName.WORKFLOWS_EXECUTED:
                    summary.totalWorkflows += metric.count;
                    break;
                case usage_metric_entity_2.MetricName.AI_INTERACTIONS:
                    summary.totalAiInteractions += metric.count;
                    break;
                case usage_metric_entity_2.MetricName.EMAILS_SENT:
                    summary.totalEmails += metric.count;
                    break;
                case usage_metric_entity_2.MetricName.ENRICHMENT_REQUESTS:
                    summary.totalEnrichments += metric.count;
                    break;
            }
        });
        summary.totalCompanies = companies.size;
        return summary;
    }
    async cleanupOldMetrics(daysOld = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await this.prisma.usageMetric.deleteMany({
            where: {
                recordedAt: {
                    lt: cutoffDate,
                },
            },
        });
        return result.count;
    }
    mapToEntity(data) {
        return new usage_metric_entity_1.UsageMetricEntity(data.id, data.metricName, data.count, data.period, data.companyId, data.recordedAt);
    }
    formatPeriod(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    async getCompanyWithPlan(companyId) {
        return this.prisma.company.findUnique({
            where: { id: companyId },
            include: { plan: true },
        });
    }
    async createQuotaAlert(companyId, metricName, level, current, limit) {
        try {
            const message = level === 'EXCEEDED'
                ? `Quota exceeded: ${metricName} (${current}/${limit})`
                : `Quota warning: ${metricName} approaching limit (${current}/${limit})`;
            await this.prisma.systemNotification.create({
                data: {
                    companyId,
                    message,
                    level: level === 'EXCEEDED' ? 'ERROR' : 'WARNING',
                },
            });
        }
        catch (error) {
            console.error(`Failed to create quota alert for company ${companyId}`, error);
        }
    }
};
exports.UsageMetricsRepository = UsageMetricsRepository;
exports.UsageMetricsRepository = UsageMetricsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsageMetricsRepository);
//# sourceMappingURL=usage-metrics.repository.js.map