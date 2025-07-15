import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { N8nService } from '../src/n8n/services/n8n.service';
import { N8nRepository } from '../src/n8n/repositories/n8n.repository';
import { AuditTrailService } from '../src/workflows/services/audit-trail.service';
import { N8nWebhookEventEntity } from '../src/n8n/entities/n8n-webhook-event.entity';
import { N8nWebhookEventMapper } from '../src/n8n/mappers/n8n-webhook-event.mapper';
import { $Enums } from '../generated/prisma';

describe('N8nService', () => {
  let service: N8nService;
  let n8nRepository: jest.Mocked<N8nRepository>;
  let auditTrailService: jest.Mocked<AuditTrailService>;

  const mockWebhookEvent = {
    id: 'webhook-123',
    source: $Enums.WebhookSource.N8N,
    payload: {
      workflowId: 'workflow-123',
      leadId: 'lead-123',
      companyId: 'company-123',
      status: 'SUCCESS',
      outputData: { test: 'data' },
    },
    companyId: 'company-123',
    receivedAt: new Date(),
  };

  beforeEach(async () => {
    const mockN8nRepository = {
      createWebhookEvent: jest.fn(),
      findWebhookEvents: jest.fn(),
      findWebhookEventsBySource: jest.fn(),
      createUsageMetric: jest.fn(),
      getUsageMetrics: jest.fn(),
      createSystemNotification: jest.fn(),
      findSystemNotifications: jest.fn(),
      markNotificationAsRead: jest.fn(),
      cleanupOldWebhookEvents: jest.fn(),
      cleanupOldUsageMetrics: jest.fn(),
    };

    const mockAuditTrailService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        N8nService,
        {
          provide: N8nRepository,
          useValue: mockN8nRepository,
        },
        {
          provide: AuditTrailService,
          useValue: mockAuditTrailService,
        },
      ],
    }).compile();

    service = module.get<N8nService>(N8nService);
    n8nRepository = module.get(N8nRepository);
    auditTrailService = module.get(AuditTrailService);

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logWebhookEvent', () => {
    it('should log webhook event successfully', async () => {
      const data = {
        source: $Enums.WebhookSource.N8N,
        payload: {
          workflowId: 'workflow-123',
          leadId: 'lead-123',
          companyId: 'company-123',
          status: 'SUCCESS',
        },
        companyId: 'company-123',
      };

      n8nRepository.createWebhookEvent.mockResolvedValue();
      n8nRepository.createUsageMetric.mockResolvedValue();
      auditTrailService.log.mockResolvedValue();

      await service.logWebhookEvent(data);

      expect(n8nRepository.createWebhookEvent).toHaveBeenCalledWith({
        source: data.source,
        payload: data.payload,
        companyId: data.companyId,
      });

      expect(n8nRepository.createUsageMetric).toHaveBeenCalledWith({
        metricName: 'webhook_n8n',
        count: 1,
        period: 'daily',
        companyId: data.companyId,
      });

      expect(auditTrailService.log).toHaveBeenCalledWith({
        entity: 'WebhookEvent',
        entityId: 'lead-123',
        action: 'WORKFLOW_SUCCESS',
        companyId: data.companyId,
        changes: {
          workflowId: 'workflow-123',
          workflowType: null,
          status: 'SUCCESS',
          hasOutputData: false,
          hasError: false,
        },
      });
    });

    it('should throw error for invalid payload', async () => {
      const data = {
        source: $Enums.WebhookSource.N8N,
        payload: {
          // Missing required fields
          companyId: 'company-123',
        },
        companyId: 'company-123',
      };

      await expect(service.logWebhookEvent(data)).rejects.toThrow('Invalid webhook payload structure');
    });

    it('should handle Smartlead webhook events', async () => {
      const data = {
        source: $Enums.WebhookSource.SMARTLEAD,
        payload: {
          leadId: 'lead-123',
          emailId: 'email-123',
          content: 'Test reply',
          companyId: 'company-123',
        },
        companyId: 'company-123',
      };

      n8nRepository.createWebhookEvent.mockResolvedValue();
      n8nRepository.createUsageMetric.mockResolvedValue();
      auditTrailService.log.mockResolvedValue();

      await service.logWebhookEvent(data);

      expect(auditTrailService.log).toHaveBeenCalledWith({
        entity: 'WebhookEvent',
        entityId: 'lead-123',
        action: 'REPLY_WEBHOOK_RECEIVED',
        companyId: data.companyId,
        changes: {
          replyId: undefined,
          hasContent: true,
        },
      });
    });
  });

  describe('getWebhookEvents', () => {
    it('should return webhook events with proper mapping', async () => {
      const mockPrismaEvents = [
        {
          id: 'webhook-1',
          source: $Enums.WebhookSource.N8N,
          payload: { test: 'data1' },
          companyId: 'company-123',
          receivedAt: new Date('2024-01-01'),
        },
        {
          id: 'webhook-2',
          source: $Enums.WebhookSource.SMARTLEAD,
          payload: { test: 'data2' },
          companyId: 'company-123',
          receivedAt: new Date('2024-01-02'),
        },
      ];

      n8nRepository.findWebhookEvents.mockResolvedValue(mockPrismaEvents);

      const result = await service.getWebhookEvents('company-123', 10);

      expect(n8nRepository.findWebhookEvents).toHaveBeenCalledWith('company-123', 10);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'webhook-1',
        source: $Enums.WebhookSource.N8N,
        workflowType: null,
        leadId: null,
        workflowId: null,
        status: null,
        companyId: 'company-123',
        receivedAt: expect.any(String),
      });
    });

    it('should use default limit when not specified', async () => {
      n8nRepository.findWebhookEvents.mockResolvedValue([]);

      await service.getWebhookEvents('company-123');

      expect(n8nRepository.findWebhookEvents).toHaveBeenCalledWith('company-123', 50);
    });
  });

  describe('getWebhookEventsBySource', () => {
    it('should return webhook events filtered by source', async () => {
      const mockPrismaEvents = [
        {
          id: 'webhook-1',
          source: $Enums.WebhookSource.N8N,
          payload: { test: 'data' },
          companyId: 'company-123',
          receivedAt: new Date(),
        },
      ];

      n8nRepository.findWebhookEventsBySource.mockResolvedValue(mockPrismaEvents);

      const result = await service.getWebhookEventsBySource(
        $Enums.WebhookSource.N8N,
        'company-123',
        20
      );

      expect(n8nRepository.findWebhookEventsBySource).toHaveBeenCalledWith(
        $Enums.WebhookSource.N8N,
        'company-123',
        20
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('createSystemNotification', () => {
    it('should create system notification with audit trail', async () => {
      const data = {
        message: 'Test notification',
        level: $Enums.SystemNotificationLevel.INFO,
        companyId: 'company-123',
      };

      n8nRepository.createSystemNotification.mockResolvedValue();
      auditTrailService.log.mockResolvedValue();

      await service.createSystemNotification(data);

      expect(n8nRepository.createSystemNotification).toHaveBeenCalledWith(data);
      expect(auditTrailService.log).toHaveBeenCalledWith({
        entity: 'SystemNotification',
        entityId: 'system',
        action: 'NOTIFICATION_CREATED',
        companyId: data.companyId,
        changes: {
          message: data.message,
          level: data.level,
        },
      });
    });
  });

  describe('getSystemNotifications', () => {
    it('should return system notifications', async () => {
      const mockNotifications = [
        {
          id: 'notification-1',
          message: 'Test notification',
          level: $Enums.SystemNotificationLevel.INFO,
          companyId: 'company-123',
          read: false,
          createdAt: new Date(),
        },
      ];

      n8nRepository.findSystemNotifications.mockResolvedValue(mockNotifications);

      const result = await service.getSystemNotifications('company-123', 15);

      expect(n8nRepository.findSystemNotifications).toHaveBeenCalledWith('company-123', 15);
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read with audit trail', async () => {
      const notificationId = 'notification-123';
      const companyId = 'company-123';

      n8nRepository.markNotificationAsRead.mockResolvedValue();
      auditTrailService.log.mockResolvedValue();

      await service.markNotificationAsRead(notificationId, companyId);

      expect(n8nRepository.markNotificationAsRead).toHaveBeenCalledWith(notificationId, companyId);
      expect(auditTrailService.log).toHaveBeenCalledWith({
        entity: 'SystemNotification',
        entityId: notificationId,
        action: 'NOTIFICATION_READ',
        companyId,
        changes: {
          read: true,
        },
      });
    });
  });

  describe('cleanupOldData', () => {
    it('should cleanup old data with audit trail', async () => {
      n8nRepository.cleanupOldWebhookEvents.mockResolvedValue(10);
      n8nRepository.cleanupOldUsageMetrics.mockResolvedValue(5);
      auditTrailService.log.mockResolvedValue();

      const result = await service.cleanupOldData();

      expect(n8nRepository.cleanupOldWebhookEvents).toHaveBeenCalledWith(30);
      expect(n8nRepository.cleanupOldUsageMetrics).toHaveBeenCalledWith(90);
      expect(result).toEqual({
        webhookEvents: 10,
        usageMetrics: 5,
      });

      expect(auditTrailService.log).toHaveBeenCalledWith({
        entity: 'System',
        entityId: 'cleanup',
        action: 'N8N_DATA_CLEANUP',
        companyId: 'system',
        changes: {
          webhookEventsCleaned: 10,
          usageMetricsCleaned: 5,
          retentionDays: {
            WEBHOOK_EVENTS: 30,
            USAGE_METRICS: 90,
            SYSTEM_NOTIFICATIONS: 60,
          },
        },
      });
    });
  });

  describe('getDashboardData', () => {
    it('should return dashboard data', async () => {
      const mockWebhooks = [{ id: 'webhook-1' }];
      const mockNotifications = [{ id: 'notification-1' }];
      const mockMetrics = [{ id: 'metric-1' }];

      jest.spyOn(service, 'getWebhookEvents').mockResolvedValue(mockWebhooks);
      jest.spyOn(service, 'getSystemNotifications').mockResolvedValue(mockNotifications);
      jest.spyOn(service, 'getUsageMetrics').mockResolvedValue(mockMetrics);

      const result = await service.getDashboardData('company-123');

      expect(result).toEqual({
        recentWebhooks: mockWebhooks,
        recentNotifications: mockNotifications,
        usageMetrics: mockMetrics,
      });

      expect(service.getWebhookEvents).toHaveBeenCalledWith('company-123', 10);
      expect(service.getSystemNotifications).toHaveBeenCalledWith('company-123', 10);
      expect(service.getUsageMetrics).toHaveBeenCalledWith('company-123', 'daily');
    });
  });

  describe('handleWebhookError', () => {
    it('should handle webhook errors with notification and audit trail', async () => {
      const error = new Error('Test error');
      const source = $Enums.WebhookSource.N8N;
      const companyId = 'company-123';
      const payload = { test: 'data' };

      jest.spyOn(service, 'createSystemNotification').mockResolvedValue();
      auditTrailService.log.mockResolvedValue();

      await service.handleWebhookError(source, companyId, error, payload);

      expect(service.createSystemNotification).toHaveBeenCalledWith({
        message: 'Webhook processing error from N8N: Test error',
        level: $Enums.SystemNotificationLevel.ERROR,
        companyId,
      });

      expect(auditTrailService.log).toHaveBeenCalledWith({
        entity: 'WebhookEvent',
        entityId: 'system',
        action: 'WEBHOOK_PROCESSING_ERROR',
        companyId,
        changes: {
          source,
          error: 'Test error',
          payload: JSON.stringify(payload),
        },
      });
    });

    it('should handle webhook errors without payload', async () => {
      const error = new Error('Test error');
      const source = $Enums.WebhookSource.SMARTLEAD;
      const companyId = 'company-123';

      jest.spyOn(service, 'createSystemNotification').mockResolvedValue();
      auditTrailService.log.mockResolvedValue();

      await service.handleWebhookError(source, companyId, error);

      expect(auditTrailService.log).toHaveBeenCalledWith({
        entity: 'WebhookEvent',
        entityId: 'system',
        action: 'WEBHOOK_PROCESSING_ERROR',
        companyId,
        changes: {
          source,
          error: 'Test error',
          payload: null,
        },
      });
    });
  });
});

describe('N8nWebhookEventEntity', () => {
  let entity: N8nWebhookEventEntity;

  beforeEach(() => {
    entity = new N8nWebhookEventEntity(
      'webhook-123',
      $Enums.WebhookSource.N8N,
      {
        workflowId: 'workflow-123',
        leadId: 'lead-123',
        companyId: 'company-123',
        status: 'SUCCESS',
        outputData: { test: 'data' },
      },
      'company-123',
      new Date()
    );
  });

  describe('getWorkflowType', () => {
    it('should return workflow type from payload', () => {
      expect(entity.getWorkflowType()).toBeNull();

      const entityWithType = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        {
          workflowType: 'LEAD_ENRICHMENT',
          workflowId: 'workflow-123',
          leadId: 'lead-123',
          companyId: 'company-123',
        },
        'company-123',
        new Date()
      );

      expect(entityWithType.getWorkflowType()).toBe('LEAD_ENRICHMENT');
    });
  });

  describe('getLeadId', () => {
    it('should return lead ID from payload', () => {
      expect(entity.getLeadId()).toBe('lead-123');
    });
  });

  describe('getWorkflowId', () => {
    it('should return workflow ID from payload', () => {
      expect(entity.getWorkflowId()).toBe('workflow-123');
    });
  });

  describe('isWorkflowCompletion', () => {
    it('should return true for workflow completion webhooks', () => {
      expect(entity.isWorkflowCompletion()).toBe(true);

      const nonCompletionEntity = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        {
          leadId: 'lead-123',
          companyId: 'company-123',
          // No status field
        },
        'company-123',
        new Date()
      );

      expect(nonCompletionEntity.isWorkflowCompletion()).toBe(false);
    });
  });

  describe('isReplyHandling', () => {
    it('should return true for reply handling webhooks', () => {
      expect(entity.isReplyHandling()).toBe(false);

      const replyEntity = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        {
          leadId: 'lead-123',
          companyId: 'company-123',
          replyId: 'reply-123',
          replyContent: 'Test reply',
        },
        'company-123',
        new Date()
      );

      expect(replyEntity.isReplyHandling()).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return status from payload', () => {
      expect(entity.getStatus()).toBe('SUCCESS');
    });
  });

  describe('getErrorMessage', () => {
    it('should return error message from payload', () => {
      expect(entity.getErrorMessage()).toBeNull();

      const errorEntity = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        {
          workflowId: 'workflow-123',
          leadId: 'lead-123',
          companyId: 'company-123',
          status: 'FAILED',
          errorMessage: 'Test error',
        },
        'company-123',
        new Date()
      );

      expect(errorEntity.getErrorMessage()).toBe('Test error');
    });
  });

  describe('getOutputData', () => {
    it('should return output data from payload', () => {
      expect(entity.getOutputData()).toEqual({ test: 'data' });
    });
  });

  describe('validatePayload', () => {
    it('should validate workflow completion payload', () => {
      expect(entity.validatePayload()).toBe(true);

      const invalidEntity = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        {
          // Missing required fields
          companyId: 'company-123',
        },
        'company-123',
        new Date()
      );

      expect(invalidEntity.validatePayload()).toBe(false);
    });

    it('should validate reply handling payload', () => {
      const replyEntity = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        {
          leadId: 'lead-123',
          companyId: 'company-123',
          replyId: 'reply-123',
        },
        'company-123',
        new Date()
      );

      expect(replyEntity.validatePayload()).toBe(true);
    });
  });

  describe('getAuditTrailData', () => {
    it('should return audit trail data for workflow completion', () => {
      const auditData = entity.getAuditTrailData();

      expect(auditData.action).toBe('WORKFLOW_SUCCESS');
      expect(auditData.details).toEqual({
        workflowId: 'workflow-123',
        workflowType: null,
        status: 'SUCCESS',
        hasOutputData: true,
        hasError: false,
      });
    });

    it('should return audit trail data for reply handling', () => {
      const replyEntity = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        {
          leadId: 'lead-123',
          companyId: 'company-123',
          replyId: 'reply-123',
          content: 'Test reply',
        },
        'company-123',
        new Date()
      );

      const auditData = replyEntity.getAuditTrailData();

      expect(auditData.action).toBe('REPLY_WEBHOOK_RECEIVED');
      expect(auditData.details).toEqual({
        replyId: 'reply-123',
        hasContent: true,
      });
    });

    it('should return audit trail data for general webhook', () => {
      const generalEntity = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.SMARTLEAD,
        {
          leadId: 'lead-123',
          companyId: 'company-123',
        },
        'company-123',
        new Date()
      );

      const auditData = generalEntity.getAuditTrailData();

      expect(auditData.action).toBe('WEBHOOK_RECEIVED');
      expect(auditData.details).toEqual({
        source: $Enums.WebhookSource.SMARTLEAD,
        workflowType: null,
      });
    });
  });
});

