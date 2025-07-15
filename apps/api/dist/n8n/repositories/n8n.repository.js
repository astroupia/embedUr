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
var N8nRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let N8nRepository = N8nRepository_1 = class N8nRepository {
    prisma;
    logger = new common_1.Logger(N8nRepository_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWebhookEvent(data) {
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
    async findWebhookEvents(companyId, limit = 50) {
        this.logger.log(`Finding webhook events for company ${companyId}`);
        const events = await this.prisma.webhookEvent.findMany({
            where: { companyId },
            orderBy: { receivedAt: 'desc' },
            take: limit,
        });
        this.logger.log(`Found ${events.length} webhook events for company ${companyId}`);
        return events;
    }
    async findWebhookEventsBySource(source, companyId, limit = 50) {
        this.logger.log(`Finding webhook events for source ${source} in company ${companyId}`);
        const events = await this.prisma.webhookEvent.findMany({
            where: { source, companyId },
            orderBy: { receivedAt: 'desc' },
            take: limit,
        });
        this.logger.log(`Found ${events.length} webhook events for source ${source} in company ${companyId}`);
        return events;
    }
    async createUsageMetric(data) {
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
    async getUsageMetrics(companyId, period) {
        this.logger.log(`Getting usage metrics for company ${companyId} in period ${period}`);
        const metrics = await this.prisma.usageMetric.findMany({
            where: { companyId, period },
            orderBy: { recordedAt: 'desc' },
        });
        this.logger.log(`Found ${metrics.length} usage metrics for company ${companyId}`);
        return metrics;
    }
    async createSystemNotification(data) {
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
    async findSystemNotifications(companyId, limit = 50) {
        this.logger.log(`Finding system notifications for company ${companyId}`);
        const notifications = await this.prisma.systemNotification.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        this.logger.log(`Found ${notifications.length} system notifications for company ${companyId}`);
        return notifications;
    }
    async markNotificationAsRead(notificationId, companyId) {
        this.logger.log(`Marking notification ${notificationId} as read for company ${companyId}`);
        await this.prisma.systemNotification.updateMany({
            where: { id: notificationId, companyId },
            data: { read: true },
        });
        this.logger.log(`Notification ${notificationId} marked as read for company ${companyId}`);
    }
    async cleanupOldWebhookEvents(daysOld = 30) {
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
    async cleanupOldUsageMetrics(daysOld = 90) {
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
};
exports.N8nRepository = N8nRepository;
exports.N8nRepository = N8nRepository = N8nRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], N8nRepository);
//# sourceMappingURL=n8n.repository.js.map