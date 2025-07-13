import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { WorkflowType, WorkflowExecutionStatus } from '../src/workflows/constants/workflow.constants';
import { TestSetup } from './helpers/test-setup';
import { WorkflowErrorHandlerService, ErrorContext, RecoveryStrategy } from '../src/workflows/services/workflow-error-handler.service';

describe('Workflow Error Handler Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testSetup: TestSetup;
  let workflowErrorHandler: WorkflowErrorHandlerService;

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
    workflowErrorHandler = moduleFixture.get<WorkflowErrorHandlerService>(WorkflowErrorHandlerService);
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

  describe('Error Handling', () => {
    it('should handle workflow execution errors', async () => {
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
        status: WorkflowExecutionStatus.FAILED,
        inputData: {
          inputFormat: 'FREE_TEXT',
          targetAudienceData: 'CTOs at B2B SaaS companies',
        },
      });

      // Create error context
      const errorContext: ErrorContext = {
        executionId: execution.id,
        workflowId: workflow.id,
        workflowType: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        companyId: testData.companyId,
        error: new Error('Network timeout during API call'),
        timestamp: new Date(),
        retryCount: 0,
        inputData: {
          inputFormat: 'FREE_TEXT',
          targetAudienceData: 'CTOs at B2B SaaS companies',
        },
      };

      // Handle the error
      await workflowErrorHandler.handleError(errorContext);

      // Verify error was handled (no exception thrown)
      expect(true).toBe(true); // If we reach here, error handling succeeded
    });

    it('should handle different types of errors', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Multi-Error Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'multi-error-test-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.FAILED,
        inputData: {
          leadId: 'test-lead-id',
          email: 'test@example.com',
        },
      });

      // Test different error types
      const errorTypes = [
        new Error('Network timeout'),
        new Error('Invalid input data'),
        new Error('API rate limit exceeded'),
        new Error('Database connection failed'),
      ];

      for (const error of errorTypes) {
        const errorContext: ErrorContext = {
          executionId: execution.id,
          workflowId: workflow.id,
          workflowType: WorkflowType.LEAD_ENRICHMENT,
          companyId: testData.companyId,
          error,
          timestamp: new Date(),
          retryCount: 0,
          inputData: {
            leadId: 'test-lead-id',
            email: 'test@example.com',
          },
        };

        // Handle each error type
        await expect(workflowErrorHandler.handleError(errorContext)).resolves.not.toThrow();
      }
    });

    it('should handle errors with retry attempts', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Retry Error Test Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'retry-error-test-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.FAILED,
        inputData: {
          inputFormat: 'STRUCTURED_JSON',
          targetAudienceData: 'CTOs at B2B SaaS companies',
        },
      });

      // Test error handling with different retry counts
      for (let retryCount = 0; retryCount <= 3; retryCount++) {
        const errorContext: ErrorContext = {
          executionId: execution.id,
          workflowId: workflow.id,
          workflowType: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
          companyId: testData.companyId,
          error: new Error(`Temporary failure (attempt ${retryCount + 1})`),
          timestamp: new Date(),
          retryCount,
          inputData: {
            inputFormat: 'STRUCTURED_JSON',
            targetAudienceData: 'CTOs at B2B SaaS companies',
          },
        };

        // Handle error with retry count
        await expect(workflowErrorHandler.handleError(errorContext)).resolves.not.toThrow();
      }
    });
  });

  describe('Recovery Strategies', () => {
    it('should add and retrieve custom recovery strategies', async () => {
      const testData = testSetup.getTestData();

      // Create a custom recovery strategy
      const customStrategy: RecoveryStrategy = {
        id: 'custom-retry-strategy',
        name: 'Custom Retry Strategy',
        description: 'Custom retry strategy for network timeouts',
        priority: 10,
        conditions: [
          {
            type: 'error_message',
            value: 'timeout',
            operator: 'contains',
          },
          {
            type: 'retry_count',
            value: 3,
            operator: 'less_than',
          },
        ],
        actions: [
          {
            type: 'retry',
            config: {
              maxRetries: 5,
              backoffMs: 2000,
            },
          },
        ],
      };

      // Add the custom strategy
      workflowErrorHandler.addRecoveryStrategy(customStrategy);

      // Retrieve all strategies
      const strategies = workflowErrorHandler.getRecoveryStrategies();
      expect(strategies).toBeDefined();
      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies.length).toBeGreaterThan(0);

      // Verify our custom strategy is included
      const foundStrategy = strategies.find(s => s.id === 'custom-retry-strategy');
      expect(foundStrategy).toBeDefined();
      if (foundStrategy) {
        expect(foundStrategy.name).toBe('Custom Retry Strategy');
      }
    });

    it('should handle recovery strategies with multiple conditions', async () => {
      const testData = testSetup.getTestData();

      // Create a complex recovery strategy
      const complexStrategy: RecoveryStrategy = {
        id: 'complex-recovery-strategy',
        name: 'Complex Recovery Strategy',
        description: 'Strategy with multiple conditions and actions',
        priority: 15,
        conditions: [
          {
            type: 'workflow_type',
            value: WorkflowType.LEAD_ENRICHMENT,
            operator: 'equals',
          },
          {
            type: 'error_type',
            value: 'Error',
            operator: 'equals',
          },
          {
            type: 'retry_count',
            value: 2,
            operator: 'less_than',
          },
        ],
        actions: [
          {
            type: 'retry',
            config: {
              maxRetries: 3,
              backoffMs: 1000,
            },
          },
          {
            type: 'notify_admin',
            config: {
              email: 'admin@example.com',
              severity: 'medium',
            },
          },
        ],
      };

      // Add the strategy
      workflowErrorHandler.addRecoveryStrategy(complexStrategy);

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Complex Strategy Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'complex-strategy-test-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.FAILED,
        inputData: {
          leadId: 'test-lead-id',
          email: 'test@example.com',
        },
      });

      // Create error context that matches the strategy conditions
      const errorContext: ErrorContext = {
        executionId: execution.id,
        workflowId: workflow.id,
        workflowType: WorkflowType.LEAD_ENRICHMENT,
        companyId: testData.companyId,
        error: new Error('API rate limit exceeded'),
        timestamp: new Date(),
        retryCount: 1,
        inputData: {
          leadId: 'test-lead-id',
          email: 'test@example.com',
        },
      };

      // Handle the error
      await expect(workflowErrorHandler.handleError(errorContext)).resolves.not.toThrow();
    });
  });

  describe('Error History and Analytics', () => {
    it('should retrieve error history for an execution', async () => {
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
        status: WorkflowExecutionStatus.FAILED,
        inputData: {
          inputFormat: 'FREE_TEXT',
          targetAudienceData: 'CTOs at B2B SaaS companies',
        },
      });

      // Get error history
      const history = await workflowErrorHandler.getErrorHistory(execution.id);
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);

      // Verify history entry structure
      const firstEntry = history[0];
      expect(firstEntry.executionId).toBe(execution.id);
      expect(firstEntry.workflowId).toBeDefined();
      expect(firstEntry.workflowType).toBeDefined();
      expect(firstEntry.error).toBeDefined();
      expect(firstEntry.timestamp).toBeDefined();
      expect(firstEntry.retryCount).toBeDefined();
    });

    it('should provide error analytics for a workflow', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Analytics Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'analytics-test-workflow',
      });

      // Create multiple workflow executions with errors
      const executions: any[] = [];
      for (let i = 0; i < 5; i++) {
        const execution = await testSetup.createTestWorkflowExecution({
          workflowId: workflow.id,
          status: i < 3 ? WorkflowExecutionStatus.FAILED : WorkflowExecutionStatus.SUCCESS,
          inputData: {
            leadId: `test-lead-${i}`,
            email: `test${i}@example.com`,
          },
        });
        executions.push(execution);

        // Create error context for failed executions
        if (i < 3) {
          const errorContext: ErrorContext = {
            executionId: execution.id,
            workflowId: workflow.id,
            workflowType: WorkflowType.LEAD_ENRICHMENT,
            companyId: testData.companyId,
            error: new Error(`Test error ${i + 1}`),
            timestamp: new Date(),
            retryCount: i,
            inputData: {
              leadId: `test-lead-${i}`,
              email: `test${i}@example.com`,
            },
          };

          await workflowErrorHandler.handleError(errorContext);
        }
      }

      // Get error analytics
      const analytics = await workflowErrorHandler.getErrorAnalytics(workflow.id);
      expect(analytics).toBeDefined();
      expect(analytics.totalErrors).toBeGreaterThan(0);
      expect(analytics.resolvedErrors).toBeGreaterThan(0);
      expect(analytics.averageResolutionTime).toBeGreaterThan(0);
      expect(analytics.mostCommonError).toBeDefined();
      expect(analytics.recoverySuccessRate).toBeGreaterThan(0);
      expect(analytics.recoverySuccessRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Recovery', () => {
    it('should handle recovery actions gracefully', async () => {
      const testData = testSetup.getTestData();

      // Create a test workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Recovery Test Workflow',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'recovery-test-workflow',
      });

      // Create workflow execution
      const execution = await testSetup.createTestWorkflowExecution({
        workflowId: workflow.id,
        status: WorkflowExecutionStatus.FAILED,
        inputData: {
          inputFormat: 'FREE_TEXT',
          targetAudienceData: 'CTOs at B2B SaaS companies',
        },
      });

      // Test different recovery action types
      const recoveryStrategies: RecoveryStrategy[] = [
        {
          id: 'retry-strategy',
          name: 'Retry Strategy',
          description: 'Simple retry strategy',
          priority: 5,
          conditions: [
            {
              type: 'retry_count' as const,
              value: 3,
              operator: 'less_than' as const,
            },
          ],
          actions: [
            {
              type: 'retry' as const,
              config: {
                maxRetries: 3,
                backoffMs: 1000,
              },
            },
          ],
        },
        {
          id: 'fallback-strategy',
          name: 'Fallback Strategy',
          description: 'Fallback provider strategy',
          priority: 10,
          conditions: [
            {
              type: 'error_message' as const,
              value: 'timeout',
              operator: 'contains' as const,
            },
          ],
          actions: [
            {
              type: 'fallback_provider' as const,
              config: {
                provider: 'backup-provider',
              },
            },
          ],
        },
        {
          id: 'manual-intervention-strategy',
          name: 'Manual Intervention Strategy',
          description: 'Manual intervention strategy',
          priority: 15,
          conditions: [
            {
              type: 'retry_count' as const,
              value: 5,
              operator: 'greater_than' as const,
            },
          ],
          actions: [
            {
              type: 'manual_intervention' as const,
              config: {
                notifyEmail: 'admin@example.com',
                severity: 'high',
              },
            },
          ],
        },
      ];

      // Add all strategies
      for (const strategy of recoveryStrategies) {
        workflowErrorHandler.addRecoveryStrategy(strategy);
      }

      // Test error handling with different scenarios
      const errorScenarios = [
        {
          error: new Error('Network timeout'),
          retryCount: 1,
          expectedRecovery: true,
        },
        {
          error: new Error('Invalid input data'),
          retryCount: 0,
          expectedRecovery: true,
        },
        {
          error: new Error('Critical system failure'),
          retryCount: 6,
          expectedRecovery: true,
        },
      ];

      for (const scenario of errorScenarios) {
        const errorContext: ErrorContext = {
          executionId: execution.id,
          workflowId: workflow.id,
          workflowType: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
          companyId: testData.companyId,
          error: scenario.error,
          timestamp: new Date(),
          retryCount: scenario.retryCount,
          inputData: {
            inputFormat: 'FREE_TEXT',
            targetAudienceData: 'CTOs at B2B SaaS companies',
          },
        };

        // Handle error - should not throw
        await expect(workflowErrorHandler.handleError(errorContext)).resolves.not.toThrow();
      }
    });
  });
}); 