describe('N8nWebhookEventMapper', () => {
  const mockPrismaEvent = {
    id: 'webhook-123',
    source: $Enums.WebhookSource.N8N,
    payload: {
      workflowId: 'workflow-123',
      leadId: 'lead-123',
      companyId: 'company-123',
      status: 'SUCCESS',
    },
    companyId: 'company-123',
    receivedAt: new Date('2024-01-01T12:00:00Z'),
  };

  describe('toEntity', () => {
    it('should map Prisma event to entity', () => {
      const entity = N8nWebhookEventMapper.toEntity(mockPrismaEvent);

      expect(entity).toBeInstanceOf(N8nWebhookEventEntity);
      expect(entity.id).toBe('webhook-123');
      expect(entity.source).toBe($Enums.WebhookSource.N8N);
      expect(entity.payload).toEqual(mockPrismaEvent.payload);
      expect(entity.companyId).toBe('company-123');
      expect(entity.receivedAt).toEqual(mockPrismaEvent.receivedAt);
    });
  });

  describe('toPrismaCreate', () => {
    it('should map entity to Prisma create data', () => {
      const entity = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        mockPrismaEvent.payload,
        'company-123',
        new Date()
      );

      const prismaData = N8nWebhookEventMapper.toPrismaCreate(entity);

      expect(prismaData).toEqual({
        source: $Enums.WebhookSource.N8N,
        payload: mockPrismaEvent.payload,
        companyId: 'company-123',
      });
    });
  });

  describe('toEntities', () => {
    it('should map multiple Prisma events to entities', () => {
      const prismaEvents = [mockPrismaEvent, { ...mockPrismaEvent, id: 'webhook-456' }];

      const entities = N8nWebhookEventMapper.toEntities(prismaEvents);

      expect(entities).toHaveLength(2);
      expect(entities[0]).toBeInstanceOf(N8nWebhookEventEntity);
      expect(entities[1]).toBeInstanceOf(N8nWebhookEventEntity);
      expect(entities[0].id).toBe('webhook-123');
      expect(entities[1].id).toBe('webhook-456');
    });
  });

  describe('toResponseDto', () => {
    it('should map entity to response DTO', () => {
      const entity = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        {
          workflowId: 'workflow-123',
          leadId: 'lead-123',
          companyId: 'company-123',
          status: 'SUCCESS',
          workflowType: 'LEAD_ENRICHMENT',
        },
        'company-123',
        new Date('2024-01-01T12:00:00Z')
      );

      const responseDto = N8nWebhookEventMapper.toResponseDto(entity);

      expect(responseDto).toEqual({
        id: 'webhook-123',
        source: $Enums.WebhookSource.N8N,
        workflowType: 'LEAD_ENRICHMENT',
        leadId: 'lead-123',
        workflowId: 'workflow-123',
        status: 'SUCCESS',
        companyId: 'company-123',
        receivedAt: '2024-01-01T12:00:00.000Z',
      });
    });
  });

  describe('toResponseDtos', () => {
    it('should map multiple entities to response DTOs', () => {
      const entity1 = new N8nWebhookEventEntity(
        'webhook-123',
        $Enums.WebhookSource.N8N,
        { workflowId: 'workflow-123', leadId: 'lead-123', companyId: 'company-123' },
        'company-123',
        new Date()
      );

      const entity2 = new N8nWebhookEventEntity(
        'webhook-456',
        $Enums.WebhookSource.SMARTLEAD,
        { leadId: 'lead-456', companyId: 'company-123' },
        'company-123',
        new Date()
      );

      const responseDtos = N8nWebhookEventMapper.toResponseDtos([entity1, entity2]);

      expect(responseDtos).toHaveLength(2);
      expect(responseDtos[0].id).toBe('webhook-123');
      expect(responseDtos[1].id).toBe('webhook-456');
    });
  });
}); 