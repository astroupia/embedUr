import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { $Enums } from '../../../generated/prisma';

@Injectable()
export class N8nRepository {
  private readonly logger = new Logger(N8nRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create webhook event record
   */
  async createWebhookEvent(data: {
    source: $Enums.WebhookSource;
    payload: Record<string, any>;
    companyId: string;
  }): Promise<void> {
    this.logger.log(`Creating webhook event for company ${data.companyId}`);

    await this.prisma.webhookEvent.create({
      data: {
        source: data.source,
        payload: data.payload,
        companyId: data.companyId,
      },
    });

    this.logger.log(`Webhook event created for company ${data.companyId}`);
  }

  /**
   * Find webhook events by company
   */
  async findWebhookEvents(companyId: string, limit: number = 50): Promise<any[]> {
    this.logger.log(`Finding webhook events for company ${companyId}`);

    const events = await this.prisma.webhookEvent.findMany({
      where: { companyId },
      orderBy: { receivedAt: 'desc' },
      take: limit,
    });

    this.logger.log(`Found ${events.length} webhook events for company ${companyId}`);
    return events;
  }

  /**
   * Find webhook events by source
   */
  async findWebhookEventsBySource(
    source: $Enums.WebhookSource,
    companyId: string,
    limit: number = 50
  ): Promise<any[]> {
    this.logger.log(`Finding webhook events for source ${source} in company ${companyId}`);

    const events = await this.prisma.webhookEvent.findMany({
      where: { source, companyId },
      orderBy: { receivedAt: 'desc' },
      take: limit,
    });

    this.logger.log(`Found ${events.length} webhook events for source ${source} in company ${companyId}`);
    return events;
  }

  /**
   * Create usage metric
   */
  async createUsageMetric(data: {
    metricName: string;
    count: number;
    period: string;
    companyId: string;
  }): Promise<void> {
    this.logger.log(`Creating usage metric ${data.metricName} for company ${data.companyId}`);

    await this.prisma.usageMetric.create({
      data: {
        metricName: data.metricName,
        count: data.count,
        period: data.period,
        companyId: data.companyId,
      },
    });

    this.logger.log(`Usage metric created for company ${data.companyId}`);
  }

  /**
   * Get usage metrics for company
   */
  async getUsageMetrics(companyId: string, period: string): Promise<any[]> {
    this.logger.log(`Getting usage metrics for company ${companyId} in period ${period}`);

    const metrics = await this.prisma.usageMetric.findMany({
      where: { companyId, period },
      orderBy: { recordedAt: 'desc' },
    });

    this.logger.log(`Found ${metrics.length} usage metrics for company ${companyId}`);
    return metrics;
  }

  /**
   * Create system notification
   */
  async createSystemNotification(data: {
    message: string;
    level: $Enums.SystemNotificationLevel;
    companyId: string;
  }): Promise<void> {
    // Skip creating system notification if companyId is not valid
    if (!data.companyId || data.companyId === 'unknown' || data.companyId === 'system') {
      this.logger.warn(`Skipping system notification creation for invalid companyId: ${data.companyId}`);
      return;
    }
    
    this.logger.log(`Creating system notification for company ${data.companyId}`);

    await this.prisma.systemNotification.create({
      data: {
        message: data.message,
        level: data.level,
        companyId: data.companyId,
      },
    });

    this.logger.log(`System notification created for company ${data.companyId}`);
  }

  /**
   * Find system notifications for company
   */
  async findSystemNotifications(companyId: string, limit: number = 50): Promise<any[]> {
    this.logger.log(`Finding system notifications for company ${companyId}`);

    const notifications = await this.prisma.systemNotification.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    this.logger.log(`Found ${notifications.length} system notifications for company ${companyId}`);
    return notifications;
  }

  /**
   * Mark system notification as read
   */
  async markNotificationAsRead(notificationId: string, companyId: string): Promise<void> {
    this.logger.log(`Marking notification ${notificationId} as read for company ${companyId}`);

    await this.prisma.systemNotification.updateMany({
      where: { id: notificationId, companyId },
      data: { read: true },
    });

    this.logger.log(`Notification ${notificationId} marked as read for company ${companyId}`);
  }

  /**
   * Clean up old webhook events
   */
  async cleanupOldWebhookEvents(daysOld: number = 30): Promise<number> {
    this.logger.log(`Cleaning up webhook events older than ${daysOld} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.webhookEvent.deleteMany({
      where: {
        receivedAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old webhook events`);
    return result.count;
  }

  /**
   * Clean up old usage metrics
   */
  async cleanupOldUsageMetrics(daysOld: number = 90): Promise<number> {
    this.logger.log(`Cleaning up usage metrics older than ${daysOld} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.usageMetric.deleteMany({
      where: {
        recordedAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old usage metrics`);
    return result.count;
  }
} 