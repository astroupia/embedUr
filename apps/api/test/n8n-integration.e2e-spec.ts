import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { $Enums } from '../generated/prisma';
import { TestSetup } from './helpers/test-setup';
import { UserRole } from '../src/constants/enums';
import { AuditTrailService } from '../src/workflows/services/audit-trail.service';

describe('N8n Module Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testSetup: TestSetup;
  let testCompany: any;
  let testLead: any;
  let testWorkflow: any;
  let testWorkflowExecution: any;
  let testReply: any;
  let testEmailLog: any;
  let apiKey: string;
  let testCampaign: any;
  let testAdmin: any;
  let systemUser: any;
  let smartleadEmailId: string;
  let smartleadReplyEmailId: string;
  let testEnrichmentRequest: any;

  beforeAll(async () => {
    // Set environment variables for testing
    process.env.ENRICHMENT_WEBHOOK_API_KEY = 'test-api-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    testSetup = new TestSetup(app, prisma);

    // Create test data
    const timestamp = Date.now();
    
    // Create test company
    testCompany = await prisma.company.create({
      data: {
        name: `Test Company for N8n Integration ${timestamp}`,
        schemaName: `test_n8n_integration_${timestamp}`,
        industry: 'Technology',
        employees: 10,
        status: $Enums.CompanyStatus.ACTIVE,
      },
    });

    // Create system user for audit trail logging (with unique ID)
    systemUser = await prisma.user.create({
      data: {
        id: `system-${timestamp}`, // Use unique ID to avoid constraint violations
        email: `system.${timestamp}@example.com`,
        firstName: 'System',
        lastName: 'User',
        password: 'system-password',
        companyId: testCompany.id,
        role: UserRole.ADMIN,
      },
    });

    // Set environment variable for audit trail service
    process.env.SYSTEM_USER_ID = systemUser.id;

    // Create test admin
    testAdmin = await prisma.user.create({
      data: {
        email: `test.admin.${timestamp}@example.com`,
        firstName: 'Test',
        lastName: 'Admin',
        password: 'test-password',
        companyId: testCompany.id,
        role: UserRole.SUPER_ADMIN,
      },
    });

    // Create test campaign
    testCampaign = await prisma.campaign.create({
      data: {
        name: `Test Campaign ${timestamp}`,
        description: 'Test campaign for n8n integration',
        status: $Enums.CampaignStatus.ACTIVE,
        companyId: testCompany.id,
      },
    });

    // Create test lead
    testLead = await prisma.lead.create({
      data: {
        fullName: 'Test Lead',
        email: `test.lead.${timestamp}@example.com`,
        status: $Enums.LeadStatus.NEW,
        companyId: testCompany.id,
        campaignId: testCampaign.id,
      },
    });

    // Create test workflow
    testWorkflow = await prisma.workflow.create({
      data: {
        name: 'Lead Enrichment Workflow',
        type: $Enums.WorkflowType.LEAD_ENRICHMENT,
        companyId: testCompany.id,
        n8nWorkflowId: 'enrichment-workflow-123',
      },
    });

    // Create Smartlead email log for reply test
    smartleadEmailId = `smartlead-email-${timestamp}`;
    testEmailLog = await prisma.emailLog.create({
      data: {
        id: smartleadEmailId,
        leadId: testLead.id,
        campaignId: testCampaign.id,
        companyId: testCompany.id,
        status: $Enums.EmailStatus.SENT,
        sentAt: new Date(),
      },
    });

    // Create a separate email log for Smartlead reply test
    smartleadReplyEmailId = `smartlead-reply-email-${timestamp}`;
    const smartleadEmailLog = await prisma.emailLog.create({
      data: {
        id: smartleadReplyEmailId,
        leadId: testLead.id,
        campaignId: testCampaign.id,
        companyId: testCompany.id,
        status: $Enums.EmailStatus.SENT,
        sentAt: new Date(),
      },
    });

    // Create test reply for reply completion test
    testReply = await prisma.reply.create({
      data: {
        leadId: testLead.id,
        emailLogId: testEmailLog.id,
        companyId: testCompany.id,
        content: 'I am interested in learning more',
        classification: $Enums.ReplyClassification.QUESTION,
        source: $Enums.ReplySource.SMARTLEAD,
      },
    });

    // Create test enrichment request for enrichment completion tests
    testEnrichmentRequest = await prisma.enrichmentRequest.create({
      data: {
        provider: $Enums.EnrichmentProvider.APOLLO,
        requestData: { email: testLead.email },
        status: 'PENDING',
        leadId: testLead.id,
        companyId: testCompany.id,
      },
    });

    // Set API key for testing
    apiKey = process.env.ENRICHMENT_WEBHOOK_API_KEY || 'test-api-key';
  });

  afterAll(async () => {
    await testSetup.cleanupTestData();
    await app.close();
  });

  afterEach(async () => {
    // Clean up webhook events and notifications after each test
    if (testCompany?.id) {
      await prisma.webhookEvent.deleteMany({
        where: { companyId: testCompany.id },
      });
      await prisma.systemNotification.deleteMany({
        where: { companyId: testCompany.id },
      });
      await prisma.usageMetric.deleteMany({
        where: { companyId: testCompany.id },
      });
      await prisma.workflowExecution.deleteMany({
        where: { companyId: testCompany.id },
      });
      await prisma.auditTrail.deleteMany({
        where: { companyId: testCompany.id },
      });
    }
  });

  describe('POST /n8n/complete', () => {
    it('should handle workflow completion successfully', async () => {
      // Create workflow execution for this test
      testWorkflowExecution = await prisma.workflowExecution.create({
        data: {
          workflowId: testWorkflow.id,
          leadId: testLead.id,
          companyId: testCompany.id,
          status: 'STARTED',
          triggeredBy: 'Test',
          startTime: new Date(),
          inputData: { test: 'data' },
        },
      });

      const payload = {
        workflowId: testWorkflow.id, // Use actual workflow ID, not n8n workflow ID
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'SUCCESS',
        outputData: {
          enrichedData: {
            company: 'Test Company',
            jobTitle: 'Senior Developer',
            industry: 'Technology',
          },
        },
        workflowName: 'Lead Enrichment Workflow',
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify workflow execution was updated
      const updatedExecution = await prisma.workflowExecution.findFirst({
        where: {
          workflowId: testWorkflow.id,
          leadId: testLead.id,
        },
      });

      expect(updatedExecution).toBeDefined();
      expect(updatedExecution?.status).toBe('SUCCESS');
      expect(updatedExecution?.outputData).toEqual(payload.outputData);

      // Verify webhook event was logged
      const webhookEvent = await prisma.webhookEvent.findFirst({
        where: {
          companyId: testCompany.id,
          source: $Enums.WebhookSource.N8N,
        },
      });

      expect(webhookEvent).toBeDefined();
      expect(webhookEvent?.payload).toEqual(payload);
    });

    it('should handle workflow failure', async () => {
      // Create workflow execution for this test
      testWorkflowExecution = await prisma.workflowExecution.create({
        data: {
          workflowId: testWorkflow.id,
          leadId: testLead.id,
          companyId: testCompany.id,
          status: 'STARTED',
          triggeredBy: 'Test',
          startTime: new Date(),
          inputData: { test: 'data' },
        },
      });

      const payload = {
        workflowId: testWorkflow.id, // Use actual workflow ID, not n8n workflow ID
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'FAILED',
        errorMessage: 'Enrichment service unavailable',
        workflowName: 'Lead Enrichment Workflow',
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify workflow execution was updated
      const updatedExecution = await prisma.workflowExecution.findFirst({
        where: {
          workflowId: testWorkflow.id,
          leadId: testLead.id,
        },
      });

      expect(updatedExecution?.status).toBe('FAILED');
      expect(updatedExecution?.outputData).toEqual({ error: payload.errorMessage });
    });

    it('should handle workflow timeout', async () => {
      // Create workflow execution for this test
      testWorkflowExecution = await prisma.workflowExecution.create({
        data: {
          workflowId: testWorkflow.id,
          leadId: testLead.id,
          companyId: testCompany.id,
          status: 'STARTED',
          triggeredBy: 'Test',
          startTime: new Date(),
          inputData: { test: 'data' },
        },
      });

      const payload = {
        workflowId: testWorkflow.id, // Use actual workflow ID, not n8n workflow ID
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'TIMEOUT',
        errorMessage: 'Workflow execution timed out',
        workflowName: 'Lead Enrichment Workflow',
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify workflow execution was updated
      const updatedExecution = await prisma.workflowExecution.findFirst({
        where: {
          workflowId: testWorkflow.id,
          leadId: testLead.id,
        },
      });

      expect(updatedExecution?.status).toBe('TIMEOUT');
    });

    it('should return 401 for invalid API key', async () => {
      const payload = {
        workflowId: testWorkflow.id, // Use actual workflow ID, not n8n workflow ID
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'SUCCESS',
        outputData: { test: 'data' },
      };

      await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', 'invalid-key')
        .send(payload)
        .expect(401);
    });

    it('should return 400 for invalid payload', async () => {
      const invalidPayload = {
        workflowId: testWorkflow.id, // Use actual workflow ID, not n8n workflow ID
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', apiKey)
        .send(invalidPayload)
        .expect(400);
    });
  });

  describe('POST /n8n/enrichment/complete', () => {
    it('should handle enrichment completion successfully', async () => {
      const payload = {
        workflowId: testWorkflow.id, // Add workflowId for validation
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'SUCCESS',
        enrichedData: {
          company: 'Enriched Company',
          jobTitle: 'Senior Developer',
          industry: 'Technology',
          companySize: '50-200',
          location: 'San Francisco, CA',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/enrichment/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify lead was updated with enriched data
      const updatedLead = await prisma.lead.findUnique({
        where: { id: testLead.id },
      });

      expect(updatedLead?.enrichmentData).toEqual({
        ...payload.enrichedData,
        lastEnrichedAt: expect.any(String),
      });

      // Verify audit trail was created
      const auditTrail = await prisma.auditTrail.findFirst({
        where: {
          entityId: testLead.id,
          action: 'Enrichment completed successfully',
        },
      });

      expect(auditTrail).toBeDefined();
      expect(auditTrail?.changes).toEqual(payload.enrichedData);
    });

    it('should handle enrichment failure', async () => {
      const payload = {
        workflowId: testWorkflow.id, // Add workflowId for validation
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'FAILED',
        errorMessage: 'Enrichment service unavailable',
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/enrichment/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify audit trail was created for failure
      const auditTrail = await prisma.auditTrail.findFirst({
        where: {
          entityId: testLead.id,
          action: 'Enrichment failed',
        },
      });

      expect(auditTrail).toBeDefined();
      expect(auditTrail?.changes).toEqual({ errorMessage: payload.errorMessage });
    });

    it('should return 400 for non-existent lead', async () => {
      const payload = {
        leadId: 'non-existent-lead-id',
        companyId: testCompany.id,
        status: 'SUCCESS',
        enrichedData: { test: 'data' },
      };

      await request(app.getHttpServer())
        .post('/n8n/enrichment/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(400);
    });
  });

  describe('POST /n8n/log', () => {
    it('should handle workflow log entries', async () => {
      // Create a fresh lead for this test
      const lead = await prisma.lead.create({
        data: {
          id: `test-lead-${Date.now()}`,
          companyId: testCompany.id,
          campaignId: testCampaign.id,
          email: `logtest${Date.now()}@example.com`,
          fullName: 'Log Test',
        },
      });
      const payload = {
        leadId: lead.id,
        companyId: testCompany.id,
        nodeName: 'Enrichment Node',
        message: 'Processing enrichment request',
        level: 'INFO',
        timestamp: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/log')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify audit trail was created
      const allAuditTrails = await prisma.auditTrail.findMany({
        where: { entityId: lead.id },
      });
      console.log('All audit trails for lead:', allAuditTrails);
      const auditTrail = await prisma.auditTrail.findFirst({
        where: {
          entityId: lead.id,
          action: 'Log from Enrichment Node',
        },
      });

      expect(auditTrail).toBeDefined();
      expect(auditTrail?.changes).toEqual(payload);
    });

    it('should return 400 for non-existent lead', async () => {
      const payload = {
        leadId: 'non-existent-lead-id',
        companyId: testCompany.id,
        nodeName: 'Test Node',
        outputData: { test: 'data' },
        timestamp: new Date().toISOString(),
      };

      await request(app.getHttpServer())
        .post('/n8n/log')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(400);
    });
  });

  describe('POST /n8n/replies', () => {
    it('should handle Smartlead reply webhooks', async () => {
      const payload = {
        leadId: testLead.id,
        emailId: smartleadReplyEmailId,
        content: 'I am interested in learning more about your services',
        companyId: testCompany.id,
        source: 'SMARTLEAD',
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/replies')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify reply was created
      const reply = await prisma.reply.findFirst({
        where: {
          leadId: testLead.id,
          content: payload.content,
        },
      });

      expect(reply).toBeDefined();
      expect(reply?.classification).toBe($Enums.ReplyClassification.QUESTION);
      expect(reply?.handledBy).toBeNull();

      // Verify webhook event was logged
      const webhookEvent = await prisma.webhookEvent.findFirst({
        where: {
          companyId: testCompany.id,
          source: $Enums.WebhookSource.SMARTLEAD,
        },
      });

      expect(webhookEvent).toBeDefined();
      expect(webhookEvent?.payload).toEqual(payload);
    });

    it('should return 400 for non-existent lead', async () => {
      const payload = {
        leadId: 'non-existent-lead-id',
        emailId: 'test-email-123',
        content: 'Test reply',
        companyId: testCompany.id,
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/replies')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to process Smartlead reply');
    });
  });

  describe('POST /n8n/replies/complete', () => {
    it('should handle reply handling completion successfully', async () => {
      // Create a fresh lead and reply for this test
      const lead = await prisma.lead.create({
        data: {
          id: `test-lead-reply-${Date.now()}`,
          companyId: testCompany.id,
          campaignId: testCampaign.id,
          email: `replytest${Date.now()}@example.com`,
          fullName: 'Reply Test',
        },
      });
      const emailLog = await prisma.emailLog.create({
        data: {
          id: `test-email-log-${Date.now()}`,
          leadId: lead.id,
          campaignId: testCampaign.id,
          companyId: testCompany.id,
          status: $Enums.EmailStatus.SENT,
          sentAt: new Date(),
        },
      });
      const reply = await prisma.reply.create({
        data: {
          leadId: lead.id,
          emailLogId: emailLog.id,
          companyId: testCompany.id,
          content: 'Initial reply',
          classification: $Enums.ReplyClassification.QUESTION,
        },
      });
      const payload = {
        replyId: reply.id,
        leadId: lead.id,
        companyId: testCompany.id,
        status: 'SUCCESS',
        outputData: {
          replyClassification: 'INTERESTED',
          meetingLink: 'https://calendly.com/meeting/123',
          nextAction: 'Schedule meeting',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/replies/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify reply was updated
      const updatedReply = await prisma.reply.findUnique({
        where: { id: reply.id },
      });

      expect(updatedReply?.classification).toBe($Enums.ReplyClassification.INTERESTED);
      expect(updatedReply?.handledBy).toBe('AI');

      // Verify booking was created
      const booking = await prisma.booking.findFirst({
        where: {
          leadId: lead.id,
          calendlyLink: payload.outputData.meetingLink,
        },
      });

      expect(booking).toBeDefined();
      expect(booking?.status).toBe($Enums.BookingStatus.BOOKED);

      // Verify lead status was updated
      const updatedLead = await prisma.lead.findUnique({
        where: { id: lead.id },
      });

      expect(updatedLead?.status).toBe($Enums.LeadStatus.BOOKED);

      // Verify system notification was created
      const notification = await prisma.systemNotification.findFirst({
        where: {
          companyId: testCompany.id,
          level: $Enums.SystemNotificationLevel.SUCCESS,
        },
      });

      expect(notification).toBeDefined();
      expect(notification?.message).toContain('Positive reply from lead');
      expect(notification?.message).toContain(payload.outputData.meetingLink);
    });

    it('should handle neutral reply classification', async () => {
      const payload = {
        leadId: testLead.id,
        replyId: testReply.id,
        companyId: testCompany.id,
        outputData: {
          replyClassification: $Enums.ReplyClassification.NEUTRAL,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/replies/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify reply was updated
      const updatedReply = await prisma.reply.findUnique({
        where: { id: testReply.id },
      });

      expect(updatedReply?.classification).toBe($Enums.ReplyClassification.NEUTRAL);
      expect(updatedReply?.handledBy).toBe('AI');

      // Verify no booking was created
      const booking = await prisma.booking.findFirst({
        where: { leadId: testLead.id },
      });

      expect(booking).toBeNull();
    });

    it('should return 400 for non-existent reply', async () => {
      const payload = {
        leadId: testLead.id,
        replyId: 'non-existent-reply-id',
        companyId: testCompany.id,
        outputData: {
          replyClassification: $Enums.ReplyClassification.INTERESTED,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/replies/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Reply not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle webhook processing errors gracefully', async () => {
      // Create a malformed payload that will cause validation to fail
      const malformedPayload = {
        // Missing required fields
        workflowId: testWorkflow.id,
        // Missing leadId and companyId
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', apiKey)
        .send(malformedPayload)
        .expect(400);

      expect(response.body.message).toBe('Failed to process workflow completion');

      // Verify error was logged
      const webhookEvent = await prisma.webhookEvent.findFirst({
        where: {
          companyId: testCompany.id,
          source: $Enums.WebhookSource.N8N,
        },
      });

      expect(webhookEvent).toBeDefined();
    });

    it('should handle missing environment variables gracefully', async () => {
      // Test with missing webhook configuration
      const originalWebhookUrl = process.env.N8N_REPLY_HANDLING_WEBHOOK;
      delete process.env.N8N_REPLY_HANDLING_WEBHOOK;

      // Create a unique email log for this test to avoid conflicts
      const uniqueEmailLogId = `smartlead-reply-email-missing-env-${Date.now()}`;
      await prisma.emailLog.create({
        data: {
          id: uniqueEmailLogId,
          leadId: testLead.id,
          campaignId: testCampaign.id,
          companyId: testCompany.id,
          status: $Enums.EmailStatus.SENT,
          sentAt: new Date(),
        },
      });

      const payload = {
        leadId: testLead.id,
        emailId: uniqueEmailLogId,
        content: 'Test reply',
        companyId: testCompany.id,
      };

      // This should not throw an error, just log a warning
      const response = await request(app.getHttpServer())
        .post('/n8n/replies')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Restore environment variable
      if (originalWebhookUrl) {
        process.env.N8N_REPLY_HANDLING_WEBHOOK = originalWebhookUrl;
      }
    });
  });

  describe('Webhook Event Logging', () => {
    it('should log all webhook events with proper metadata', async () => {
      const payload = {
        workflowId: testWorkflow.id, // Use actual workflow ID, not n8n workflow ID
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'SUCCESS',
        outputData: { test: 'data' },
      };

      await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      // Verify webhook event was logged with proper structure
      const webhookEvent = await prisma.webhookEvent.findFirst({
        where: {
          companyId: testCompany.id,
          source: $Enums.WebhookSource.N8N,
        },
      });

      expect(webhookEvent).toBeDefined();
      expect(webhookEvent?.source).toBe($Enums.WebhookSource.N8N);
      expect(webhookEvent?.companyId).toBe(testCompany.id);
      expect(webhookEvent?.payload).toEqual(payload);
      expect(webhookEvent?.receivedAt).toBeDefined();
    });

    it('should track usage metrics for webhook events', async () => {
      const payload = {
        workflowId: testWorkflow.id, // Use actual workflow ID, not n8n workflow ID
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'SUCCESS',
        outputData: { test: 'data' },
      };

      await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      // Verify usage metric was created
      const usageMetric = await prisma.usageMetric.findFirst({
        where: {
          companyId: testCompany.id,
          metricName: 'webhook_n8n',
        },
      });

      expect(usageMetric).toBeDefined();
      expect(usageMetric?.count).toBe(1);
      expect(usageMetric?.period).toBe('daily');
    });
  });

  describe('System Notifications', () => {
    it('should create system notifications for important events', async () => {
      const payload = {
        leadId: testLead.id,
        replyId: testReply.id,
        companyId: testCompany.id,
        outputData: {
          replyClassification: $Enums.ReplyClassification.INTERESTED,
          meetingLink: 'https://calendly.com/test/meeting',
        },
      };

      await request(app.getHttpServer())
        .post('/n8n/replies/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      // Verify system notification was created
      const notification = await prisma.systemNotification.findFirst({
        where: {
          companyId: testCompany.id,
          level: $Enums.SystemNotificationLevel.SUCCESS,
        },
      });

      expect(notification).toBeDefined();
      expect(notification?.message).toContain('Positive reply from lead');
      expect(notification?.message).toContain(payload.outputData.meetingLink);
      expect(notification?.read).toBe(false);
    });
  });

  describe('Workflow Execution Integration', () => {
    it('should find and update workflow executions correctly', async () => {
      // Create multiple workflow executions for testing
      const emailWorkflow = await prisma.workflow.create({
        data: {
          name: 'Email Sequence Workflow',
          type: $Enums.WorkflowType.EMAIL_SEQUENCE,
          companyId: testCompany.id,
          n8nWorkflowId: 'email-workflow-456',
        },
      });

      const emailExecution = await prisma.workflowExecution.create({
        data: {
          workflowId: emailWorkflow.id,
          leadId: testLead.id,
          companyId: testCompany.id,
          status: 'STARTED',
          triggeredBy: 'Test',
          startTime: new Date(),
          inputData: { emailData: 'test' },
        },
      });

      const payload = {
        workflowId: emailWorkflow.id, // Use actual workflow ID, not n8n workflow ID
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'SUCCESS',
        outputData: { emailSent: true, emailId: 'test-email-789' },
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify the correct workflow execution was updated
      const updatedExecution = await prisma.workflowExecution.findUnique({
        where: { id: emailExecution.id },
      });

      expect(updatedExecution?.status).toBe('SUCCESS');
      expect(updatedExecution?.outputData).toEqual(payload.outputData);
    });

    it('should handle workflow execution not found gracefully', async () => {
      const payload = {
        workflowId: 'non-existent-workflow-id',
        leadId: testLead.id,
        companyId: testCompany.id,
        status: 'SUCCESS',
        outputData: { test: 'data' },
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', apiKey)
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify webhook event was still logged
      const webhookEvent = await prisma.webhookEvent.findFirst({
        where: {
          companyId: testCompany.id,
          source: $Enums.WebhookSource.N8N,
        },
      });

      expect(webhookEvent).toBeDefined();
    });
  });
}); 