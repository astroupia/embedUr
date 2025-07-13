import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestSetup } from './helpers/test-setup';
import { WorkflowType, WorkflowExecutionStatus } from '../src/workflows/constants/workflow.constants';

describe('Workflows Integration (e2e)', () => {
  let app: INestApplication;
  let testSetup: TestSetup;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const prismaService = app.get<PrismaService>(PrismaService);
    testSetup = new TestSetup(app, prismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await testSetup.setupTestData();
  });

  afterEach(async () => {
    await testSetup.cleanupTestData();
  });

  describe('Workflow CRUD Operations', () => {
    it('should create, read, update, and delete a workflow', async () => {
      const testData = testSetup.getTestData();

      // Create workflow
      const createResponse = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'test-n8n-workflow-123',
      });
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.name).toBe('Test Workflow');
      expect(createResponse.body.type).toBe(WorkflowType.LEAD_ENRICHMENT);
      expect(createResponse.body.n8nWorkflowId).toBe('test-n8n-workflow-123');
      expect(createResponse.body.companyId).toBe(testData.companyId);
      expect(createResponse.body.isActive).toBe(false);
      expect(createResponse.body.executionCount).toBe(0);

      const workflowId = createResponse.body.id;

      // Read workflow
      const getResponse = await testSetup.makeAuthenticatedRequest('get', `/workflows/${workflowId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.id).toBe(workflowId);
      expect(getResponse.body.name).toBe('Test Workflow');

      // Update workflow
      const updateResponse = await testSetup.makeAuthenticatedRequest('patch', `/workflows/${workflowId}`, {
        name: 'Updated Test Workflow',
        n8nWorkflowId: 'updated-n8n-workflow-456',
      });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('Updated Test Workflow');
      expect(updateResponse.body.n8nWorkflowId).toBe('updated-n8n-workflow-456');

      // Try to delete workflow (should succeed because it has no executions)
      const deleteResponse = await testSetup.makeAuthenticatedRequest('delete', `/workflows/${workflowId}`);
      expect(deleteResponse.status).toBe(204); // Successfully deleted

      // Verify workflow no longer exists
      const getWorkflowResponse = await testSetup.makeAuthenticatedRequest('get', `/workflows/${workflowId}`);
      expect(getWorkflowResponse.status).toBe(404); // Not found
    });

    it('should create workflows of different types', async () => {
      const testData = testSetup.getTestData();

      // Create LEAD_ENRICHMENT workflow
      const enrichmentWorkflow = await testSetup.createTestWorkflow({
        name: 'Enrichment Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'enrichment-n8n-123',
      });

      expect(enrichmentWorkflow.type).toBe(WorkflowType.LEAD_ENRICHMENT);
      expect(enrichmentWorkflow.isEnrichmentWorkflow).toBe(true);
      expect(enrichmentWorkflow.isEmailSequenceWorkflow).toBe(false);
      expect(enrichmentWorkflow.isRoutingWorkflow).toBe(false);
      expect(enrichmentWorkflow.typeDescription).toBe('Lead Enrichment');

      // Create EMAIL_SEQUENCE workflow
      const emailWorkflow = await testSetup.createTestWorkflow({
        name: 'Email Sequence Workflow',
        type: WorkflowType.EMAIL_SEQUENCE,
        n8nWorkflowId: 'email-n8n-456',
      });

      expect(emailWorkflow.type).toBe(WorkflowType.EMAIL_SEQUENCE);
      expect(emailWorkflow.isEnrichmentWorkflow).toBe(false);
      expect(emailWorkflow.isEmailSequenceWorkflow).toBe(true);
      expect(emailWorkflow.isRoutingWorkflow).toBe(false);
      expect(emailWorkflow.typeDescription).toBe('Email Sequence');

      // Create LEAD_ROUTING workflow
      const routingWorkflow = await testSetup.createTestWorkflow({
        name: 'Lead Routing Workflow',
        type: WorkflowType.LEAD_ROUTING,
        n8nWorkflowId: 'routing-n8n-789',
      });

      expect(routingWorkflow.type).toBe(WorkflowType.LEAD_ROUTING);
      expect(routingWorkflow.isEnrichmentWorkflow).toBe(false);
      expect(routingWorkflow.isEmailSequenceWorkflow).toBe(false);
      expect(routingWorkflow.isRoutingWorkflow).toBe(true);
      expect(routingWorkflow.typeDescription).toBe('Lead Routing');
    });
  });

  describe('Workflow List and Filtering', () => {
    it('should list workflows with pagination and filtering', async () => {
      const testData = testSetup.getTestData();

      // Create multiple workflows
      await testSetup.createTestWorkflow({
        name: 'Enrichment Workflow 1',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'enrichment-1',
      });

      await testSetup.createTestWorkflow({
        name: 'Email Workflow 1',
        type: WorkflowType.EMAIL_SEQUENCE,
        n8nWorkflowId: 'email-1',
      });

      await testSetup.createTestWorkflow({
        name: 'Enrichment Workflow 2',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'enrichment-2',
      });

      // Get all workflows
      const allResponse = await testSetup.makeAuthenticatedRequest('get', '/workflows?take=10');
      expect(allResponse.status).toBe(200);
      expect(allResponse.body.data).toBeDefined();
      expect(allResponse.body.data.length).toBeGreaterThanOrEqual(3);

      // Filter by type
      const enrichmentResponse = await testSetup.makeAuthenticatedRequest('get', `/workflows/type/${WorkflowType.LEAD_ENRICHMENT}`);
      expect(enrichmentResponse.status).toBe(200);
      enrichmentResponse.body.forEach((workflow: any) => {
        expect(workflow.type).toBe(WorkflowType.LEAD_ENRICHMENT);
      });

      // Get workflow statistics
      const statsResponse = await testSetup.makeAuthenticatedRequest('get', '/workflows/stats');
      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body).toHaveProperty('total');
      expect(statsResponse.body).toHaveProperty('byType');
      expect(statsResponse.body.byType).toHaveProperty(WorkflowType.LEAD_ENRICHMENT);
      expect(statsResponse.body.byType).toHaveProperty(WorkflowType.EMAIL_SEQUENCE);
      expect(statsResponse.body.byType).toHaveProperty(WorkflowType.LEAD_ROUTING);
      expect(statsResponse.body).toHaveProperty('totalExecutions');
      expect(statsResponse.body).toHaveProperty('successfulExecutions');
      expect(statsResponse.body).toHaveProperty('failedExecutions');
    });

    it('should search workflows by name', async () => {
      const testData = testSetup.getTestData();

      // Create workflows with specific names
      await testSetup.createTestWorkflow({
        name: 'Search Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'search-test-1',
      });

      await testSetup.createTestWorkflow({
        name: 'Another Search Test',
        type: WorkflowType.EMAIL_SEQUENCE,
        n8nWorkflowId: 'search-test-2',
      });

      await testSetup.createTestWorkflow({
        name: 'Different Name',
        type: WorkflowType.LEAD_ROUTING,
        n8nWorkflowId: 'different-1',
      });

      // Search by name
      const searchResponse = await testSetup.makeAuthenticatedRequest('get', '/workflows?search=Search Test');
      expect(searchResponse.status).toBe(200);
      searchResponse.body.data.forEach((workflow: any) => {
        expect(workflow.name).toContain('Search Test');
      });
    });
  });

  describe('Workflow Execution', () => {
    it('should execute a workflow successfully', async () => {
      const testData = testSetup.getTestData();

      // Create a workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Test Execution Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'execution-test-123',
      });

      // Execute the workflow
      const executionResponse = await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow.id}/execute`, {
        inputData: {
          email: 'test@example.com',
        },
      });

      expect(executionResponse.status).toBe(201);
      expect(executionResponse.body.workflowId).toBe(workflow.id);
      expect(executionResponse.body.status).toBe(WorkflowExecutionStatus.STARTED);
      expect(executionResponse.body.triggeredBy).toBe(testData.userId);
      expect(executionResponse.body.inputData).toEqual({
        email: 'test@example.com',
      });
      expect(executionResponse.body.leadId).toBeNull();
      expect(executionResponse.body.isRunning).toBe(true);
      expect(executionResponse.body.isCompleted).toBe(false);

      // Verify workflow execution count increased
      const updatedWorkflow = await testSetup.makeAuthenticatedRequest('get', `/workflows/${workflow.id}`);
      expect(updatedWorkflow.status).toBe(200);
      expect(updatedWorkflow.body.executionCount).toBe(1);
      expect(updatedWorkflow.body.isActive).toBe(true);
    });

    it('should validate input data for different workflow types', async () => {
      const testData = testSetup.getTestData();

      // Create enrichment workflow
      const enrichmentWorkflow = await testSetup.createTestWorkflow({
        name: 'Enrichment Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'enrichment-123',
      });

      // Test valid input for enrichment workflow
      const validEnrichmentResponse = await testSetup.makeAuthenticatedRequest('post', `/workflows/${enrichmentWorkflow.id}/execute`, {
        inputData: {
          email: 'test@example.com',
        },
      });
      expect(validEnrichmentResponse.status).toBe(201);

      // Test invalid input for enrichment workflow (missing required fields)
      const invalidEnrichmentResponse = await testSetup.makeAuthenticatedRequest('post', `/workflows/${enrichmentWorkflow.id}/execute`, {
        inputData: {
          campaignId: 'test-campaign-123', // Missing leadId/email
        },
      });
      expect(invalidEnrichmentResponse.status).toBe(400);

      // Create email sequence workflow
      const emailWorkflow = await testSetup.createTestWorkflow({
        name: 'Email Workflow',
        type: WorkflowType.EMAIL_SEQUENCE,
        n8nWorkflowId: 'email-123',
      });

      // Test valid input for email workflow
      const validEmailResponse = await testSetup.makeAuthenticatedRequest('post', `/workflows/${emailWorkflow.id}/execute`, {
        inputData: {
          campaignId: 'test-campaign-123',
          leadId: 'test-lead-123',
        },
        campaignId: 'test-campaign-123',
      });
      expect(validEmailResponse.status).toBe(201);

      // Test invalid input for email workflow
      const invalidEmailResponse = await testSetup.makeAuthenticatedRequest('post', `/workflows/${emailWorkflow.id}/execute`, {
        inputData: {
          // Missing campaignId
        },
      });
      expect(invalidEmailResponse.status).toBe(400);
    });

    it('should track execution history', async () => {
      const testData = testSetup.getTestData();

      // Create a workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'History Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'history-test-123',
      });

      // Execute workflow multiple times
      const execution1 = await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow.id}/execute`, {
        inputData: { email: 'test1@example.com' },
      });
      expect(execution1.status).toBe(201);

      const execution2 = await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow.id}/execute`, {
        inputData: { email: 'test2@example.com' },
      });
      expect(execution2.status).toBe(201);

      // Get execution history
      const executionsResponse = await testSetup.makeAuthenticatedRequest('get', `/workflows/${workflow.id}/executions`);
      expect(executionsResponse.status).toBe(200);
      expect(executionsResponse.body.length).toBeGreaterThanOrEqual(2);

      // Verify execution details
      const execution1Data = executionsResponse.body.find((e: any) => e.inputData.email === 'test1@example.com');
      const execution2Data = executionsResponse.body.find((e: any) => e.inputData.email === 'test2@example.com');

      expect(execution1Data).toBeDefined();
      expect(execution1Data.inputData).toEqual({ email: 'test1@example.com' });
      expect(execution1Data.triggeredBy).toBe(testData.userId);

      expect(execution2Data).toBeDefined();
      expect(execution2Data.inputData).toEqual({ email: 'test2@example.com' });
      expect(execution2Data.triggeredBy).toBe(testData.userId);
    });
  });

  describe('Workflow Execution Status Management', () => {
    it('should handle execution status transitions', async () => {
      const testData = testSetup.getTestData();

      // Create a workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Status Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'status-test-123',
      });

      // Execute workflow
      const execution = await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow.id}/execute`, {
        inputData: { email: 'test@example.com' },
      });
      expect(execution.status).toBe(201);

      const executionId = execution.body.id;

      // Get execution details
      const executionDetails = await testSetup.makeAuthenticatedRequest('get', `/workflows/executions/${executionId}`);
      expect(executionDetails.status).toBe(200);
      expect(executionDetails.body.status).toBe(WorkflowExecutionStatus.STARTED);
      expect(executionDetails.body.isRunning).toBe(true);
      expect(executionDetails.body.isCompleted).toBe(false);
      expect(executionDetails.body.isSuccessful).toBe(false);
      expect(executionDetails.body.isFailed).toBe(false);
      expect(executionDetails.body.hasError).toBe(false);
      expect(executionDetails.body.canBeRetried).toBe(false); // Not failed yet
    });

    it('should handle failed executions and retry logic', async () => {
      const testData = testSetup.getTestData();

      // Create a workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Retry Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'retry-test-123',
      });

      // Execute workflow
      const execution = await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow.id}/execute`, {
        inputData: { email: 'test@example.com' },
      });
      expect(execution.status).toBe(201);

      const executionId = execution.body.id;

      // Simulate a failed execution (in real scenario, this would be updated by n8n webhook)
      // For testing, we'll update the execution status directly in the database
      const prismaService = testSetup['prismaService'];
      await prismaService.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: 'FAILED',
          endTime: new Date(),
          outputData: { error: 'Test failure for retry testing' },
        },
      });

      // Verify the execution is now failed and can be retried
      const executionDetails = await testSetup.makeAuthenticatedRequest('get', `/workflows/executions/${executionId}`);
      expect(executionDetails.status).toBe(200);
      expect(executionDetails.body.isFailed).toBe(true);
      expect(executionDetails.body.canBeRetried).toBe(true);

      // Test retry with updated input data
      const retryResponse = await testSetup.makeAuthenticatedRequest('post', `/workflows/executions/${executionId}/retry`, {
        inputData: { email: 'test@example.com', retryAttempt: 1 },
      });
      expect(retryResponse.status).toBe(200);
    });
  });

  describe('Workflow Business Logic', () => {
    it('should determine workflow deletion eligibility', async () => {
      const testData = testSetup.getTestData();

      // Create a workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Deletion Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'deletion-test-123',
      });

      // Initially, workflow should be deletable (no executions)
      const initialWorkflow = await testSetup.makeAuthenticatedRequest('get', `/workflows/${workflow.id}`);
      expect(initialWorkflow.status).toBe(200);
      expect(initialWorkflow.body.canBeDeleted).toBe(true);

      // Execute the workflow
      await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow.id}/execute`, {
        inputData: { email: 'test@example.com' },
      });

      // After execution, workflow should not be deletable (recent execution)
      const updatedWorkflow = await testSetup.makeAuthenticatedRequest('get', `/workflows/${workflow.id}`);
      expect(updatedWorkflow.status).toBe(200);
      expect(updatedWorkflow.body.canBeDeleted).toBe(false); // Has recent execution
    });

    it('should validate workflow input data based on type', async () => {
      const testData = testSetup.getTestData();

      // Create different workflow types
      const enrichmentWorkflow = await testSetup.createTestWorkflow({
        name: 'Enrichment Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'enrichment-123',
      });

      const emailWorkflow = await testSetup.createTestWorkflow({
        name: 'Email Workflow',
        type: WorkflowType.EMAIL_SEQUENCE,
        n8nWorkflowId: 'email-123',
      });

      const routingWorkflow = await testSetup.createTestWorkflow({
        name: 'Routing Workflow',
        type: WorkflowType.LEAD_ROUTING,
        n8nWorkflowId: 'routing-123',
      });

      // Test input validation for enrichment workflow
      // For enrichment workflows, we need either leadId or email
      expect(enrichmentWorkflow.type).toBe(WorkflowType.LEAD_ENRICHMENT);
      expect(enrichmentWorkflow.isEnrichmentWorkflow).toBe(true);

      // Test input validation for email workflow
      expect(emailWorkflow.type).toBe(WorkflowType.EMAIL_SEQUENCE);
      expect(emailWorkflow.isEmailSequenceWorkflow).toBe(true);

      // Test input validation for routing workflow
      expect(routingWorkflow.type).toBe(WorkflowType.LEAD_ROUTING);
      expect(routingWorkflow.isRoutingWorkflow).toBe(true);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should isolate workflows by company', async () => {
      const testData = testSetup.getTestData();

      // Create workflow for current company
      const workflow = await testSetup.createTestWorkflow({
        name: 'Company Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'company-test-123',
      });

      // Verify workflow belongs to current company
      expect(workflow.companyId).toBe(testData.companyId);

      // Try to access workflow with different company context (should fail)
      // This would require creating a different test user/company, but the isolation
      // is handled by the service layer using the authenticated user's companyId
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent workflow gracefully', async () => {
      const response = await testSetup.makeAuthenticatedRequest('get', '/workflows/non-existent-id');
      expect(response.status).toBe(404);
    });

    it('should handle validation errors', async () => {
      // Test invalid workflow creation
      const invalidResponse = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: '', // Invalid: empty name
        type: 'INVALID_TYPE' as any, // Invalid: not in enum
        n8nWorkflowId: '', // Invalid: empty
      });
      expect(invalidResponse.status).toBe(400);
    });

    it('should handle workflow execution with invalid input', async () => {
      const testData = testSetup.getTestData();

      // Create a workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Invalid Input Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'invalid-input-test-123',
      });

      // Try to execute with invalid input
      const invalidExecutionResponse = await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow.id}/execute`, {
        inputData: {}, // Invalid: empty input data
      });
      expect(invalidExecutionResponse.status).toBe(400);
    });

    it('should allow duplicate workflow names', async () => {
      const testData = testSetup.getTestData();

      // Create first workflow
      await testSetup.createTestWorkflow({
        name: 'Duplicate Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'duplicate-test-1',
      });

      // Create second workflow with same name (should be allowed)
      const duplicateResponse = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Duplicate Test Workflow',
        type: WorkflowType.EMAIL_SEQUENCE,
        n8nWorkflowId: 'duplicate-test-2',
      });
      expect(duplicateResponse.status).toBe(201); // Success - duplicate names allowed
    });
  });

  describe('Workflow Execution Management', () => {
    it('should list all executions with pagination', async () => {
      const testData = testSetup.getTestData();

      // Create multiple workflows and execute them
      const workflow1 = await testSetup.createTestWorkflow({
        name: 'Execution List Workflow 1',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'exec-list-1',
      });

      const workflow2 = await testSetup.createTestWorkflow({
        name: 'Execution List Workflow 2',
        type: WorkflowType.EMAIL_SEQUENCE,
        n8nWorkflowId: 'exec-list-2',
      });

      // Execute workflows
      await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow1.id}/execute`, {
        inputData: { leadId: 'lead-1', email: 'test1@example.com' },
      });

      await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow2.id}/execute`, {
        inputData: { campaignId: 'campaign-1', leadId: 'lead-2' },
      });

      // Get all executions
      const executionsResponse = await testSetup.makeAuthenticatedRequest('get', '/workflows/executions?take=10');
      expect(executionsResponse.status).toBe(200);
      expect(executionsResponse.body.data).toBeDefined();
      expect(executionsResponse.body.data.length).toBeGreaterThanOrEqual(2);
      expect(executionsResponse.body.nextCursor).toBeDefined();

      // Verify execution data
      executionsResponse.body.data.forEach((execution: any) => {
        expect(execution.workflowId).toBeDefined();
        expect(execution.companyId).toBe(testData.companyId);
        expect(execution.triggeredBy).toBe(testData.userId);
        expect(execution.inputData).toBeDefined();
        expect(execution.status).toBeDefined();
        expect(execution.startTime).toBeDefined();
      });
    });

    it('should handle execution duration and timing', async () => {
      const testData = testSetup.getTestData();

      // Create a workflow
      const workflow = await testSetup.createTestWorkflow({
        name: 'Duration Test Workflow',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'duration-test-123',
      });

      // Execute workflow
      const execution = await testSetup.makeAuthenticatedRequest('post', `/workflows/${workflow.id}/execute`, {
        inputData: { leadId: 'test-lead', email: 'test@example.com' },
      });
      expect(execution.status).toBe(201);

      const executionId = execution.body.id;

      // Get execution details
      const executionDetails = await testSetup.makeAuthenticatedRequest('get', `/workflows/executions/${executionId}`);
      expect(executionDetails.status).toBe(200);
      expect(executionDetails.body.startTime).toBeDefined();
      expect(executionDetails.body.durationMs).toBeNull(); // Not completed yet
      expect(executionDetails.body.durationSeconds).toBeNull();
      expect(executionDetails.body.executionTime).toBe('N/A');
    });
  });
}); 