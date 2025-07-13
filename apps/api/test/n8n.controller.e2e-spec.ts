import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { N8nController } from '../src/n8n/n8n.controller';
import { N8nService } from '../src/n8n/services/n8n.service';
import { LeadRepository } from '../src/leads/repositories/lead.repository';
import { ReplyRepository } from '../src/replies/repositories/reply.repository';
import { BookingRepository } from '../src/replies/repositories/booking.repository';
import { LeadEventsService } from '../src/leads/services/lead-events.service';
import { WorkflowExecutionService } from '../src/workflows/services/workflow-execution.service';
import { WorkflowEventsService } from '../src/workflows/services/workflow-events.service';
import { LeadEntity } from '../src/leads/entities/lead.entity';
import { ReplyEntity } from '../src/replies/entities/reply.entity';
import { WorkflowExecutionEntity } from '../src/workflows/entities/workflow-execution.entity';
import { LeadStatus } from '../src/leads/constants/lead.constants';
import { WorkflowExecutionStatus } from '../src/workflows/constants/workflow.constants';
import { ReplyClassification, ReplySource, BookingStatus } from '../src/replies/constants/reply.constants';
import { $Enums } from '../generated/prisma';

describe('N8nController', () => {
  let app: INestApplication;
  let n8nService: jest.Mocked<N8nService>;
  let workflowEventsService: jest.Mocked<WorkflowEventsService>;
  let replyRepository: jest.Mocked<ReplyRepository>;
  let bookingRepository: jest.Mocked<BookingRepository>;
  let leadRepository: jest.Mocked<LeadRepository>;
  let leadEventsService: jest.Mocked<LeadEventsService>;
  let workflowExecutionService: jest.Mocked<WorkflowExecutionService>;

  const mockWebhookEvent = {
    id: 'webhook-123',
    source: $Enums.WebhookSource.N8N,
    workflowType: 'LEAD_ENRICHMENT',
    leadId: 'lead-123',
    workflowId: 'workflow-123',
    status: 'SUCCESS',
    companyId: 'company-123',
    receivedAt: '2024-01-01T12:00:00.000Z',
  };

  beforeEach(async () => {
    const mockN8nService = {
      logWebhookEvent: jest.fn(),
      getWebhookEvents: jest.fn(),
      getWebhookEventsBySource: jest.fn(),
      createSystemNotification: jest.fn(),
      getSystemNotifications: jest.fn(),
      markNotificationAsRead: jest.fn(),
      cleanupOldData: jest.fn(),
      getDashboardData: jest.fn(),
      handleWebhookError: jest.fn(),
      getNotifications: jest.fn(),
    };

    const mockWorkflowEventsService = {
      handleExecutionWebhook: jest.fn(),
      triggerWorkflowExecution: jest.fn(),
      handleSuccessfulExecution: jest.fn(),
      handleFailedExecution: jest.fn(),
      logExecution: jest.fn(),
    };

    const mockReplyRepository = {
      findEmailLogByLeadAndEmailId: jest.fn(),
      createFromWebhook: jest.fn(),
      updateClassification: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const mockBookingRepository = {
      create: jest.fn(),
      updateStatus: jest.fn(),
      findOne: jest.fn(),
      createFromWebhook: jest.fn(),
      updateLeadStatus: jest.fn(),
    };

    const mockLeadRepository = {
      findOne: jest.fn(),
      updateEnrichmentData: jest.fn(),
      createAuditTrail: jest.fn(),
    };

    const mockLeadEventsService = {
      handleWorkflowCompletion: jest.fn(),
      triggerLinkedInScraping: jest.fn(),
      triggerEnrichment: jest.fn(),
      triggerEmailDrafting: jest.fn(),
      triggerEmailDraftingWorkflow: jest.fn(),
    };

    const mockWorkflowExecutionService = {
      createExecutionRecord: jest.fn(),
      findByWorkflowLeadAndCompany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [N8nController],
      providers: [
        {
          provide: N8nService,
          useValue: mockN8nService,
        },
        {
          provide: WorkflowEventsService,
          useValue: mockWorkflowEventsService,
        },
        {
          provide: ReplyRepository,
          useValue: mockReplyRepository,
        },
        {
          provide: BookingRepository,
          useValue: mockBookingRepository,
        },
        {
          provide: LeadRepository,
          useValue: mockLeadRepository,
        },
        {
          provide: LeadEventsService,
          useValue: mockLeadEventsService,
        },
        {
          provide: WorkflowExecutionService,
          useValue: mockWorkflowExecutionService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    n8nService = module.get(N8nService);
    workflowEventsService = module.get(WorkflowEventsService);
    replyRepository = module.get(ReplyRepository);
    bookingRepository = module.get(BookingRepository);
    leadRepository = module.get(LeadRepository);
    leadEventsService = module.get(LeadEventsService);
    workflowExecutionService = module.get(WorkflowExecutionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /n8n/complete', () => {
    it('should handle workflow completion successfully', async () => {
      const payload = {
        workflowId: 'workflow-123',
        leadId: 'lead-123',
        companyId: 'company-123',
        status: 'SUCCESS',
        outputData: { test: 'data' },
        workflowName: 'Test Workflow',
      };

      const mockExecution = new WorkflowExecutionEntity(
        'execution-123',
        WorkflowExecutionStatus.RUNNING,
        'system',
        new Date(),
        null,
        { test: 'input' },
        null,
        null,
        'lead-123',
        'workflow-123',
        'company-123'
      );

      workflowExecutionService.findByWorkflowLeadAndCompany.mockResolvedValue(mockExecution);
      workflowEventsService.handleExecutionWebhook.mockResolvedValue();
      leadEventsService.handleWorkflowCompletion.mockResolvedValue();
      n8nService.logWebhookEvent.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body).toEqual({ success: true });

      expect(workflowExecutionService.findByWorkflowLeadAndCompany).toHaveBeenCalledWith(
        payload.workflowId,
        payload.leadId,
        payload.companyId
      );

      expect(workflowEventsService.handleExecutionWebhook).toHaveBeenCalledWith(
        mockExecution.id,
        'SUCCESS',
        payload.outputData,
        undefined
      );

      expect(n8nService.logWebhookEvent).toHaveBeenCalledWith({
        source: $Enums.WebhookSource.N8N,
        payload,
        companyId: payload.companyId,
      });
    });

    it('should handle workflow failure', async () => {
      const payload = {
        workflowId: 'workflow-123',
        leadId: 'lead-123',
        companyId: 'company-123',
        status: 'FAILED',
        errorMessage: 'Test error',
        workflowName: 'Test Workflow',
      };

      const mockExecution = new WorkflowExecutionEntity(
        'execution-123',
        WorkflowExecutionStatus.RUNNING,
        'system',
        new Date(),
        null,
        { test: 'input' },
        null,
        null,
        'lead-123',
        'workflow-123',
        'company-123'
      );

      workflowExecutionService.findByWorkflowLeadAndCompany.mockResolvedValue(mockExecution);
      workflowEventsService.handleExecutionWebhook.mockResolvedValue();
      n8nService.logWebhookEvent.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      expect(workflowEventsService.handleExecutionWebhook).toHaveBeenCalledWith(
        mockExecution.id,
        'FAILED',
        undefined,
        payload.errorMessage
      );
    });

    it('should return 400 for invalid payload', async () => {
      const invalidPayload = {
        workflowId: 'workflow-123',
        // Missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', 'test-api-key')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.message).toEqual(expect.arrayContaining([
        'leadId must be a string',
        'companyId must be a string',
        'status must be one of the following values: SUCCESS, FAILED, TIMEOUT'
      ]));
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        workflowId: 'workflow-123',
        leadId: 'lead-123',
        companyId: 'company-123',
        status: 'SUCCESS',
        outputData: { test: 'data' },
      };

      workflowExecutionService.findByWorkflowLeadAndCompany.mockRejectedValue(
        new Error('Service error')
      );
      n8nService.handleWebhookError.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/complete')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Failed to process workflow completion');

      expect(n8nService.handleWebhookError).toHaveBeenCalledWith(
        $Enums.WebhookSource.N8N,
        payload.companyId,
        expect.any(Error),
        payload
      );
    });
  });

  describe('POST /n8n/enrichment/complete', () => {
    it('should handle enrichment completion successfully', async () => {
      const payload = {
        leadId: 'lead-123',
        companyId: 'company-123',
        status: 'SUCCESS',
        enrichedData: {
          company: 'Test Company',
          jobTitle: 'Senior Developer',
          industry: 'Technology',
        },
      };

      const mockLead = new LeadEntity(
        'lead-123',
        'John Doe',
        'john@example.com',
        null,
        null,
        false,
        LeadStatus.NEW,
        'company-123',
        'campaign-123',
        new Date(),
        new Date()
      );

      leadRepository.findOne.mockResolvedValue(mockLead);
      leadRepository.updateEnrichmentData.mockResolvedValue(mockLead);
      leadEventsService.triggerEmailDraftingWorkflow.mockResolvedValue();
      n8nService.logWebhookEvent.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/enrichment/complete')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      expect(leadRepository.updateEnrichmentData).toHaveBeenCalledWith(
        payload.leadId,
        payload.companyId,
        {
          ...payload.enrichedData,
          lastEnrichedAt: expect.any(String),
        }
      );

      expect(n8nService.logWebhookEvent).toHaveBeenCalledWith({
        source: $Enums.WebhookSource.N8N,
        payload,
        companyId: payload.companyId,
      });
    });

    it('should handle enrichment failure', async () => {
      const payload = {
        leadId: 'lead-123',
        companyId: 'company-123',
        status: 'FAILED',
        errorMessage: 'Enrichment failed',
      };

      const mockLead = new LeadEntity(
        'lead-123',
        'John Doe',
        'john@example.com',
        null,
        null,
        false,
        LeadStatus.NEW,
        'company-123',
        'campaign-123',
        new Date(),
        new Date()
      );

      leadRepository.findOne.mockResolvedValue(mockLead);
      n8nService.logWebhookEvent.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/enrichment/complete')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 400 for non-existent lead', async () => {
      const payload = {
        leadId: 'non-existent-lead',
        companyId: 'company-123',
        status: 'SUCCESS',
        enrichedData: { test: 'data' },
      };

      leadRepository.findOne.mockRejectedValue(new Error('Lead not found'));
      n8nService.handleWebhookError.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/enrichment/complete')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Failed to process enrichment completion');
    });
  });

  describe('POST /n8n/log', () => {
    it('should handle workflow log entries', async () => {
      const payload = {
        leadId: 'lead-123',
        companyId: 'company-123',
        nodeName: 'Test Node',
        outputData: { test: 'data' },
        timestamp: new Date().toISOString(),
      };

      n8nService.logWebhookEvent.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/log')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      expect(n8nService.logWebhookEvent).toHaveBeenCalledWith({
        source: $Enums.WebhookSource.N8N,
        payload,
        companyId: payload.companyId,
      });
    });

    it('should return 400 for invalid payload', async () => {
      const payload = {
        // Missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/n8n/log')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(expect.arrayContaining([
        'leadId must be a string',
        'companyId must be a string',
        'nodeName must be a string',
        'outputData must be an object',
        'timestamp must be a valid ISO 8601 date string'
      ]));
    });
  });

  describe('POST /n8n/smartlead/reply', () => {
    it('should handle Smartlead reply webhooks', async () => {
      const payload = {
        leadId: 'lead-123',
        emailId: 'email-123',
        content: 'Test reply content',
        companyId: 'company-123',
      };

      const mockLead = new LeadEntity(
        'lead-123',
        'John Doe',
        'john@example.com',
        null,
        null,
        false,
        LeadStatus.NEW,
        'company-123',
        'campaign-123',
        new Date(),
        new Date()
      );

      const mockEmailLog = {
        id: 'email-log-123',
        leadId: 'lead-123',
        emailId: 'email-123',
        companyId: 'company-123',
      };

      const mockReply = new ReplyEntity(
        'reply-123',
        payload.content,
        ReplyClassification.QUESTION,
        'lead-123',
        'email-log-123',
        'company-123',
        null,
        ReplySource.SMARTLEAD,
        null,
        new Date(),
        new Date()
      );

      leadRepository.findOne.mockResolvedValue(mockLead);
      replyRepository.findEmailLogByLeadAndEmailId.mockResolvedValue(mockEmailLog);
      replyRepository.createFromWebhook.mockResolvedValue(mockReply);
      n8nService.logWebhookEvent.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/smartlead/reply')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      expect(replyRepository.createFromWebhook).toHaveBeenCalledWith({
        leadId: payload.leadId,
        emailLogId: mockEmailLog.id,
        companyId: payload.companyId,
        content: payload.content,
        classification: ReplyClassification.QUESTION,
        handledBy: undefined,
      });

      expect(n8nService.logWebhookEvent).toHaveBeenCalledWith({
        source: $Enums.WebhookSource.SMARTLEAD,
        payload,
        companyId: payload.companyId,
      });
    });

    it('should return 400 for non-existent lead', async () => {
      const payload = {
        leadId: 'non-existent-lead',
        emailId: 'email-123',
        content: 'Test reply content',
        companyId: 'company-123',
      };

      leadRepository.findOne.mockRejectedValue(new Error('Lead not found'));
      n8nService.handleWebhookError.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/smartlead/reply')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to process Smartlead reply');
    });
  });

  describe('POST /n8n/reply/complete', () => {
    it('should handle reply handling completion successfully', async () => {
      const payload = {
        replyId: 'reply-123',
        leadId: 'lead-123',
        companyId: 'company-123',
        outputData: {
          replyClassification: 'POSITIVE',
          confidence: 0.95,
          summary: 'Test summary',
          nextAction: 'FOLLOW_UP',
        },
      };

      const mockReply = new ReplyEntity(
        'reply-123',
        'Test reply content',
        ReplyClassification.QUESTION,
        'lead-123',
        'email-log-123',
        'company-123',
        null,
        ReplySource.SMARTLEAD,
        null,
        new Date(),
        new Date()
      );

      replyRepository.findOne.mockResolvedValue(mockReply);
      replyRepository.updateClassification.mockResolvedValue(mockReply);
      n8nService.logWebhookEvent.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/reply/complete')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      expect(replyRepository.updateClassification).toHaveBeenCalledWith(
        payload.replyId,
        payload.companyId,
        payload.outputData.replyClassification,
        'AI'
      );

      expect(n8nService.logWebhookEvent).toHaveBeenCalledWith({
        source: $Enums.WebhookSource.N8N,
        payload,
        companyId: payload.companyId,
      });
    });

    it('should handle neutral reply classification', async () => {
      const payload = {
        replyId: 'reply-123',
        leadId: 'lead-123',
        companyId: 'company-123',
        outputData: {
          replyClassification: 'NEUTRAL',
          confidence: 0.75,
          summary: 'Neutral response',
          nextAction: 'NO_ACTION',
        },
      };

      const mockReply = new ReplyEntity(
        'reply-123',
        'Neutral reply content',
        ReplyClassification.QUESTION,
        'lead-123',
        'email-log-123',
        'company-123',
        null,
        ReplySource.SMARTLEAD,
        null,
        new Date(),
        new Date()
      );

      replyRepository.findOne.mockResolvedValue(mockReply);
      replyRepository.updateClassification.mockResolvedValue(mockReply);
      n8nService.logWebhookEvent.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/reply/complete')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 400 for non-existent reply', async () => {
      const payload = {
        replyId: 'non-existent-reply',
        leadId: 'lead-123',
        companyId: 'company-123',
        outputData: {
          replyClassification: 'POSITIVE',
        },
      };

      replyRepository.findOne.mockResolvedValue(null);
      n8nService.logWebhookEvent.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/n8n/reply/complete')
        .set('x-api-key', 'test-api-key')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Reply not found');
    });
  });

  describe('GET /n8n/webhooks', () => {
    it('should return webhook events', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          source: $Enums.WebhookSource.N8N,
          payload: { test: 'data' },
          companyId: 'company-123',
          createdAt: new Date().toISOString(),
        },
      ];

      n8nService.getWebhookEvents.mockResolvedValue(mockEvents);

      const response = await request(app.getHttpServer())
        .get('/n8n/webhooks')
        .query({ companyId: 'company-123', limit: '10' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockEvents,
        total: 1,
      });

      expect(n8nService.getWebhookEvents).toHaveBeenCalledWith('company-123', 10);
    });

    it('should use default limit when not specified', async () => {
      const mockEvents = [];

      n8nService.getWebhookEvents.mockResolvedValue(mockEvents);

      const response = await request(app.getHttpServer())
        .get('/n8n/webhooks')
        .query({ companyId: 'company-123' })
        .expect(200);

      expect(n8nService.getWebhookEvents).toHaveBeenCalledWith('company-123', 50);
    });

    it('should return 400 for missing companyId', async () => {
      const response = await request(app.getHttpServer())
        .get('/n8n/webhooks')
        .expect(400);

      expect(response.body.message).toBe('Company ID is required');
    });
  });

  describe('GET /n8n/webhooks/:source', () => {
    it('should return webhook events by source', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          source: $Enums.WebhookSource.N8N,
          payload: { test: 'data' },
          companyId: 'company-123',
          createdAt: new Date().toISOString(),
        },
      ];

      n8nService.getWebhookEventsBySource.mockResolvedValue(mockEvents);

      const response = await request(app.getHttpServer())
        .get('/n8n/webhooks/n8n')
        .query({ companyId: 'company-123', limit: '20' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockEvents,
        total: 1,
      });

      expect(n8nService.getWebhookEventsBySource).toHaveBeenCalledWith($Enums.WebhookSource.N8N, 'company-123', 20);
    });

    it('should return 400 for invalid source', async () => {
      const response = await request(app.getHttpServer())
        .get('/n8n/webhooks/invalid-source')
        .query({ companyId: 'company-123' })
        .expect(400);

      expect(response.body.message).toBe('Invalid webhook source');
    });
  });

  describe('GET /n8n/notifications', () => {
    it('should return system notifications', async () => {
      const mockNotifications = [
        {
          id: 'notification-1',
          type: 'SYSTEM',
          message: 'Test notification',
          companyId: 'company-123',
          createdAt: new Date().toISOString(),
        },
      ];

      n8nService.getSystemNotifications.mockResolvedValue(mockNotifications);

      const response = await request(app.getHttpServer())
        .get('/n8n/notifications')
        .query({ companyId: 'company-123', limit: '15' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockNotifications,
        total: 1,
      });

      expect(n8nService.getSystemNotifications).toHaveBeenCalledWith('company-123', 15);
    });

    it('should return 400 for missing companyId', async () => {
      const response = await request(app.getHttpServer())
        .get('/n8n/notifications')
        .expect(400);

      expect(response.body.message).toBe('Company ID is required');
    });
  });

  describe('PUT /n8n/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const notificationId = 'notification-123';
      const companyId = 'company-123';

      n8nService.markNotificationAsRead.mockResolvedValue();

      const response = await request(app.getHttpServer())
        .put(`/n8n/notifications/${notificationId}/read`)
        .query({ companyId })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Notification marked as read',
      });

      expect(n8nService.markNotificationAsRead).toHaveBeenCalledWith(notificationId, companyId);
    });

    it('should return 400 for missing companyId', async () => {
      const response = await request(app.getHttpServer())
        .put('/n8n/notifications/notification-123/read')
        .expect(400);

      expect(response.body.message).toBe('Company ID is required');
    });
  });

  describe('POST /n8n/cleanup', () => {
    it('should cleanup old data', async () => {
      const cleanupResult = {
        webhookEvents: 10,
        usageMetrics: 5,
      };

      n8nService.cleanupOldData.mockResolvedValue(cleanupResult);

      const response = await request(app.getHttpServer())
        .post('/n8n/cleanup')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: cleanupResult,
        message: 'Cleanup completed successfully',
      });

      expect(n8nService.cleanupOldData).toHaveBeenCalled();
    });
  });

  describe('GET /n8n/dashboard', () => {
    it('should return dashboard data', async () => {
      const dashboardData = {
        recentWebhooks: [],
        recentNotifications: [],
        usageMetrics: [],
      };

      n8nService.getDashboardData.mockResolvedValue(dashboardData);

      const response = await request(app.getHttpServer())
        .get('/n8n/dashboard')
        .query({ companyId: 'company-123' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: dashboardData,
      });

      expect(n8nService.getDashboardData).toHaveBeenCalledWith('company-123');
    });

    it('should return 400 for missing companyId', async () => {
      const response = await request(app.getHttpServer())
        .get('/n8n/dashboard')
        .expect(400);

      expect(response.body.message).toBe('Company ID is required');
    });
  });
}); 