import { Injectable, Logger } from '@nestjs/common';
import { N8nRepository } from '../repositories/n8n.repository';
import { N8nWebhookEventEntity } from '../entities/n8n-webhook-event.entity';
import { N8nWebhookEventMapper } from '../mappers/n8n-webhook-event.mapper';
import { AuditTrailService } from '../../workflows/services/audit-trail.service';
import { N8N_CONSTANTS } from '../constants/n8n.constants';
import { $Enums } from '../../../generated/prisma';

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);

  constructor(
    private readonly n8nRepository: N8nRepository,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  /**
   * Log webhook event with audit trail integration
   */
  async logWebhookEvent(data: {
    source: $Enums.WebhookSource;
    payload: Record<string, any>;
    companyId: string;
  }): Promise<void> {
    // Create webhook event entity
    const webhookEvent = new N8nWebhookEventEntity(
      crypto.randomUUID(),
      data.source,
      data.payload,
      data.companyId,
      new Date(),
    );

    // Validate payload
    if (!webhookEvent.validatePayload()) {
      this.logger.warn(`Invalid webhook payload from ${data.source} for company ${data.companyId}`);
      this.logger.warn(`Payload validation failed for payload: ${JSON.stringify(data.payload)}`);
      throw new Error('Invalid webhook payload structure');
    }

    // Create webhook event record
    const createData = N8nWebhookEventMapper.toPrismaCreate(webhookEvent);
    await this.n8nRepository.createWebhookEvent(createData);

    // Create audit trail entry
    const auditData = webhookEvent.getAuditTrailData();
    await this.auditTrailService.log({
      entity: 'WebhookEvent',
      entityId: webhookEvent.getLeadId() || 'system',
      action: auditData.action,
      companyId: data.companyId,
      changes: auditData.details,
    });

    // Track usage metric
    await this.n8nRepository.createUsageMetric({
      metricName: `webhook_${data.source.toLowerCase()}`,
      count: 1,
      period: 'daily',
      companyId: data.companyId,
    });
  }

  /**
   * Get webhook events for company with proper entity mapping
   */
  async getWebhookEvents(companyId: string, limit: number = N8N_CONSTANTS.DEFAULT_LIMITS.WEBHOOK_EVENTS): Promise<any[]> {
    this.logger.log(`Getting webhook events for company ${companyId}`);

    const prismaEvents = await this.n8nRepository.findWebhookEvents(companyId, limit);
    const entities = N8nWebhookEventMapper.toEntities(prismaEvents);
    
    return N8nWebhookEventMapper.toResponseDtos(entities);
  }

  /**
   * Get webhook events by source with proper entity mapping
   */
  async getWebhookEventsBySource(
    source: $Enums.WebhookSource,
    companyId: string,
    limit: number = N8N_CONSTANTS.DEFAULT_LIMITS.WEBHOOK_EVENTS
  ): Promise<any[]> {
    this.logger.log(`Getting webhook events for source ${source} in company ${companyId}`);

    const prismaEvents = await this.n8nRepository.findWebhookEventsBySource(source, companyId, limit);
    const entities = N8nWebhookEventMapper.toEntities(prismaEvents);
    
    return N8nWebhookEventMapper.toResponseDtos(entities);
  }

  /**
   * Get usage metrics for company
   */
  async getUsageMetrics(companyId: string, period: string = 'daily'): Promise<any[]> {
    this.logger.log(`Getting usage metrics for company ${companyId} in period ${period}`);

    return this.n8nRepository.getUsageMetrics(companyId, period);
  }

  /**
   * Create system notification with audit trail
   */
  async createSystemNotification(data: {
    message: string;
    level: $Enums.SystemNotificationLevel;
    companyId: string;
  }): Promise<void> {
    this.logger.log(`Creating system notification for company ${data.companyId}`);

    await this.n8nRepository.createSystemNotification(data);

    // Create audit trail entry
    await this.auditTrailService.log({
      entity: 'SystemNotification',
      entityId: 'system',
      action: 'NOTIFICATION_CREATED',
      companyId: data.companyId,
      changes: {
        message: data.message,
        level: data.level,
      },
    });
  }

  /**
   * Get system notifications for company
   */
  async getSystemNotifications(companyId: string, limit: number = N8N_CONSTANTS.DEFAULT_LIMITS.SYSTEM_NOTIFICATIONS): Promise<any[]> {
    this.logger.log(`Getting system notifications for company ${companyId}`);

    return this.n8nRepository.findSystemNotifications(companyId, limit);
  }

  /**
   * Mark notification as read with audit trail
   */
  async markNotificationAsRead(notificationId: string, companyId: string): Promise<void> {
    this.logger.log(`Marking notification ${notificationId} as read for company ${companyId}`);

    await this.n8nRepository.markNotificationAsRead(notificationId, companyId);

    // Create audit trail entry
    await this.auditTrailService.log({
      entity: 'SystemNotification',
      entityId: notificationId,
      action: 'NOTIFICATION_READ',
      companyId,
      changes: {
        read: true,
      },
    });
  }

  /**
   * Clean up old data with audit trail
   */
  async cleanupOldData(): Promise<{
    webhookEvents: number;
    usageMetrics: number;
  }> {
    this.logger.log('Starting cleanup of old n8n data');

    const webhookEvents = await this.n8nRepository.cleanupOldWebhookEvents(
      N8N_CONSTANTS.CLEANUP_RETENTION_DAYS.WEBHOOK_EVENTS
    );
    const usageMetrics = await this.n8nRepository.cleanupOldUsageMetrics(
      N8N_CONSTANTS.CLEANUP_RETENTION_DAYS.USAGE_METRICS
    );

    // Create audit trail entry for cleanup
    await this.auditTrailService.log({
      entity: 'System',
      entityId: 'cleanup',
      action: 'N8N_DATA_CLEANUP',
      companyId: 'system',
      changes: {
        webhookEventsCleaned: webhookEvents,
        usageMetricsCleaned: usageMetrics,
        retentionDays: N8N_CONSTANTS.CLEANUP_RETENTION_DAYS,
      },
    });

    this.logger.log(`Cleanup completed: ${webhookEvents} webhook events, ${usageMetrics} usage metrics`);

    return {
      webhookEvents,
      usageMetrics,
    };
  }

  /**
   * Get n8n dashboard data for company
   */
  async getDashboardData(companyId: string): Promise<{
    recentWebhooks: any[];
    recentNotifications: any[];
    usageMetrics: any[];
  }> {
    this.logger.log(`Getting n8n dashboard data for company ${companyId}`);

    const [recentWebhooks, recentNotifications, usageMetrics] = await Promise.all([
      this.getWebhookEvents(companyId, 10),
      this.getSystemNotifications(companyId, 10),
      this.getUsageMetrics(companyId, 'daily'),
    ]);

    return {
      recentWebhooks,
      recentNotifications,
      usageMetrics,
    };
  }

  /**
   * Handle webhook processing errors
   */
  async handleWebhookError(
    source: $Enums.WebhookSource,
    companyId: string,
    error: Error,
    payload?: Record<string, any>
  ): Promise<void> {
    this.logger.error(`Webhook processing error from ${source} for company ${companyId}:`, error);

    // Create error notification
    await this.createSystemNotification({
      message: `Webhook processing error from ${source}: ${error.message}`,
      level: $Enums.SystemNotificationLevel.ERROR,
      companyId,
    });

    // Create audit trail entry for error
    await this.auditTrailService.log({
      entity: 'WebhookEvent',
      entityId: payload?.leadId || 'system',
      action: 'WEBHOOK_PROCESSING_ERROR',
      companyId,
      changes: {
        source,
        error: error.message,
        payload: payload ? JSON.stringify(payload) : null,
      },
    });
  }
} 