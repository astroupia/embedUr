"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var N8nService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nService = void 0;
const common_1 = require("@nestjs/common");
const n8n_repository_1 = require("../repositories/n8n.repository");
const n8n_webhook_event_entity_1 = require("../entities/n8n-webhook-event.entity");
const n8n_webhook_event_mapper_1 = require("../mappers/n8n-webhook-event.mapper");
const audit_trail_service_1 = require("../../workflows/services/audit-trail.service");
const n8n_constants_1 = require("../constants/n8n.constants");
const prisma_1 = require("../../../generated/prisma");
let N8nService = N8nService_1 = class N8nService {
    n8nRepository;
    auditTrailService;
    logger = new common_1.Logger(N8nService_1.name);
    constructor(n8nRepository, auditTrailService) {
        this.n8nRepository = n8nRepository;
        this.auditTrailService = auditTrailService;
    }
    async logWebhookEvent(data) {
        const webhookEvent = new n8n_webhook_event_entity_1.N8nWebhookEventEntity(crypto.randomUUID(), data.source, data.payload, data.companyId, new Date());
        if (!webhookEvent.validatePayload()) {
            this.logger.warn(`Invalid webhook payload from ${data.source} for company ${data.companyId}`);
            this.logger.warn(`Payload validation failed for payload: ${JSON.stringify(data.payload)}`);
            throw new Error('Invalid webhook payload structure');
        }
        const createData = n8n_webhook_event_mapper_1.N8nWebhookEventMapper.toPrismaCreate(webhookEvent);
        await this.n8nRepository.createWebhookEvent(createData);
        const auditData = webhookEvent.getAuditTrailData();
        await this.auditTrailService.log({
            entity: 'WebhookEvent',
            entityId: webhookEvent.getLeadId() || 'system',
            action: auditData.action,
            companyId: data.companyId,
            changes: auditData.details,
        });
        await this.n8nRepository.createUsageMetric({
            metricName: `webhook_${data.source.toLowerCase()}`,
            count: 1,
            period: 'daily',
            companyId: data.companyId,
        });
    }
    async getWebhookEvents(companyId, limit = n8n_constants_1.N8N_CONSTANTS.DEFAULT_LIMITS.WEBHOOK_EVENTS) {
        this.logger.log(`Getting webhook events for company ${companyId}`);
        const prismaEvents = await this.n8nRepository.findWebhookEvents(companyId, limit);
        const entities = n8n_webhook_event_mapper_1.N8nWebhookEventMapper.toEntities(prismaEvents);
        return n8n_webhook_event_mapper_1.N8nWebhookEventMapper.toResponseDtos(entities);
    }
    async getWebhookEventsBySource(source, companyId, limit = n8n_constants_1.N8N_CONSTANTS.DEFAULT_LIMITS.WEBHOOK_EVENTS) {
        this.logger.log(`Getting webhook events for source ${source} in company ${companyId}`);
        const prismaEvents = await this.n8nRepository.findWebhookEventsBySource(source, companyId, limit);
        const entities = n8n_webhook_event_mapper_1.N8nWebhookEventMapper.toEntities(prismaEvents);
        return n8n_webhook_event_mapper_1.N8nWebhookEventMapper.toResponseDtos(entities);
    }
    async getUsageMetrics(companyId, period = 'daily') {
        this.logger.log(`Getting usage metrics for company ${companyId} in period ${period}`);
        return this.n8nRepository.getUsageMetrics(companyId, period);
    }
    async createSystemNotification(data) {
        this.logger.log(`Creating system notification for company ${data.companyId}`);
        await this.n8nRepository.createSystemNotification(data);
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
    async getSystemNotifications(companyId, limit = n8n_constants_1.N8N_CONSTANTS.DEFAULT_LIMITS.SYSTEM_NOTIFICATIONS) {
        this.logger.log(`Getting system notifications for company ${companyId}`);
        return this.n8nRepository.findSystemNotifications(companyId, limit);
    }
    async markNotificationAsRead(notificationId, companyId) {
        this.logger.log(`Marking notification ${notificationId} as read for company ${companyId}`);
        await this.n8nRepository.markNotificationAsRead(notificationId, companyId);
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
    async cleanupOldData() {
        this.logger.log('Starting cleanup of old n8n data');
        const webhookEvents = await this.n8nRepository.cleanupOldWebhookEvents(n8n_constants_1.N8N_CONSTANTS.CLEANUP_RETENTION_DAYS.WEBHOOK_EVENTS);
        const usageMetrics = await this.n8nRepository.cleanupOldUsageMetrics(n8n_constants_1.N8N_CONSTANTS.CLEANUP_RETENTION_DAYS.USAGE_METRICS);
        await this.auditTrailService.log({
            entity: 'System',
            entityId: 'cleanup',
            action: 'N8N_DATA_CLEANUP',
            companyId: 'system',
            changes: {
                webhookEventsCleaned: webhookEvents,
                usageMetricsCleaned: usageMetrics,
                retentionDays: n8n_constants_1.N8N_CONSTANTS.CLEANUP_RETENTION_DAYS,
            },
        });
        this.logger.log(`Cleanup completed: ${webhookEvents} webhook events, ${usageMetrics} usage metrics`);
        return {
            webhookEvents,
            usageMetrics,
        };
    }
    async getDashboardData(companyId) {
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
    async handleWebhookError(source, companyId, error, payload) {
        this.logger.error(`Webhook processing error from ${source} for company ${companyId}:`, error);
        await this.createSystemNotification({
            message: `Webhook processing error from ${source}: ${error.message}`,
            level: prisma_1.$Enums.SystemNotificationLevel.ERROR,
            companyId,
        });
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
};
exports.N8nService = N8nService;
exports.N8nService = N8nService = N8nService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [n8n_repository_1.N8nRepository,
        audit_trail_service_1.AuditTrailService])
], N8nService);
//# sourceMappingURL=n8n.service.js.map