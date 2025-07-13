import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { WorkflowType, WorkflowExecutionStatus } from '../src/workflows/constants/workflow.constants';
import { TestSetup } from './helpers/test-setup';
import { WorkflowOrchestratorService, WorkflowChain, ChainExecution } from '../src/workflows/services/workflow-orchestrator.service';

describe('Workflow Orchestrator Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testSetup: TestSetup;
  let workflowOrchestrator: WorkflowOrchestratorService;

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
    workflowOrchestrator = moduleFixture.get<WorkflowOrchestratorService>(WorkflowOrchestratorService);
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

  describe('Workflow Chain Execution', () => {
    it('should execute a simple workflow chain successfully', async () => {
      const testData = testSetup.getTestData();

      // Create workflows for the chain
      const workflow1 = await testSetup.createTestWorkflow({
        name: 'Chain Workflow 1',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'chain-workflow-1',
      });

      const workflow2 = await testSetup.createTestWorkflow({
        name: 'Chain Workflow 2',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'chain-workflow-2',
      });

      // Create workflow chain
      const chain: WorkflowChain = {
        id: 'test-chain-1',
        name: 'Test Workflow Chain',
        description: 'A simple test workflow chain',
        companyId: testData.companyId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'step-1',
            workflowId: workflow1.id,
            workflowType: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
            order: 1,
            inputMapping: {
              inputFormat: 'input.inputFormat',
              targetAudienceData: 'input.targetAudienceData',
            },
          },
          {
            id: 'step-2',
            workflowId: workflow2.id,
            workflowType: WorkflowType.LEAD_ENRICHMENT,
            order: 2,
            dependsOn: ['step-1'],
            inputMapping: {
              leadId: 'step_1.leads[0].id',
              enrichmentSchema: 'step_1.enrichmentSchema',
            },
          },
        ],
      };

      // Execute the chain
      const inputData = {
        inputFormat: 'FREE_TEXT',
        targetAudienceData: 'CTOs at B2B SaaS companies in Europe',
      };

      const chainExecution = await workflowOrchestrator.executeChain(
        chain,
        inputData,
        testData.companyId,
        testData.userId,
      );

      expect(chainExecution).toBeDefined();
      expect(chainExecution.chainId).toBe(chain.id);
      expect(chainExecution.companyId).toBe(testData.companyId);
      expect(chainExecution.triggeredBy).toBe(testData.userId);
      expect(chainExecution.status).toBe('PENDING');

      // Wait a bit for async execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify the chain execution was created
      expect(chainExecution.id).toBeDefined();
      expect(chainExecution.stepExecutions).toBeDefined();
      expect(Array.isArray(chainExecution.stepExecutions)).toBe(true);
    });

    it('should handle workflow chain with conditional execution', async () => {
      const testData = testSetup.getTestData();

      // Create workflows
      const workflow1 = await testSetup.createTestWorkflow({
        name: 'Conditional Workflow 1',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'conditional-workflow-1',
      });

      const workflow2 = await testSetup.createTestWorkflow({
        name: 'Conditional Workflow 2',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'conditional-workflow-2',
      });

      // Create chain with conditional step
      const chain: WorkflowChain = {
        id: 'test-chain-2',
        name: 'Conditional Workflow Chain',
        description: 'A workflow chain with conditional execution',
        companyId: testData.companyId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'step-1',
            workflowId: workflow1.id,
            workflowType: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
            order: 1,
            inputMapping: {
              inputFormat: 'input.inputFormat',
              targetAudienceData: 'input.targetAudienceData',
            },
          },
          {
            id: 'step-2',
            workflowId: workflow2.id,
            workflowType: WorkflowType.LEAD_ENRICHMENT,
            order: 2,
            dependsOn: ['step-1'],
            condition: '${step_1.leads.length} > 0',
            inputMapping: {
              leadId: 'step_1.leads[0].id',
              enrichmentSchema: 'step_1.enrichmentSchema',
            },
          },
        ],
      };

      // Execute with data that should trigger conditional step
      const inputData = {
        inputFormat: 'FREE_TEXT',
        targetAudienceData: 'CTOs at B2B SaaS companies',
      };

      const chainExecution = await workflowOrchestrator.executeChain(
        chain,
        inputData,
        testData.companyId,
        testData.userId,
      );

      expect(chainExecution).toBeDefined();
      expect(chainExecution.chainId).toBe(chain.id);
      expect(chainExecution.status).toBe('PENDING');

      // Wait a bit for async execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify the chain execution was created
      expect(chainExecution.id).toBeDefined();
      expect(chainExecution.stepExecutions).toBeDefined();
    });

    it('should handle workflow chain with retry configuration', async () => {
      const testData = testSetup.getTestData();

      // Create workflow with retry configuration
      const workflow = await testSetup.createTestWorkflow({
        name: 'Retry Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'retry-workflow',
      });

      // Create chain with retry configuration
      const chain: WorkflowChain = {
        id: 'test-chain-3',
        name: 'Retry Workflow Chain',
        description: 'A workflow chain with retry configuration',
        companyId: testData.companyId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'step-1',
            workflowId: workflow.id,
            workflowType: WorkflowType.LEAD_ENRICHMENT,
            order: 1,
            retryConfig: {
              maxRetries: 3,
              backoffMs: 1000,
            },
            inputMapping: {
              leadId: 'input.leadId',
              email: 'input.email',
            },
          },
        ],
      };

      // Execute with test data
      const inputData = {
        leadId: 'test-lead-id',
        email: 'test@example.com',
      };

      const chainExecution = await workflowOrchestrator.executeChain(
        chain,
        inputData,
        testData.companyId,
        testData.userId,
      );

      expect(chainExecution).toBeDefined();
      expect(chainExecution.chainId).toBe(chain.id);
      expect(chainExecution.status).toBe('PENDING');

      // Wait a bit for async execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify the chain execution was created
      expect(chainExecution.id).toBeDefined();
      expect(chainExecution.stepExecutions).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle workflow chain with invalid dependencies', async () => {
      const testData = testSetup.getTestData();

      // Create workflows
      const workflow1 = await testSetup.createTestWorkflow({
        name: 'Invalid Dep Workflow 1',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'invalid-dep-workflow-1',
      });

      const workflow2 = await testSetup.createTestWorkflow({
        name: 'Invalid Dep Workflow 2',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'invalid-dep-workflow-2',
      });

      // Create chain with invalid dependency
      const chain: WorkflowChain = {
        id: 'test-chain-4',
        name: 'Invalid Dependency Chain',
        description: 'A workflow chain with invalid dependencies',
        companyId: testData.companyId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'step-1',
            workflowId: workflow1.id,
            workflowType: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
            order: 1,
            inputMapping: {},
          },
          {
            id: 'step-2',
            workflowId: workflow2.id,
            workflowType: WorkflowType.LEAD_ENRICHMENT,
            order: 2,
            dependsOn: ['non-existent-step'],
            inputMapping: {},
          },
        ],
      };

      // Execute the chain
      const inputData = {
        inputFormat: 'FREE_TEXT',
        targetAudienceData: 'CTOs at B2B SaaS companies',
      };

      const chainExecution = await workflowOrchestrator.executeChain(
        chain,
        inputData,
        testData.companyId,
        testData.userId,
      );

      expect(chainExecution).toBeDefined();
      expect(chainExecution.chainId).toBe(chain.id);
      expect(chainExecution.status).toBe('PENDING');

      // Wait a bit for async execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify the chain execution was created
      expect(chainExecution.id).toBeDefined();
    });
  });
}); 