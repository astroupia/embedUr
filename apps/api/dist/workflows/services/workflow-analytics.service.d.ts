import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowType } from '../constants/workflow.constants';
import { WorkflowExecutionRepository } from '../repositories/workflow-execution.repository';
import { WorkflowRepository } from '../repositories/workflow.repository';
export interface WorkflowMetrics {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    successRate: number;
    failureRate: number;
    throughput: number;
}
export interface WorkflowPerformanceData {
    workflowId: string;
    workflowName: string;
    workflowType: WorkflowType;
    metrics: WorkflowMetrics;
    timeSeries: TimeSeriesData[];
    topErrors: ErrorAnalysis[];
    resourceUsage: ResourceUsage;
}
export interface TimeSeriesData {
    timestamp: Date;
    executions: number;
    successRate: number;
    averageTime: number;
}
export interface ErrorAnalysis {
    errorMessage: string;
    count: number;
    percentage: number;
    lastOccurrence: Date;
}
export interface ResourceUsage {
    cpuUsage: number;
    memoryUsage: number;
    apiCalls: number;
    databaseQueries: number;
}
export interface WorkflowInsights {
    bottlenecks: BottleneckAnalysis[];
    recommendations: Recommendation[];
    trends: TrendAnalysis;
}
export interface BottleneckAnalysis {
    type: 'slow_execution' | 'high_failure_rate' | 'resource_constraint';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    impact: string;
    suggestedAction: string;
}
export interface Recommendation {
    type: 'optimization' | 'configuration' | 'monitoring' | 'scaling';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    title: string;
    description: string;
    expectedImpact: string;
    implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';
}
export interface TrendAnalysis {
    period: 'day' | 'week' | 'month';
    successRateTrend: 'increasing' | 'decreasing' | 'stable';
    executionTimeTrend: 'increasing' | 'decreasing' | 'stable';
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
}
export declare class WorkflowAnalyticsService {
    private readonly workflowExecutionRepository;
    private readonly workflowRepository;
    private readonly logger;
    private readonly metricsCache;
    private readonly cacheExpiry;
    private readonly cacheExpiryTime;
    constructor(workflowExecutionRepository: WorkflowExecutionRepository, workflowRepository: WorkflowRepository);
    calculateWorkflowMetrics(workflowId: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<WorkflowMetrics>;
    generateWorkflowInsights(workflowId: string): Promise<WorkflowInsights>;
    getDashboardData(companyId: string): Promise<{
        overallMetrics: WorkflowMetrics;
        topWorkflows: WorkflowPerformanceData[];
        recentFailures: WorkflowExecutionEntity[];
        alerts: Alert[];
    }>;
    getRealTimeDashboardData(companyId: string): Promise<{
        overallMetrics: WorkflowMetrics;
        topWorkflows: WorkflowPerformanceData[];
        recentFailures: WorkflowExecutionEntity[];
        alerts: Alert[];
        realTimeStats: {
            activeExecutions: number;
            queueLength: number;
            systemLoad: number;
        };
    }>;
    getSystemHealthMetrics(companyId: string): Promise<{
        systemStatus: 'healthy' | 'warning' | 'critical';
        uptime: number;
        errorRate: number;
        responseTime: number;
        resourceUsage: {
            cpu: number;
            memory: number;
            disk: number;
        };
        activeConnections: number;
    }>;
    exportAnalyticsData(workflowId: string, options: {
        format: 'csv' | 'json';
        timeRange?: {
            start: Date;
            end: Date;
        };
        includeMetrics?: boolean;
        includeExecutions?: boolean;
    }): Promise<{
        data: string;
        filename: string;
        size: number;
        format: string;
    }>;
    generateScheduledReport(options: {
        reportType: 'daily' | 'weekly' | 'monthly';
        companyId: string;
        workflows?: string[];
        recipients?: string[];
        format?: 'pdf' | 'html' | 'email';
    }): Promise<{
        reportId: string;
        status: 'generated' | 'scheduled' | 'failed';
        downloadUrl?: string;
        scheduledFor?: Date;
    }>;
    private analyzeBottlenecks;
    private generateRecommendations;
    private analyzeTrends;
    private calculateAverageExecutionTime;
    private calculateSuccessRate;
    private calculateFailureRate;
    private calculateThroughput;
    private analyzeResourceUsage;
    private getDefaultTimeRange;
    private isCacheValid;
    private setCacheExpiry;
    private getExecutionsInRange;
    private getAllExecutionsInRange;
    private calculateOverallMetrics;
    private getTopWorkflows;
    private getRecentFailures;
    private generateAlerts;
    private generateCsvExport;
    private getCompanyWorkflowIds;
    private getReportTimeRange;
    private calculateSystemLoad;
    private getResourceUsage;
}
interface Alert {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: Date;
}
export {};
