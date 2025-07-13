import { Injectable, Logger } from '@nestjs/common';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowType, WorkflowExecutionStatus } from '../constants/workflow.constants';
import { WorkflowExecutionRepository } from '../repositories/workflow-execution.repository';
import { WorkflowRepository } from '../repositories/workflow.repository';

export interface WorkflowMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  successRate: number;
  failureRate: number;
  throughput: number; // executions per hour
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
  confidence: number; // 0-1
}

@Injectable()
export class WorkflowAnalyticsService {
  private readonly logger = new Logger(WorkflowAnalyticsService.name);
  private readonly metricsCache = new Map<string, WorkflowMetrics>();
  private readonly cacheExpiry = new Map<string, number>();
  private readonly cacheExpiryTime = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    private readonly workflowRepository: WorkflowRepository,
  ) {}

  /**
   * Calculate metrics for a workflow
   */
  async calculateWorkflowMetrics(
    workflowId: string,
    timeRange: { start: Date; end: Date } = this.getDefaultTimeRange(),
  ): Promise<WorkflowMetrics> {
    const cacheKey = `${workflowId}_${timeRange.start.getTime()}_${timeRange.end.getTime()}`;
    
    // Check cache first
    const cached = this.metricsCache.get(cacheKey);
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    // Calculate metrics from execution data
    const executions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(
      workflowId,
      timeRange,
    );
    
    const metrics: WorkflowMetrics = {
      totalExecutions: executions.length,
      successfulExecutions: executions.filter(e => e.status === WorkflowExecutionStatus.SUCCESS).length,
      failedExecutions: executions.filter(e => e.status === WorkflowExecutionStatus.FAILED).length,
      averageExecutionTime: this.calculateAverageExecutionTime(executions),
      successRate: this.calculateSuccessRate(executions),
      failureRate: this.calculateFailureRate(executions),
      throughput: this.calculateThroughput(executions, timeRange),
    };

    // Cache the results
    this.metricsCache.set(cacheKey, metrics);
    this.setCacheExpiry(cacheKey);

    return metrics;
  }

  /**
   * Generate performance insights for a workflow
   */
  async generateWorkflowInsights(workflowId: string): Promise<WorkflowInsights> {
    const timeRange = this.getDefaultTimeRange();
    const metrics = await this.calculateWorkflowMetrics(workflowId, timeRange);
    const executions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(
      workflowId,
      timeRange,
    );

    const insights: WorkflowInsights = {
      bottlenecks: this.analyzeBottlenecks(metrics, executions),
      recommendations: this.generateRecommendations(metrics, executions),
      trends: this.analyzeTrends(workflowId, timeRange),
    };

    return insights;
  }

  /**
   * Get performance data for dashboard
   */
  async getDashboardData(companyId: string): Promise<{
    overallMetrics: WorkflowMetrics;
    topWorkflows: WorkflowPerformanceData[];
    recentFailures: WorkflowExecutionEntity[];
    alerts: Alert[];
  }> {
    const timeRange = this.getDefaultTimeRange();
    
    // Calculate overall metrics
    const allExecutions = await this.workflowExecutionRepository.findByCompanyIdAndTimeRange(
      companyId,
      timeRange,
    );
    const overallMetrics = this.calculateOverallMetrics(allExecutions);

    // Get top performing workflows
    const topWorkflows = await this.getTopWorkflows(companyId, timeRange);

    // Get recent failures
    const recentFailures = await this.workflowExecutionRepository.findRecentFailures(companyId, 10);

    // Generate alerts
    const alerts = this.generateAlerts(overallMetrics, topWorkflows);

    return {
      overallMetrics,
      topWorkflows,
      recentFailures,
      alerts,
    };
  }

  /**
   * Get real-time dashboard data
   */
  async getRealTimeDashboardData(companyId: string): Promise<{
    overallMetrics: WorkflowMetrics;
    topWorkflows: WorkflowPerformanceData[];
    recentFailures: WorkflowExecutionEntity[];
    alerts: Alert[];
    realTimeStats: {
      activeExecutions: number;
      queueLength: number;
      systemLoad: number;
    };
  }> {
    const dashboardData = await this.getDashboardData(companyId);
    
    // Get real-time statistics from repository
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

  /**
   * Get system health metrics
   */
  async getSystemHealthMetrics(companyId: string): Promise<{
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
  }> {
    const timeRange = this.getDefaultTimeRange();
    const executions = await this.workflowExecutionRepository.findByCompanyIdAndTimeRange(
      companyId,
      timeRange,
    );

    const totalExecutions = executions.length;
    const failedExecutions = executions.filter(e => e.status === WorkflowExecutionStatus.FAILED).length;
    const errorRate = totalExecutions > 0 ? failedExecutions / totalExecutions : 0;
    const averageResponseTime = this.calculateAverageExecutionTime(executions);

    // Calculate system status based on error rate and response time
    let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (errorRate > 0.1 || averageResponseTime > 60000) {
      systemStatus = 'warning';
    }
    if (errorRate > 0.3 || averageResponseTime > 300000) {
      systemStatus = 'critical';
    }

    return {
      systemStatus,
      uptime: 99.8, // This would come from system monitoring
      errorRate,
      responseTime: averageResponseTime,
      resourceUsage: await this.getResourceUsage(companyId),
      activeConnections: await this.workflowExecutionRepository.countActiveExecutions(companyId),
    };
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(
    workflowId: string,
    options: {
      format: 'csv' | 'json';
      timeRange?: { start: Date; end: Date };
      includeMetrics?: boolean;
      includeExecutions?: boolean;
    },
  ): Promise<{
    data: string;
    filename: string;
    size: number;
    format: string;
  }> {
    const timeRange = options.timeRange || this.getDefaultTimeRange();
    const metrics = await this.calculateWorkflowMetrics(workflowId, timeRange);
    const executions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(
      workflowId,
      timeRange,
    );

    let data: string;
    let filename: string;

    if (options.format === 'csv') {
      data = this.generateCsvExport(metrics, executions, options);
      filename = `workflow_${workflowId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
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

  /**
   * Generate scheduled report
   */
  async generateScheduledReport(options: {
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
  }> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Generate report data
      const timeRange = this.getReportTimeRange(options.reportType);
      const workflows = options.workflows || await this.getCompanyWorkflowIds(options.companyId);
      
      const reportData = await Promise.all(
        workflows.map(async (workflowId) => {
          const metrics = await this.calculateWorkflowMetrics(workflowId, timeRange);
          const workflow = await this.workflowRepository.findOne(workflowId, options.companyId);
          return {
            workflowId,
            workflowName: workflow?.name || 'Unknown',
            metrics,
          };
        })
      );

      // Store report data (in a real implementation, this would be saved to a database)
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
    } catch (error) {
      this.logger.error(`Failed to generate scheduled report:`, error);
      return {
        reportId,
        status: 'failed',
      };
    }
  }

  /**
   * Analyze bottlenecks in workflow performance
   */
  private analyzeBottlenecks(metrics: WorkflowMetrics, executions: WorkflowExecutionEntity[]): BottleneckAnalysis[] {
    const bottlenecks: BottleneckAnalysis[] = [];

    // Check for slow execution times
    if (metrics.averageExecutionTime > 60000) { // > 1 minute
      bottlenecks.push({
        type: 'slow_execution',
        severity: metrics.averageExecutionTime > 300000 ? 'CRITICAL' : 'HIGH',
        description: `Average execution time is ${Math.round(metrics.averageExecutionTime / 1000)}s`,
        impact: 'User experience degradation and resource consumption',
        suggestedAction: 'Optimize workflow logic or increase resources',
      });
    }

    // Check for high failure rates
    if (metrics.failureRate > 0.1) { // > 10%
      bottlenecks.push({
        type: 'high_failure_rate',
        severity: metrics.failureRate > 0.3 ? 'CRITICAL' : 'HIGH',
        description: `Failure rate is ${(metrics.failureRate * 100).toFixed(1)}%`,
        impact: 'Reduced reliability and potential data loss',
        suggestedAction: 'Investigate error patterns and implement fixes',
      });
    }

    // Check for resource constraints
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

  /**
   * Generate recommendations based on performance data
   */
  private generateRecommendations(metrics: WorkflowMetrics, executions: WorkflowExecutionEntity[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Low success rate recommendation
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

    // Slow execution recommendation
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

    // High volume recommendation
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

  /**
   * Analyze trends in workflow performance
   */
  private analyzeTrends(workflowId: string, timeRange: { start: Date; end: Date }): TrendAnalysis {
    // This would analyze historical data to determine trends
    // Implementation would depend on your data storage and analysis capabilities
    
    return {
      period: 'week',
      successRateTrend: 'stable',
      executionTimeTrend: 'stable',
      volumeTrend: 'increasing',
      confidence: 0.8,
    };
  }

  /**
   * Calculate average execution time
   */
  private calculateAverageExecutionTime(executions: WorkflowExecutionEntity[]): number {
    const completedExecutions = executions.filter(e => e.durationMs !== null);
    
    if (completedExecutions.length === 0) {
      return 0;
    }

    const totalTime = completedExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0);
    return totalTime / completedExecutions.length;
  }

  /**
   * Calculate success rate
   */
  private calculateSuccessRate(executions: WorkflowExecutionEntity[]): number {
    if (executions.length === 0) {
      return 0;
    }

    const successful = executions.filter(e => e.status === WorkflowExecutionStatus.SUCCESS).length;
    return successful / executions.length;
  }

  /**
   * Calculate failure rate
   */
  private calculateFailureRate(executions: WorkflowExecutionEntity[]): number {
    if (executions.length === 0) {
      return 0;
    }

    const failed = executions.filter(e => e.status === WorkflowExecutionStatus.FAILED).length;
    return failed / executions.length;
  }

  /**
   * Calculate throughput (executions per hour)
   */
  private calculateThroughput(executions: WorkflowExecutionEntity[], timeRange: { start: Date; end: Date }): number {
    const durationHours = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60);
    
    if (durationHours === 0) {
      return 0;
    }

    return executions.length / durationHours;
  }

  /**
   * Analyze resource usage from executions
   */
  private analyzeResourceUsage(executions: WorkflowExecutionEntity[]): ResourceUsage {
    // This would analyze actual resource usage data
    // For now, return placeholder data
    return {
      cpuUsage: 0.3,
      memoryUsage: 0.5,
      apiCalls: executions.length * 2, // Estimate
      databaseQueries: executions.length * 5, // Estimate
    };
  }

  /**
   * Get default time range (last 7 days)
   */
  private getDefaultTimeRange(): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start, end };
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    // Implementation would track cache expiry times
    return true; // Placeholder
  }

  /**
   * Set cache expiry time
   */
  private setCacheExpiry(cacheKey: string): void {
    // Implementation would set cache expiry
  }

  /**
   * Get executions in time range (repository implementation)
   */
  private async getExecutionsInRange(workflowId: string, timeRange: { start: Date; end: Date }): Promise<WorkflowExecutionEntity[]> {
    return this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(workflowId, timeRange);
  }

  /**
   * Get all executions in time range (repository implementation)
   */
  private async getAllExecutionsInRange(companyId: string, timeRange: { start: Date; end: Date }): Promise<WorkflowExecutionEntity[]> {
    return this.workflowExecutionRepository.findByCompanyIdAndTimeRange(companyId, timeRange);
  }

  /**
   * Calculate overall metrics (placeholder)
   */
  private calculateOverallMetrics(executions: WorkflowExecutionEntity[]): WorkflowMetrics {
    // Implementation would calculate overall metrics
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

  /**
   * Get top workflows (placeholder)
   */
  private async getTopWorkflows(companyId: string, timeRange: { start: Date; end: Date }): Promise<WorkflowPerformanceData[]> {
    // Implementation would get top performing workflows
    return [];
  }

  /**
   * Get recent failures (placeholder)
   */
  private async getRecentFailures(companyId: string): Promise<WorkflowExecutionEntity[]> {
    // Implementation would get recent failures
    return [];
  }

  /**
   * Generate alerts (placeholder)
   */
  private generateAlerts(metrics: WorkflowMetrics, workflows: WorkflowPerformanceData[]): any[] {
    // Implementation would generate alerts based on metrics
    return [];
  }

  /**
   * Generate CSV export
   */
  private generateCsvExport(
    metrics: WorkflowMetrics,
    executions: WorkflowExecutionEntity[],
    options: {
      includeMetrics?: boolean;
      includeExecutions?: boolean;
    },
  ): string {
    const csvLines: string[] = [];

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

  private async getCompanyWorkflowIds(companyId: string): Promise<string[]> {
    const workflows = await this.workflowRepository.findByCompany(companyId);
    return workflows.map(w => w.id);
  }

  private getReportTimeRange(reportType: 'daily' | 'weekly' | 'monthly'): { start: Date; end: Date } {
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

  private async calculateSystemLoad(companyId: string): Promise<number> {
    const activeExecutions = await this.workflowExecutionRepository.countActiveExecutions(companyId);
    const totalExecutions = await this.workflowExecutionRepository.countByCompany(companyId);
    
    // Calculate load as percentage of active executions vs total capacity
    const maxCapacity = 100; // This would be configurable
    return Math.min(1, activeExecutions / maxCapacity);
  }

  private async getResourceUsage(companyId: string): Promise<{ cpu: number; memory: number; disk: number }> {
    // In a real implementation, this would query system monitoring
    // For now, return estimated values based on execution load
    const activeExecutions = await this.workflowExecutionRepository.countActiveExecutions(companyId);
    const loadFactor = Math.min(1, activeExecutions / 50);
    
    return {
      cpu: 20 + (loadFactor * 60), // 20-80%
      memory: 30 + (loadFactor * 50), // 30-80%
      disk: 25 + (loadFactor * 20), // 25-45%
    };
  }
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
} 