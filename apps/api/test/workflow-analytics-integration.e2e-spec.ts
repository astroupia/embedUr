import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { WorkflowType, WorkflowExecutionStatus } from '../src/workflows/constants/workflow.constants';
import { TestSetup } from './helpers/test-setup';
import { WorkflowAnalyticsService, WorkflowMetrics, WorkflowInsights } from '../src/workflows/services/workflow-analytics.service';

describe('Workflow Analytics Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testSetup: TestSetup;
  let workflowAnalytics: WorkflowAnalyticsService;

  // Increase timeout for integration tests
  jest.setTimeout(120000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    testSetup = new TestSetup(app, prismaService);
    workflowAnalytics = moduleFixture.get<WorkflowAnalyticsService>(WorkflowAnalyticsService);
  });

  afterAll(async () => {
    await testSetup.cleanupTestData();
    await app.close();
  });

  beforeEach(async () => {
    await testSetup.setupTestData();
  });

  afterEach(async () => {
    await testSetup.cleanupTestData();
  });

  describe('Workflow Metrics', () => {
    it('should calculate workflow metrics', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Analytics Test Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'analytics-test-workflow',
      });

      // Clean up any existing executions for this workflow
      await testSetup.deleteAllWorkflowExecutionsForWorkflow(workflow.id);

      // Create multiple workflow executions with a specific time range
      const executions: any[] = [];
      let minTime = new Date();
      let maxTime = new Date(0);
      for (let i = 0; i < 10; i++) {
        const startTime = new Date(Date.now() - i * 300000);
        const endTime = i < 8 ? new Date(startTime.getTime() + 30000) : undefined;
        const durationMs = i < 8 ? 30000 : undefined; // Set duration for successful executions
        const execution = await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: i < 8 ? WorkflowExecutionStatus.SUCCESS : WorkflowExecutionStatus.FAILED,
          inputData: {
            inputFormat: 'FREE_TEXT',
            targetAudienceData: `Target audience ${i}`,
          },
          startTime,
          endTime,
          durationMs,
        });
        executions.push(execution);
        if (startTime < minTime) minTime = startTime;
        if (endTime && endTime > maxTime) maxTime = endTime;
        if (!endTime && startTime > maxTime) maxTime = startTime;
      }

      // Calculate metrics using the actual execution time range
      const metrics = await workflowAnalytics.calculateWorkflowMetrics(workflow.id, {
        start: new Date(minTime.getTime() - 1000),
        end: new Date(maxTime.getTime() + 1000),
      });

      expect(metrics).toBeDefined();
      expect(metrics.totalExecutions).toBe(10);
      expect(metrics.successfulExecutions).toBe(8);
      expect(metrics.failedExecutions).toBe(2);
      expect(metrics.successRate).toBe(0.8);
      expect(metrics.failureRate).toBe(0.2);
      expect(metrics.averageExecutionTime).toBeGreaterThan(0);
      expect(metrics.throughput).toBeGreaterThan(0);
    });

    it('should calculate metrics for different time ranges', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Time Range Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'time-range-test-workflow',
      });

      // Clean up any existing executions for this workflow
      await testSetup.deleteAllWorkflowExecutionsForWorkflow(workflow.id);

      // Create executions over different time periods with a specific test time
      const testStartTime = new Date();
      const oneDayAgo = new Date(testStartTime.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(testStartTime.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Create recent executions (within last day)
      const recentExecutions: any[] = [];
      let minRecent = new Date();
      let maxRecent = new Date(0);
      for (let i = 0; i < 5; i++) {
        const startTime = new Date(testStartTime.getTime() - i * 3600000);
        const endTime = new Date(startTime.getTime() + 30000);
        await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: WorkflowExecutionStatus.SUCCESS,
          inputData: {
            leadId: `recent-lead-${i}`,
            email: `recent${i}@example.com`,
          },
          startTime,
          endTime,
        });
        if (startTime < minRecent) minRecent = startTime;
        if (endTime > maxRecent) maxRecent = endTime;
      }

      // Create older executions (within last week but not last day)
      const oldExecutions: any[] = [];
      let minOld = new Date();
      let maxOld = new Date(0);
      for (let i = 0; i < 3; i++) {
        const startTime = new Date(oneDayAgo.getTime() - i * 86400000);
        const endTime = new Date(startTime.getTime() + 30000);
        await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: WorkflowExecutionStatus.SUCCESS,
          inputData: {
            leadId: `old-lead-${i}`,
            email: `old${i}@example.com`,
          },
          startTime,
          endTime,
        });
        if (startTime < minOld) minOld = startTime;
        if (endTime > maxOld) maxOld = endTime;
      }

      // Calculate metrics for different time ranges using actual execution time ranges
      const recentMetrics = await workflowAnalytics.calculateWorkflowMetrics(workflow.id, {
        start: new Date(minRecent.getTime() - 1000),
        end: new Date(maxRecent.getTime() + 1000),
      });

      const weeklyMetrics = await workflowAnalytics.calculateWorkflowMetrics(workflow.id, {
        start: new Date(minOld.getTime() - 1000),
        end: new Date(maxRecent.getTime() + 1000),
      });

      expect(recentMetrics.totalExecutions).toBe(5);
      expect(weeklyMetrics.totalExecutions).toBe(8);
    });
  });

  describe('Workflow Insights', () => {
    it('should generate workflow insights', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Insights Test Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'insights-test-workflow',
      });

      // Create workflow executions with various performance characteristics
      const executions: any[] = [];
      for (let i = 0; i < 20; i++) {
        const execution = await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: i < 15 ? WorkflowExecutionStatus.SUCCESS : WorkflowExecutionStatus.FAILED,
          inputData: {
            inputFormat: 'FREE_TEXT',
            targetAudienceData: `Target audience ${i}`,
          },
          startTime: new Date(Date.now() - i * 1800000), // 30 minutes apart
          endTime: i < 15 ? new Date(Date.now() - i * 1800000 + 45000) : undefined, // 45 seconds duration
        });
        executions.push(execution);
      }

      // Generate insights with a specific time range to avoid leftover data
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const insights = await workflowAnalytics.generateWorkflowInsights(workflow.id);

      expect(insights).toBeDefined();
      expect(insights.bottlenecks).toBeDefined();
      expect(Array.isArray(insights.bottlenecks)).toBe(true);
      expect(insights.recommendations).toBeDefined();
      expect(Array.isArray(insights.recommendations)).toBe(true);
      expect(insights.trends).toBeDefined();
      expect(insights.trends.period).toBeDefined();
      expect(insights.trends.confidence).toBeGreaterThan(0);
      expect(insights.trends.confidence).toBeLessThanOrEqual(1);
    });

    it('should identify performance bottlenecks', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow with performance issues
      const workflow = await testSetup.createTestWorkflow({
        name: 'Bottleneck Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'bottleneck-test-workflow',
      });

      // Create executions with high failure rate and slow execution times
      const executions: any[] = [];
      for (let i = 0; i < 10; i++) {
        const startTime = new Date(Date.now() - i * 600000); // 10 minutes apart
        const endTime = i < 3 ? new Date(startTime.getTime() + 120000) : undefined; // 2 minutes duration (slow)
        const durationMs = i < 3 ? 120000 : undefined; // Set duration for successful executions
        
        const execution = await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: i < 3 ? WorkflowExecutionStatus.SUCCESS : WorkflowExecutionStatus.FAILED, // 70% failure rate
          inputData: {
            leadId: `bottleneck-lead-${i}`,
            email: `bottleneck${i}@example.com`,
          },
          startTime,
          endTime,
          durationMs,
        });
        executions.push(execution);
      }

      // Generate insights with a specific time range to avoid leftover data
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const insights = await workflowAnalytics.generateWorkflowInsights(workflow.id);

      expect(insights.bottlenecks.length).toBeGreaterThan(0);
      
      // Check for high failure rate bottleneck
      const failureBottleneck = insights.bottlenecks.find(b => b.type === 'high_failure_rate');
      expect(failureBottleneck).toBeDefined();
      
      // Check for slow execution bottleneck
      const slowExecutionBottleneck = insights.bottlenecks.find(b => b.type === 'slow_execution');
      expect(slowExecutionBottleneck).toBeDefined();
    });
  });

  describe('Dashboard Data', () => {
    it('should provide dashboard data', async () => {
      const testData = testSetup.getTestData();

      // Create multiple workflows
      const workflows: any[] = [];
      for (let i = 0; i < 3; i++) {
        const workflow = await testSetup.createTestWorkflow({
          name: `Dashboard Test Workflow ${i + 1}`,
          type: i === 0 ? WorkflowType.TARGET_AUDIENCE_TRANSLATOR : 
                 i === 1 ? WorkflowType.LEAD_ENRICHMENT : WorkflowType.EMAIL_SEQUENCE,
          n8nWorkflowId: `dashboard-test-workflow-${i + 1}`,
        });
        workflows.push(workflow);

        // Create executions for each workflow
        for (let j = 0; j < 5; j++) {
          await testSetup.createTestWorkflowExecution({
            workflowId: workflow.id,
            status: j < 4 ? WorkflowExecutionStatus.SUCCESS : WorkflowExecutionStatus.FAILED,
            inputData: {
              testData: `workflow-${i}-execution-${j}`,
            },
            startTime: new Date(Date.now() - j * 300000),
            endTime: j < 4 ? new Date(Date.now() - j * 300000 + 30000) : undefined,
          });
        }
      }

      // Get dashboard data
      const dashboardData = await workflowAnalytics.getDashboardData(testData.companyId);

      expect(dashboardData).toBeDefined();
      expect(dashboardData.overallMetrics).toBeDefined();
      expect(dashboardData.topWorkflows).toBeDefined();
      expect(Array.isArray(dashboardData.topWorkflows)).toBe(true);
      expect(dashboardData.recentFailures).toBeDefined();
      expect(Array.isArray(dashboardData.recentFailures)).toBe(true);
      expect(dashboardData.alerts).toBeDefined();
      expect(Array.isArray(dashboardData.alerts)).toBe(true);
    });

    it('should provide real-time dashboard data', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Real-time Test Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'realtime-test-workflow',
      });

      // Create some executions
      for (let i = 0; i < 5; i++) {
        await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: WorkflowExecutionStatus.SUCCESS,
          inputData: {
            inputFormat: 'FREE_TEXT',
            targetAudienceData: `Real-time target ${i}`,
          },
          startTime: new Date(Date.now() - i * 60000), // 1 minute apart
          endTime: new Date(Date.now() - i * 60000 + 30000),
        });
      }

      // Get real-time dashboard data
      const realTimeData = await workflowAnalytics.getRealTimeDashboardData(testData.companyId);

      expect(realTimeData).toBeDefined();
      expect(realTimeData.overallMetrics).toBeDefined();
      expect(realTimeData.realTimeStats).toBeDefined();
      expect(realTimeData.realTimeStats.activeExecutions).toBeGreaterThanOrEqual(0);
      expect(realTimeData.realTimeStats.queueLength).toBeGreaterThanOrEqual(0);
      expect(realTimeData.realTimeStats.systemLoad).toBeGreaterThan(0);
      expect(realTimeData.realTimeStats.systemLoad).toBeLessThanOrEqual(1);
    });
  });

  describe('System Health', () => {
    it('should provide system health metrics', async () => {
      const testData = testSetup.getTestData();

      // Get system health metrics
      const healthMetrics = await workflowAnalytics.getSystemHealthMetrics(testData.companyId);

      expect(healthMetrics).toBeDefined();
      expect(healthMetrics.systemStatus).toBeDefined();
      expect(['healthy', 'warning', 'critical']).toContain(healthMetrics.systemStatus);
      expect(healthMetrics.uptime).toBeGreaterThan(0);
      expect(healthMetrics.uptime).toBeLessThanOrEqual(100);
      expect(healthMetrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(healthMetrics.errorRate).toBeLessThanOrEqual(1);
      expect(healthMetrics.responseTime).toBeGreaterThan(0);
      expect(healthMetrics.resourceUsage).toBeDefined();
      expect(healthMetrics.resourceUsage.cpu).toBeGreaterThan(0);
      expect(healthMetrics.resourceUsage.memory).toBeGreaterThan(0);
      expect(healthMetrics.resourceUsage.disk).toBeGreaterThan(0);
      expect(healthMetrics.activeConnections).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Export', () => {
    it('should export analytics data in CSV format', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Export Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'export-test-workflow',
      });

      // Create executions
      for (let i = 0; i < 5; i++) {
        await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: WorkflowExecutionStatus.SUCCESS,
          inputData: {
            leadId: `export-lead-${i}`,
            email: `export${i}@example.com`,
          },
          startTime: new Date(Date.now() - i * 300000),
          endTime: new Date(Date.now() - i * 300000 + 30000),
        });
      }

      // Export CSV data
      const csvExport = await workflowAnalytics.exportAnalyticsData(workflow.id, {
        format: 'csv',
        includeMetrics: true,
        includeExecutions: true,
      });

      expect(csvExport).toBeDefined();
      expect(csvExport.data).toBeDefined();
      expect(csvExport.filename).toBeDefined();
      expect(csvExport.filename.endsWith('.csv')).toBe(true);
      expect(csvExport.size).toBeGreaterThan(0);
      expect(csvExport.format).toBe('csv');
      expect(csvExport.data).toContain('Metrics');
      expect(csvExport.data).toContain('Executions');
    });

    it('should export analytics data in JSON format', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'JSON Export Test Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'json-export-test-workflow',
      });

      // Create executions
      for (let i = 0; i < 3; i++) {
        await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: WorkflowExecutionStatus.SUCCESS,
          inputData: {
            inputFormat: 'FREE_TEXT',
            targetAudienceData: `JSON export target ${i}`,
          },
          startTime: new Date(Date.now() - i * 300000),
          endTime: new Date(Date.now() - i * 300000 + 30000),
        });
      }

      // Export JSON data
      const jsonExport = await workflowAnalytics.exportAnalyticsData(workflow.id, {
        format: 'json',
        includeMetrics: true,
        includeExecutions: false,
      });

      expect(jsonExport).toBeDefined();
      expect(jsonExport.data).toBeDefined();
      expect(jsonExport.filename).toBeDefined();
      expect(jsonExport.filename.endsWith('.json')).toBe(true);
      expect(jsonExport.size).toBeGreaterThan(0);
      expect(jsonExport.format).toBe('json');

      // Parse JSON data
      const jsonData = JSON.parse(jsonExport.data);
      expect(jsonData.metrics).toBeDefined();
      expect(jsonData.exportDate).toBeDefined();
    });
  });

  describe('Scheduled Reports', () => {
    it('should generate scheduled reports', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Report Test Workflow',
        type: WorkflowType.EMAIL_SEQUENCE,
        n8nWorkflowId: 'report-test-workflow',
      });

      // Create executions for the report
      for (let i = 0; i < 10; i++) {
        await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: i < 8 ? WorkflowExecutionStatus.SUCCESS : WorkflowExecutionStatus.FAILED,
          inputData: {
            sequenceId: `report-sequence-${i}`,
            email: `report${i}@example.com`,
          },
          startTime: new Date(Date.now() - i * 86400000), // 1 day apart
          endTime: i < 8 ? new Date(Date.now() - i * 86400000 + 30000) : undefined,
        });
      }

      // Generate scheduled report
      const scheduledReport = await workflowAnalytics.generateScheduledReport({
        reportType: 'weekly',
        companyId: testData.companyId,
        workflows: [workflow.id],
        recipients: ['admin@example.com'],
        format: 'pdf',
      });

      expect(scheduledReport).toBeDefined();
      expect(scheduledReport.reportId).toBeDefined();
      expect(scheduledReport.status).toBeDefined();
      expect(['generated', 'scheduled', 'failed']).toContain(scheduledReport.status);
      expect(scheduledReport.downloadUrl).toBeDefined();
      expect(scheduledReport.scheduledFor).toBeDefined();
    });
  });
}); 