import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { WorkflowType, WorkflowExecutionStatus } from '../src/workflows/constants/workflow.constants';
import { TestSetup } from './helpers/test-setup';
import { WorkflowProgressService, ProgressUpdate } from '../src/workflows/services/workflow-progress.service';

describe('Workflow Progress Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testSetup: TestSetup;
  let workflowProgress: WorkflowProgressService;

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
    workflowProgress = moduleFixture.get<WorkflowProgressService>(WorkflowProgressService);
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

  describe('Progress Tracking', () => {
    it('should track workflow execution progress', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Progress Test Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'progress-test-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.STARTED,
        inputData: {
          inputFormat: 'FREE_TEXT',
          targetAudienceData: 'CTOs at B2B SaaS companies',
        },
      });

      // Update progress
      const progressUpdate: ProgressUpdate = {
        executionId: execution.id,
        step: 'TRANSLATION',
        progress: 25,
        message: 'Processing target audience data',
        metadata: {
          processedRecords: 5,
          totalRecords: 20,
        },
      };

      await workflowProgress.updateProgress(progressUpdate);

      // Verify progress was updated
      const progress = await workflowProgress.getProgress(execution.id);
      expect(progress).toBeDefined();
      expect(progress).not.toBeNull();
      if (progress) {
        expect(progress.executionId).toBe(execution.id);
        expect(progress.currentStep).toBe('TRANSLATION');
        expect(progress.progress).toBe(25);
        expect(progress.message).toBe('Processing target audience data');
      }
    });

    it('should track multi-step workflow progress', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Multi-Step Progress Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'multi-step-progress-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.STARTED,
        inputData: {
          inputFormat: 'STRUCTURED_JSON',
          targetAudienceData: 'CTOs at B2B SaaS companies',
        },
      });

      // Update progress for multiple steps
      const steps = [
        { step: 'VALIDATION', progress: 10, message: 'Validating input data' },
        { step: 'ANALYSIS', progress: 30, message: 'Analyzing target audience' },
        { step: 'TRANSLATION', progress: 60, message: 'Translating to structured format' },
        { step: 'ENRICHMENT', progress: 80, message: 'Creating enrichment schema' },
        { step: 'COMPLETION', progress: 100, message: 'Workflow completed successfully' },
      ];

      for (const stepData of steps) {
        const progressUpdate: ProgressUpdate = {
          executionId: execution.id,
          step: stepData.step,
          progress: stepData.progress,
          message: stepData.message,
          metadata: {
            stepStartTime: new Date().toISOString(),
            processedItems: Math.floor(stepData.progress / 10),
          },
        };

        await workflowProgress.updateProgress(progressUpdate);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      }

      // Verify final progress
      const finalProgress = await workflowProgress.getProgress(execution.id);
      expect(finalProgress).toBeDefined();
      expect(finalProgress).not.toBeNull();
      if (finalProgress) {
        expect(finalProgress.progress).toBe(100);
        expect(finalProgress.currentStep).toBe('COMPLETION');
        expect(finalProgress.message).toBe('Workflow completed successfully');
      }
    });

    it('should handle progress updates with detailed metadata', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Detailed Progress Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'detailed-progress-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.STARTED,
        inputData: {
          leadId: 'test-lead-id',
          email: 'test@example.com',
        },
      });

      // Update progress with detailed metadata
      const progressUpdate: ProgressUpdate = {
        executionId: execution.id,
        step: 'ENRICHMENT',
        progress: 50,
        message: 'Enriching lead data from multiple sources',
        metadata: {
          sources: ['LinkedIn', 'Company Website', 'Crunchbase'],
          processedSources: 1,
          totalSources: 3,
          currentSource: 'LinkedIn',
          enrichedFields: ['company', 'title', 'location'],
          errors: [],
          warnings: ['Limited data available for some fields'],
        },
      };

      await workflowProgress.updateProgress(progressUpdate);

      // Verify detailed progress
      const progress = await workflowProgress.getProgress(execution.id);
      expect(progress).toBeDefined();
      expect(progress).not.toBeNull();
      if (progress) {
        expect(progress.executionId).toBe(execution.id);
        expect(progress.currentStep).toBe('ENRICHMENT');
        expect(progress.progress).toBe(50);
        expect(progress.message).toBe('Enriching lead data from multiple sources');
      }
    });
  });

  describe('Progress History and Analytics', () => {
    it('should retrieve progress history for an execution', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'History Test Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'history-test-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.STARTED,
        inputData: {
          inputFormat: 'FREE_TEXT',
          targetAudienceData: 'CTOs at B2B SaaS companies',
        },
      });

      // Update progress multiple times
      const progressUpdates = [
        { step: 'STARTED', progress: 10, message: 'Workflow started' },
        { step: 'PROCESSING', progress: 30, message: 'Processing data' },
        { step: 'COMPLETED', progress: 100, message: 'Workflow completed' },
      ];

      for (const update of progressUpdates) {
        const progressUpdate: ProgressUpdate = {
          executionId: execution.id,
          step: update.step,
          progress: update.progress,
          message: update.message,
        };

        await workflowProgress.updateProgress(progressUpdate);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get progress history
      const history = await workflowProgress.getProgressHistory(execution.id);
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should provide workflow analytics', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Analytics Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'analytics-test-workflow',
      });

      // Create multiple workflow executions
      const executions: any[] = [];
      for (let i = 0; i < 5; i++) {
        const execution = await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: i < 4 ? WorkflowExecutionStatus.SUCCESS : WorkflowExecutionStatus.FAILED,
          inputData: {
            leadId: `test-lead-${i}`,
            email: `test${i}@example.com`,
          },
        });
        executions.push(execution);

        // Update progress for each execution
        const progressUpdate: ProgressUpdate = {
          executionId: execution.id,
          step: i < 4 ? 'COMPLETED' : 'FAILED',
          progress: i < 4 ? 100 : 0,
          message: i < 4 ? 'Workflow completed' : 'Workflow failed',
        };

        await workflowProgress.updateProgress(progressUpdate);
      }

      // Get workflow analytics
      const analytics = await workflowProgress.getWorkflowAnalytics(workflow.id);
      expect(analytics).toBeDefined();
      expect(analytics.totalExecutions).toBeGreaterThan(0);
      expect(analytics.completedExecutions).toBeGreaterThan(0);
      expect(analytics.averageProgress).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid progress updates gracefully', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Error Test Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'error-test-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.STARTED,
        inputData: {
          inputFormat: 'FREE_TEXT',
          targetAudienceData: 'CTOs at B2B SaaS companies',
        },
      });

      // Test invalid progress values
      const invalidProgressUpdate: ProgressUpdate = {
        executionId: execution.id,
        step: 'TEST',
        progress: 150, // Invalid: > 100
        message: 'Invalid progress test',
      };

      // Should handle gracefully (not throw)
      await expect(workflowProgress.updateProgress(invalidProgressUpdate)).resolves.not.toThrow();

      // Test negative progress values
      const negativeProgressUpdate: ProgressUpdate = {
        executionId: execution.id,
        step: 'TEST',
        progress: -10, // Invalid: < 0
        message: 'Negative progress test',
      };

      await expect(workflowProgress.updateProgress(negativeProgressUpdate)).resolves.not.toThrow();
    });

    it('should handle concurrent progress updates', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Concurrent Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'concurrent-test-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.STARTED,
        inputData: {
          leadId: 'test-lead-id',
          email: 'test@example.com',
        },
      });

      // Create multiple concurrent progress updates
      const updatePromises: Promise<void>[] = [];
      for (let i = 0; i < 10; i++) {
        const progressUpdate: ProgressUpdate = {
          executionId: execution.id,
          step: `STEP_${i}`,
          progress: (i + 1) * 10,
          message: `Progress update ${i + 1}`,
        };

        updatePromises.push(workflowProgress.updateProgress(progressUpdate));
      }

      // Execute all updates concurrently
      await Promise.all(updatePromises);

      // Verify final progress
      const finalProgress = await workflowProgress.getProgress(execution.id);
      expect(finalProgress).toBeDefined();
      expect(finalProgress).not.toBeNull();
      if (finalProgress) {
        expect(finalProgress.executionId).toBe(execution.id);
      }
    });
  });
}); 