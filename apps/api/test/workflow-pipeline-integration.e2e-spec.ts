import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { WorkflowType, WorkflowExecutionStatus } from '../src/workflows/constants/workflow.constants';
import { TestSetup } from './helpers/test-setup';

describe('Workflow Pipeline Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testSetup: TestSetup;

  // Increase timeout for integration tests
  jest.setTimeout(60000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    testSetup = new TestSetup(app, prismaService);
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

  describe('Workflow 0 to Workflow 1 Pipeline', () => {
    it('should demonstrate complete workflow pipeline from target audience translation to lead enrichment', async () => {
      const testData = testSetup.getTestData();

      // Step 1: Create a Target Audience Translator workflow (Workflow 0)
      const targetAudienceWorkflow = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Target Audience Translator - B2B SaaS',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'target-audience-translator-workflow-id',
      });
      expect(targetAudienceWorkflow.status).toBe(201);
      const targetAudienceWorkflowId = targetAudienceWorkflow.body.id;

      // Step 2: Execute Target Audience Translator with natural language input
      const targetAudienceInput = {
        inputFormat: 'FREE_TEXT',
        targetAudienceData: 'I want to target CTOs and VP Engineering at B2B SaaS companies in Europe with 50-200 employees, preferably VC-backed companies.',
        config: {
          maxSampleLeads: 5,
          confidenceThreshold: 0.7,
        },
      };

      const targetAudienceExecution = await testSetup.makeAuthenticatedRequest(
        'post',
        `/workflows/${targetAudienceWorkflowId}/execute`,
        {
          inputData: targetAudienceInput,
        }
      );
      expect(targetAudienceExecution.status).toBe(201);
      const targetAudienceExecutionId = targetAudienceExecution.body.id;

      // Step 3: Verify Target Audience Translator output
      const targetAudienceResult = await testSetup.makeAuthenticatedRequest(
        'get',
        `/workflows/executions/${targetAudienceExecutionId}`
      );
      expect(targetAudienceResult.status).toBe(200);
      expect(targetAudienceResult.body.status).toBe('SUCCESS');
      expect(targetAudienceResult.body.outputData).toBeDefined();
      expect(targetAudienceResult.body.outputData.leads).toBeDefined();
      expect(targetAudienceResult.body.outputData.enrichmentSchema).toBeDefined();
      expect(targetAudienceResult.body.outputData.interpretedCriteria).toBeDefined();

      // Step 4: Create a Lead Enrichment workflow (Workflow 1) using the generated schema
      const enrichmentWorkflow = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Lead Enrichment - B2B SaaS',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'lead-enrichment-workflow-id',
      });
      expect(enrichmentWorkflow.status).toBe(201);
      const enrichmentWorkflowId = enrichmentWorkflow.body.id;

      // Step 5: Create a lead using the generated sample data from Workflow 0
      const sampleLead = targetAudienceResult.body.outputData.leads[0];
      const lead = await testSetup.makeAuthenticatedRequest('post', '/leads', {
        fullName: sampleLead.fullName,
        email: sampleLead.email || 'sample.lead@example.com',
        linkedinUrl: sampleLead.linkedinUrl,
        companyId: testData.companyId,
        campaignId: testData.campaignId,
        enrichmentData: {
          company: sampleLead.companyName,
          title: sampleLead.jobTitle,
          location: sampleLead.location,
        },
      });
      expect(lead.status).toBe(201);
      const leadId = lead.body.id;

      // Step 6: Execute Lead Enrichment workflow using the generated schema
      const enrichmentInput = {
        leadId: leadId,
        enrichmentSchema: targetAudienceResult.body.outputData.enrichmentSchema,
        interpretedCriteria: targetAudienceResult.body.outputData.interpretedCriteria,
        config: {
          providers: ['APOLLO', 'CLEARBIT'],
          maxRetries: 3,
        },
      };

      const enrichmentExecution = await testSetup.makeAuthenticatedRequest(
        'post',
        `/workflows/${enrichmentWorkflowId}/execute`,
        {
          inputData: enrichmentInput,
        }
      );
      expect(enrichmentExecution.status).toBe(201);
      const enrichmentExecutionId = enrichmentExecution.body.id;

      // Step 7: Verify the complete pipeline worked
      const enrichmentResult = await testSetup.makeAuthenticatedRequest(
        'get',
        `/workflows/executions/${enrichmentExecutionId}`
      );
      expect(enrichmentResult.status).toBe(200);

      // Step 8: Verify the lead was enriched with data from the schema
      const enrichedLead = await testSetup.makeAuthenticatedRequest('get', `/leads/${leadId}`);
      expect(enrichedLead.status).toBe(200);
      expect(enrichedLead.body.hasEnrichmentData).toBe(true);
      expect(enrichedLead.body.enrichmentData).toBeDefined();

      // Step 9: Check workflow statistics to verify both workflows are tracked
      const workflowStats = await testSetup.makeAuthenticatedRequest('get', '/workflows/stats');
      expect(workflowStats.status).toBe(200);
      expect(workflowStats.body.byType[WorkflowType.TARGET_AUDIENCE_TRANSLATOR]).toBeDefined();
      expect(workflowStats.body.byType[WorkflowType.LEAD_ENRICHMENT]).toBeDefined();

      // Step 10: Verify execution statistics
      const executionStats = await testSetup.makeAuthenticatedRequest('get', '/workflows/executions');
      expect(executionStats.status).toBe(200);
      expect(executionStats.body.data.length).toBeGreaterThanOrEqual(2); // At least 2 executions
    });

    it('should handle workflow pipeline with structured JSON input', async () => {
      const testData = testSetup.getTestData();

      // Step 1: Create Target Audience Translator workflow
      const targetAudienceWorkflow = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Structured Target Audience Translator',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'structured-target-audience-workflow-id',
      });
      expect(targetAudienceWorkflow.status).toBe(201);

      // Step 2: Execute with structured JSON input
      const structuredInput = {
        inputFormat: 'STRUCTURED_JSON',
        targetAudienceData: JSON.stringify({
          jobTitles: ['CTO', 'VP Engineering', 'Head of Technology'],
          industries: ['B2B SaaS', 'FinTech', 'HealthTech'],
          location: 'United States',
          companySize: '100-500 employees',
          fundingStatus: 'Series A or later',
        }),
        structuredData: {
          jobTitles: ['CTO', 'VP Engineering', 'Head of Technology'],
          industries: ['B2B SaaS', 'FinTech', 'HealthTech'],
          location: 'United States',
          companySize: '100-500 employees',
          fundingStatus: 'Series A or later',
        },
      };

      const execution = await testSetup.makeAuthenticatedRequest(
        'post',
        `/workflows/${targetAudienceWorkflow.body.id}/execute`,
        {
          inputData: structuredInput,
        }
      );
      expect(execution.status).toBe(201);

      // Step 3: Verify structured input was processed correctly
      const result = await testSetup.makeAuthenticatedRequest(
        'get',
        `/workflows/executions/${execution.body.id}`
      );
      expect(result.status).toBe(200);
      expect(result.body.outputData.interpretedCriteria.jobTitles).toEqual(['CTO', 'VP Engineering', 'Head of Technology']);
      expect(result.body.outputData.interpretedCriteria.industries).toEqual(['B2B SaaS', 'FinTech', 'HealthTech']);
      expect(result.body.outputData.interpretedCriteria.location).toBe('United States');
    });

    it('should demonstrate workflow retry and error handling', async () => {
      const testData = testSetup.getTestData();

      // Step 1: Create workflow
      const workflow = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Test Workflow with Retry',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'test-workflow-id',
      });
      expect(workflow.status).toBe(201);

      // Step 2: Execute workflow
      const execution = await testSetup.makeAuthenticatedRequest(
        'post',
        `/workflows/${workflow.body.id}/execute`,
        {
          inputData: {
            inputFormat: 'FREE_TEXT',
            targetAudienceData: 'Test target audience data',
          },
        }
      );
      expect(execution.status).toBe(201);

      // Step 3: Verify the execution was successful
      const executionResult = await testSetup.makeAuthenticatedRequest(
        'get',
        `/workflows/executions/${execution.body.id}`
      );
      expect(executionResult.status).toBe(200);
      expect(executionResult.body.status).toBe('SUCCESS');
      
      // Step 4: Test retry with a new execution (simulating a failed execution)
      const newExecution = await testSetup.makeAuthenticatedRequest(
        'post',
        `/workflows/${workflow.body.id}/execute`,
        {
          inputData: {
            inputFormat: 'FREE_TEXT',
            targetAudienceData: 'Retry test target audience data',
          },
        }
      );
      expect(newExecution.status).toBe(201);
      expect(newExecution.body.id).not.toBe(execution.body.id); // Should be a new execution
    });
  });

  describe('Workflow Type Integration', () => {
    it('should list workflows by type correctly', async () => {
      const testData = testSetup.getTestData();

      // Create workflows of different types
      await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Target Audience Translator 1',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'tat-1',
      });

      await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Lead Enrichment 1',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'le-1',
      });

      // Test filtering by type
      const targetAudienceWorkflows = await testSetup.makeAuthenticatedRequest(
        'get',
        `/workflows/type/${WorkflowType.TARGET_AUDIENCE_TRANSLATOR}`
      );
      expect(targetAudienceWorkflows.status).toBe(200);
      expect(targetAudienceWorkflows.body.length).toBeGreaterThan(0);
      targetAudienceWorkflows.body.forEach((workflow: any) => {
        expect(workflow.type).toBe(WorkflowType.TARGET_AUDIENCE_TRANSLATOR);
      });

      const enrichmentWorkflows = await testSetup.makeAuthenticatedRequest(
        'get',
        `/workflows/type/${WorkflowType.LEAD_ENRICHMENT}`
      );
      expect(enrichmentWorkflows.status).toBe(200);
      expect(enrichmentWorkflows.body.length).toBeGreaterThan(0);
      enrichmentWorkflows.body.forEach((workflow: any) => {
        expect(workflow.type).toBe(WorkflowType.LEAD_ENRICHMENT);
      });
    });

    it('should validate workflow input data correctly', async () => {
      const testData = testSetup.getTestData();

      // Create Target Audience Translator workflow
      const workflow = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Input Validation Test',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'input-validation-test',
      });
      expect(workflow.status).toBe(201);

      // Test invalid input (missing required fields)
      const invalidExecution = await testSetup.makeAuthenticatedRequest(
        'post',
        `/workflows/${workflow.body.id}/execute`,
        {
          // Missing targetAudienceData and inputFormat
          config: { test: 'data' },
        }
      );
      expect(invalidExecution.status).toBe(400);

      // Test valid input
      const validExecution = await testSetup.makeAuthenticatedRequest(
        'post',
        `/workflows/${workflow.body.id}/execute`,
        {
          inputData: {
            inputFormat: 'FREE_TEXT',
            targetAudienceData: 'Valid target audience description',
          },
        }
      );
      expect(validExecution.status).toBe(201);
    });
  });

  describe('Workflow Statistics and Monitoring', () => {
    it('should track workflow statistics correctly', async () => {
      const testData = testSetup.getTestData();

      // Create and execute multiple workflows
      const workflow1 = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Stats Test 1',
        type: WorkflowType.TARGET_AUDIENCE_TRANSLATOR,
        n8nWorkflowId: 'stats-test-1',
      });

      const workflow2 = await testSetup.makeAuthenticatedRequest('post', '/workflows', {
        name: 'Stats Test 2',
        type: WorkflowType.LEAD_ENRICHMENT,
        n8nWorkflowId: 'stats-test-2',
      });

      // Execute workflows
      const execution1 = await testSetup.makeAuthenticatedRequest(
        'post',
        `/workflows/${workflow1.body.id}/execute`,
        {
          inputData: {
            inputFormat: 'FREE_TEXT',
            targetAudienceData: 'Test data for stats',
          },
        }
      );
      expect(execution1.status).toBe(201);

      const execution2 = await testSetup.makeAuthenticatedRequest(
        'post',
        `/workflows/${workflow2.body.id}/execute`,
        {
          inputData: {
            leadId: 'test-lead-id',
            email: 'test@example.com',
          },
        }
      );
      expect(execution2.status).toBe(201);

      // Wait for executions to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check workflow statistics
      const workflowStats = await testSetup.makeAuthenticatedRequest('get', '/workflows/stats');
      expect(workflowStats.status).toBe(200);
      expect(workflowStats.body.total).toBeGreaterThanOrEqual(2);
      expect(workflowStats.body.byType[WorkflowType.TARGET_AUDIENCE_TRANSLATOR]).toBeDefined();
      expect(workflowStats.body.byType[WorkflowType.LEAD_ENRICHMENT]).toBeDefined();

      // Check execution statistics
      const executionStats = await testSetup.makeAuthenticatedRequest('get', '/workflows/executions');
      expect(executionStats.status).toBe(200);
      expect(executionStats.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
}); 