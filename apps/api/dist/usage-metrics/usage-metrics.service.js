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
var UsageMetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageMetricsService = void 0;
const common_1 = require("@nestjs/common");
const usage_metrics_repository_1 = require("./usage-metrics.repository");
const usage_metric_entity_1 = require("./entities/usage-metric.entity");
const usage_metric_response_dto_1 = require("./dto/usage-metric-response.dto");
const usage_metrics_mapper_1 = require("./usage-metrics.mapper");
let UsageMetricsService = UsageMetricsService_1 = class UsageMetricsService {
    repository;
    mapper;
    logger = new common_1.Logger(UsageMetricsService_1.name);
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async incrementMetric(companyId, metricName, period, amount = 1) {
        try {
            const currentPeriod = period || this.formatPeriod(new Date());
            await this.repository.incrementMetric(metricName, companyId, currentPeriod, amount);
            this.logger.log(`Incremented ${metricName} by ${amount} for company ${companyId}`);
            await this.checkQuotaViolations(companyId, metricName);
        }
        catch (error) {
            this.logger.error(`Failed to increment metric ${metricName} for company ${companyId}`, error);
            throw error;
        }
    }
    async recordMetric(dto) {
        const currentPeriod = dto.period || this.formatPeriod(new Date());
        const count = dto.count || 1;
        const metric = await this.repository.incrementMetric(dto.metricName, dto.companyId, currentPeriod, count);
        return usage_metrics_mapper_1.UsageMetricsMapper.toResponseDto(metric);
    }
    async getCompanyMetrics(companyId, period, metricNames) {
        const metrics = await this.repository.findByCompany(companyId, period, metricNames);
        return metrics.map(metric => usage_metrics_mapper_1.UsageMetricsMapper.toResponseDto(metric));
    }
    async getCurrentPeriodMetrics(companyId) {
        const metrics = await this.repository.getCurrentPeriodMetrics(companyId);
        return metrics.map(metric => usage_metrics_mapper_1.UsageMetricsMapper.toResponseDto(metric));
    }
    async getUsageOverview(companyId) {
        const currentMetrics = await this.repository.getCurrentPeriodMetrics(companyId);
        const company = await this.repository.getCompanyWithPlan(companyId);
        const planLimits = this.calculatePlanLimits(company);
        const { warnings, overageDetected } = this.analyzeQuotaUsage(currentMetrics, planLimits);
        return new usage_metric_response_dto_1.UsageMetricsOverviewDto({
            companyId,
            metrics: currentMetrics.map(metric => usage_metrics_mapper_1.UsageMetricsMapper.toResponseDto(metric)),
            planLimits,
            overageDetected,
            warnings,
        });
    }
    async getAllCompaniesMetrics(period, metricNames) {
        const metrics = await this.repository.getAllCompaniesMetrics(period, metricNames);
        return metrics.map(metric => usage_metrics_mapper_1.UsageMetricsMapper.toResponseDto(metric));
    }
    async getGlobalMetricsSummary() {
        return this.repository.getGlobalMetricsSummary();
    }
    async getCompanyMetricsForAdmin(companyId) {
        const metrics = await this.repository.findByCompany(companyId);
        return metrics.map(metric => usage_metrics_mapper_1.UsageMetricsMapper.toResponseDto(metric));
    }
    async canPerformAction(companyId, metricName, amount = 1) {
        try {
            const company = await this.repository.getCompanyWithPlan(companyId);
            const currentMetrics = await this.repository.getCurrentPeriodMetrics(companyId);
            const currentMetric = currentMetrics.find(m => m.metricName === metricName);
            const currentCount = currentMetric?.count || 0;
            const planLimits = this.calculatePlanLimits(company);
            const limit = this.getLimitForMetric(metricName, planLimits);
            if (currentCount + amount > limit) {
                return {
                    allowed: false,
                    reason: `${metricName} limit would be exceeded (${currentCount + amount}/${limit})`,
                };
            }
            return { allowed: true };
        }
        catch (error) {
            this.logger.error(`Error checking quota for company ${companyId}`, error);
            return { allowed: false, reason: 'Error checking quota' };
        }
    }
    async getMetricsStats(companyId) {
        const currentMetrics = await this.repository.getCurrentPeriodMetrics(companyId);
        if (currentMetrics.length === 0) {
            return {
                totalMetrics: 0,
                currentPeriodMetrics: 0,
                mostUsedMetric: 'N/A',
                leastUsedMetric: 'N/A',
            };
        }
        const sortedMetrics = currentMetrics.sort((a, b) => b.count - a.count);
        return {
            totalMetrics: currentMetrics.length,
            currentPeriodMetrics: currentMetrics.reduce((sum, m) => sum + m.count, 0),
            mostUsedMetric: sortedMetrics[0]?.metricName || 'N/A',
            leastUsedMetric: sortedMetrics[sortedMetrics.length - 1]?.metricName || 'N/A',
        };
    }
    async cleanupOldMetrics(daysOld = 90) {
        return this.repository.cleanupOldMetrics(daysOld);
    }
    async checkQuotaViolations(companyId, metricName) {
        try {
            const company = await this.repository.getCompanyWithPlan(companyId);
            const currentMetrics = await this.repository.getCurrentPeriodMetrics(companyId);
            const currentMetric = currentMetrics.find(m => m.metricName === metricName);
            if (!currentMetric)
                return;
            const planLimits = this.calculatePlanLimits(company);
            const limit = this.getLimitForMetric(metricName, planLimits);
            const usagePercentage = (currentMetric.count / limit) * 100;
            if (usagePercentage >= 100) {
                await this.repository.createQuotaAlert(companyId, metricName, 'EXCEEDED', currentMetric.count, limit);
            }
            else if (usagePercentage >= 80) {
                await this.repository.createQuotaAlert(companyId, metricName, 'WARNING', currentMetric.count, limit);
            }
        }
        catch (error) {
            this.logger.error(`Error checking quota violations for company ${companyId}`, error);
        }
    }
    calculatePlanLimits(company) {
        return {
            leads: company.plan?.maxLeads || 1000,
            workflows: company.plan?.maxWorkflows || 100,
            aiInteractions: 100,
            emails: 5000,
            enrichments: 200,
        };
    }
    analyzeQuotaUsage(metrics, planLimits) {
        const warnings = [];
        let overageDetected = false;
        metrics.forEach(metric => {
            const limit = this.getLimitForMetric(metric.metricName, planLimits);
            const usagePercentage = (metric.count / limit) * 100;
            if (usagePercentage >= 100) {
                overageDetected = true;
                warnings.push(`${metric.metricName} limit exceeded (${metric.count}/${limit})`);
            }
            else if (usagePercentage >= 80) {
                warnings.push(`${metric.metricName} approaching limit (${metric.count}/${limit})`);
            }
        });
        return { warnings, overageDetected };
    }
    getLimitForMetric(metricName, planLimits) {
        switch (metricName) {
            case usage_metric_entity_1.MetricName.LEADS_CREATED:
                return planLimits.leads;
            case usage_metric_entity_1.MetricName.WORKFLOWS_EXECUTED:
                return planLimits.workflows;
            case usage_metric_entity_1.MetricName.AI_INTERACTIONS:
                return planLimits.aiInteractions;
            case usage_metric_entity_1.MetricName.EMAILS_SENT:
                return planLimits.emails;
            case usage_metric_entity_1.MetricName.ENRICHMENT_REQUESTS:
                return planLimits.enrichments;
            default:
                return 1000;
        }
    }
    formatPeriod(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};
exports.UsageMetricsService = UsageMetricsService;
exports.UsageMetricsService = UsageMetricsService = UsageMetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [usage_metrics_repository_1.UsageMetricsRepository,
        usage_metrics_mapper_1.UsageMetricsMapper])
], UsageMetricsService);
//# sourceMappingURL=usage-metrics.service.js.map