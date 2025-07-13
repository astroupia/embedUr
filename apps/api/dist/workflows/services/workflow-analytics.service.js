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
var WorkflowAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const workflow_constants_1 = require("../constants/workflow.constants");
const workflow_execution_repository_1 = require("../repositories/workflow-execution.repository");
const workflow_repository_1 = require("../repositories/workflow.repository");
let WorkflowAnalyticsService = WorkflowAnalyticsService_1 = class WorkflowAnalyticsService {
    workflowExecutionRepository;
    workflowRepository;
    logger = new common_1.Logger(WorkflowAnalyticsService_1.name);
    metricsCache = new Map();
    cacheExpiry = new Map();
    cacheExpiryTime = 5 * 60 * 1000;
    constructor(workflowExecutionRepository, workflowRepository) {
        this.workflowExecutionRepository = workflowExecutionRepository;
        this.workflowRepository = workflowRepository;
    }
    async calculateWorkflowMetrics(workflowId, timeRange = this.getDefaultTimeRange()) {
        const cacheKey = `${workflowId}_${timeRange.start.getTime()}_${timeRange.end.getTime()}`;
        const cached = this.metricsCache.get(cacheKey);
        if (cached && this.isCacheValid(cacheKey)) {
            return cached;
        }
        const executions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(workflowId, timeRange);
        const metrics = {
            totalExecutions: executions.length,
            successfulExecutions: executions.filter(e => e.status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS).length,
            failedExecutions: executions.filter(e => e.status === workflow_constants_1.WorkflowExecutionStatus.FAILED).length,
            averageExecutionTime: this.calculateAverageExecutionTime(executions),
            successRate: this.calculateSuccessRate(executions),
            failureRate: this.calculateFailureRate(executions),
            throughput: this.calculateThroughput(executions, timeRange),
        };
        this.metricsCache.set(cacheKey, metrics);
        this.setCacheExpiry(cacheKey);
        return metrics;
    }
    async generateWorkflowInsights(workflowId) {
        const timeRange = this.getDefaultTimeRange();
        const metrics = await this.calculateWorkflowMetrics(workflowId, timeRange);
        const executions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(workflowId, timeRange);
        const insights = {
            bottlenecks: this.analyzeBottlenecks(metrics, executions),
            recommendations: this.generateRecommendations(metrics, executions),
            trends: this.analyzeTrends(workflowId, timeRange),
        };
        return insights;
    }
    async getDashboardData(companyId) {
        const timeRange = this.getDefaultTimeRange();
        const allExecutions = await this.workflowExecutionRepository.findByCompanyIdAndTimeRange(companyId, timeRange);
        const overallMetrics = this.calculateOverallMetrics(allExecutions);
        const topWorkflows = await this.getTopWorkflows(companyId, timeRange);
        const recentFailures = await this.workflowExecutionRepository.findRecentFailures(companyId, 10);
        const alerts = this.generateAlerts(overallMetrics, topWorkflows);
        return {
            overallMetrics,
            topWorkflows,
            recentFailures,
            alerts,
        };
    }
    async getRealTimeDashboardData(companyId) {
        const dashboardData = await this.getDashboardData(companyId);
        const activeExecutions = await this.workflowExecutionRepository.countActiveExecutions(companyId);
        const queueLength = await this.workflowExecutionRepository.countPendingExecutions(companyId);
        const systemLoad = await this.calculateSystemLoad(companyId);
        const realTimeStats = {
            activeExecutions,
            queueLength,
            systemLoad,
        };
        return {
            ...dashboardData,
            realTimeStats,
        };
    }
    async getSystemHealthMetrics(companyId) {
        const timeRange = this.getDefaultTimeRange();
        const executions = await this.workflowExecutionRepository.findByCompanyIdAndTimeRange(companyId, timeRange);
        const totalExecutions = executions.length;
        const failedExecutions = executions.filter(e => e.status === workflow_constants_1.WorkflowExecutionStatus.FAILED).length;
        const errorRate = totalExecutions > 0 ? failedExecutions / totalExecutions : 0;
        const averageResponseTime = this.calculateAverageExecutionTime(executions);
        let systemStatus = 'healthy';
        if (errorRate > 0.1 || averageResponseTime > 60000) {
            systemStatus = 'warning';
        }
        if (errorRate > 0.3 || averageResponseTime > 300000) {
            systemStatus = 'critical';
        }
        return {
            systemStatus,
            uptime: 99.8,
            errorRate,
            responseTime: averageResponseTime,
            resourceUsage: await this.getResourceUsage(companyId),
            activeConnections: await this.workflowExecutionRepository.countActiveExecutions(companyId),
        };
    }
    async exportAnalyticsData(workflowId, options) {
        const timeRange = options.timeRange || this.getDefaultTimeRange();
        const metrics = await this.calculateWorkflowMetrics(workflowId, timeRange);
        const executions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(workflowId, timeRange);
        let data;
        let filename;
        if (options.format === 'csv') {
            data = this.generateCsvExport(metrics, executions, options);
            filename = `workflow_${workflowId}_${new Date().toISOString().split('T')[0]}.csv`;
        }
        else {
            data = JSON.stringify({
                metrics,
                executions: options.includeExecutions ? executions : undefined,
                exportDate: new Date().toISOString(),
            }, null, 2);
            filename = `workflow_${workflowId}_${new Date().toISOString().split('T')[0]}.json`;
        }
        return {
            data,
            filename,
            size: data.length,
            format: options.format,
        };
    }
    async generateScheduledReport(options) {
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            const timeRange = this.getReportTimeRange(options.reportType);
            const workflows = options.workflows || await this.getCompanyWorkflowIds(options.companyId);
            const reportData = await Promise.all(workflows.map(async (workflowId) => {
                const metrics = await this.calculateWorkflowMetrics(workflowId, timeRange);
                const workflow = await this.workflowRepository.findOne(workflowId, options.companyId);
                return {
                    workflowId,
                    workflowName: workflow?.name || 'Unknown',
                    metrics,
                };
            }));
            const reportContent = JSON.stringify({
                reportId,
                companyId: options.companyId,
                reportType: options.reportType,
                generatedAt: new Date().toISOString(),
                data: reportData,
            }, null, 2);
            return {
                reportId,
                status: 'generated',
                downloadUrl: `https://api.example.com/reports/${reportId}`,
                scheduledFor: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate scheduled report:`, error);
            return {
                reportId,
                status: 'failed',
            };
        }
    }
    analyzeBottlenecks(metrics, executions) {
        const bottlenecks = [];
        if (metrics.averageExecutionTime > 60000) {
            bottlenecks.push({
                type: 'slow_execution',
                severity: metrics.averageExecutionTime > 300000 ? 'CRITICAL' : 'HIGH',
                description: `Average execution time is ${Math.round(metrics.averageExecutionTime / 1000)}s`,
                impact: 'User experience degradation and resource consumption',
                suggestedAction: 'Optimize workflow logic or increase resources',
            });
        }
        if (metrics.failureRate > 0.1) {
            bottlenecks.push({
                type: 'high_failure_rate',
                severity: metrics.failureRate > 0.3 ? 'CRITICAL' : 'HIGH',
                description: `Failure rate is ${(metrics.failureRate * 100).toFixed(1)}%`,
                impact: 'Reduced reliability and potential data loss',
                suggestedAction: 'Investigate error patterns and implement fixes',
            });
        }
        const resourceUsage = this.analyzeResourceUsage(executions);
        if (resourceUsage.apiCalls > 1000) {
            bottlenecks.push({
                type: 'resource_constraint',
                severity: 'MEDIUM',
                description: 'High API call volume detected',
                impact: 'Potential rate limiting and increased costs',
                suggestedAction: 'Implement caching and optimize API usage',
            });
        }
        return bottlenecks;
    }
    generateRecommendations(metrics, executions) {
        const recommendations = [];
        if (metrics.successRate < 0.9) {
            recommendations.push({
                type: 'optimization',
                priority: 'HIGH',
                title: 'Improve Error Handling',
                description: 'Implement better error handling and retry mechanisms',
                expectedImpact: 'Increase success rate by 10-20%',
                implementationEffort: 'MEDIUM',
            });
        }
        if (metrics.averageExecutionTime > 30000) {
            recommendations.push({
                type: 'optimization',
                priority: 'MEDIUM',
                title: 'Optimize Workflow Logic',
                description: 'Review and optimize workflow execution steps',
                expectedImpact: 'Reduce execution time by 30-50%',
                implementationEffort: 'HIGH',
            });
        }
        if (metrics.throughput > 100) {
            recommendations.push({
                type: 'scaling',
                priority: 'MEDIUM',
                title: 'Scale Infrastructure',
                description: 'Consider scaling up resources to handle high volume',
                expectedImpact: 'Maintain performance under load',
                implementationEffort: 'LOW',
            });
        }
        return recommendations;
    }
    analyzeTrends(workflowId, timeRange) {
        return {
            period: 'week',
            successRateTrend: 'stable',
            executionTimeTrend: 'stable',
            volumeTrend: 'increasing',
            confidence: 0.8,
        };
    }
    calculateAverageExecutionTime(executions) {
        const completedExecutions = executions.filter(e => e.durationMs !== null);
        if (completedExecutions.length === 0) {
            return 0;
        }
        const totalTime = completedExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0);
        return totalTime / completedExecutions.length;
    }
    calculateSuccessRate(executions) {
        if (executions.length === 0) {
            return 0;
        }
        const successful = executions.filter(e => e.status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS).length;
        return successful / executions.length;
    }
    calculateFailureRate(executions) {
        if (executions.length === 0) {
            return 0;
        }
        const failed = executions.filter(e => e.status === workflow_constants_1.WorkflowExecutionStatus.FAILED).length;
        return failed / executions.length;
    }
    calculateThroughput(executions, timeRange) {
        const durationHours = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60);
        if (durationHours === 0) {
            return 0;
        }
        return executions.length / durationHours;
    }
    analyzeResourceUsage(executions) {
        return {
            cpuUsage: 0.3,
            memoryUsage: 0.5,
            apiCalls: executions.length * 2,
            databaseQueries: executions.length * 5,
        };
    }
    getDefaultTimeRange() {
        const end = new Date();
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start, end };
    }
    isCacheValid(cacheKey) {
        return true;
    }
    setCacheExpiry(cacheKey) {
    }
    async getExecutionsInRange(workflowId, timeRange) {
        return this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(workflowId, timeRange);
    }
    async getAllExecutionsInRange(companyId, timeRange) {
        return this.workflowExecutionRepository.findByCompanyIdAndTimeRange(companyId, timeRange);
    }
    calculateOverallMetrics(executions) {
        return {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageExecutionTime: 0,
            successRate: 0,
            failureRate: 0,
            throughput: 0,
        };
    }
    async getTopWorkflows(companyId, timeRange) {
        return [];
    }
    async getRecentFailures(companyId) {
        return [];
    }
    generateAlerts(metrics, workflows) {
        return [];
    }
    generateCsvExport(metrics, executions, options) {
        const csvLines = [];
        if (options.includeMetrics) {
            csvLines.push('Metrics');
            csvLines.push('Metric,Value');
            csvLines.push(`Total Executions,${metrics.totalExecutions}`);
            csvLines.push(`Successful Executions,${metrics.successfulExecutions}`);
            csvLines.push(`Failed Executions,${metrics.failedExecutions}`);
            csvLines.push(`Average Execution Time,${metrics.averageExecutionTime}`);
            csvLines.push(`Success Rate,${metrics.successRate}`);
            csvLines.push(`Failure Rate,${metrics.failureRate}`);
            csvLines.push(`Throughput,${metrics.throughput}`);
            csvLines.push('');
        }
        if (options.includeExecutions && executions.length > 0) {
            csvLines.push('Executions');
            csvLines.push('ID,Status,Start Time,End Time,Duration,Input Data');
            for (const execution of executions) {
                csvLines.push([
                    execution.id,
                    execution.status,
                    execution.startTime.toISOString(),
                    execution.endTime?.toISOString() || '',
                    execution.durationMs || 0,
                    JSON.stringify(execution.inputData || {}),
                ].join(','));
            }
        }
        return csvLines.join('\n');
    }
    async getCompanyWorkflowIds(companyId) {
        const workflows = await this.workflowRepository.findByCompany(companyId);
        return workflows.map(w => w.id);
    }
    getReportTimeRange(reportType) {
        const end = new Date();
        const start = new Date();
        switch (reportType) {
            case 'daily':
                start.setDate(start.getDate() - 1);
                break;
            case 'weekly':
                start.setDate(start.getDate() - 7);
                break;
            case 'monthly':
                start.setMonth(start.getMonth() - 1);
                break;
        }
        return { start, end };
    }
    async calculateSystemLoad(companyId) {
        const activeExecutions = await this.workflowExecutionRepository.countActiveExecutions(companyId);
        const totalExecutions = await this.workflowExecutionRepository.countByCompany(companyId);
        const maxCapacity = 100;
        return Math.min(1, activeExecutions / maxCapacity);
    }
    async getResourceUsage(companyId) {
        const activeExecutions = await this.workflowExecutionRepository.countActiveExecutions(companyId);
        const loadFactor = Math.min(1, activeExecutions / 50);
        return {
            cpu: 20 + (loadFactor * 60),
            memory: 30 + (loadFactor * 50),
            disk: 25 + (loadFactor * 20),
        };
    }
};
exports.WorkflowAnalyticsService = WorkflowAnalyticsService;
exports.WorkflowAnalyticsService = WorkflowAnalyticsService = WorkflowAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_execution_repository_1.WorkflowExecutionRepository,
        workflow_repository_1.WorkflowRepository])
], WorkflowAnalyticsService);
//# sourceMappingURL=workflow-analytics.service.js.map