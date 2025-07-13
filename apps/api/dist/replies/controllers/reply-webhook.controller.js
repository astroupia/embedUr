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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReplyWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reply_service_1 = require("../services/reply.service");
const reply_constants_1 = require("../constants/reply.constants");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReplyWebhookController = ReplyWebhookController_1 = class ReplyWebhookController {
    replyService;
    prisma;
    logger = new common_1.Logger(ReplyWebhookController_1.name);
    constructor(replyService, prisma) {
        this.replyService = replyService;
        this.prisma = prisma;
    }
    async handleSmartleadWebhook(payload, headers) {
        this.logger.log(`Received Smartlead webhook for lead ${payload.leadId}`);
        try {
            if (!this.validateSmartleadSignature(headers, payload)) {
                throw new common_1.UnauthorizedException('Invalid webhook signature');
            }
            if (!payload.leadId || !payload.emailId || !payload.replyContent) {
                throw new common_1.BadRequestException('Missing required fields: leadId, emailId, or replyContent');
            }
            const lead = await this.prisma.lead.findUnique({
                where: { id: payload.leadId },
                select: { companyId: true },
            });
            if (!lead) {
                throw new common_1.BadRequestException('Lead not found');
            }
            const replyDto = {
                content: payload.replyContent,
                leadId: payload.leadId,
                emailLogId: payload.emailId,
                source: reply_constants_1.ReplySource.SMARTLEAD,
                metadata: {
                    ...payload.metadata,
                    replySubject: payload.replySubject,
                    replyFrom: payload.replyFrom,
                    replyTo: payload.replyTo,
                    timestamp: payload.timestamp,
                    webhookSource: 'smartlead',
                },
            };
            await this.replyService.create(replyDto, lead.companyId);
            this.logger.log(`Smartlead webhook processed successfully for lead ${payload.leadId}`);
            return {
                success: true,
                message: 'Reply processed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error processing Smartlead webhook: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleGenericWebhook(payload, headers) {
        this.logger.log('Received generic reply webhook');
        try {
            if (!this.validateWebhookToken(headers)) {
                throw new common_1.UnauthorizedException('Invalid webhook token');
            }
            if (!payload.leadId || !payload.emailLogId || !payload.content) {
                throw new common_1.BadRequestException('Missing required fields: leadId, emailLogId, or content');
            }
            const lead = await this.prisma.lead.findUnique({
                where: { id: payload.leadId },
                select: { companyId: true },
            });
            if (!lead) {
                throw new common_1.BadRequestException('Lead not found');
            }
            const replyDto = {
                content: payload.content,
                leadId: payload.leadId,
                emailLogId: payload.emailLogId,
                source: reply_constants_1.ReplySource.WEBHOOK,
                metadata: {
                    ...payload.metadata,
                    webhookSource: 'generic',
                    receivedAt: new Date().toISOString(),
                },
            };
            await this.replyService.create(replyDto, lead.companyId);
            this.logger.log(`Generic webhook processed successfully for lead ${payload.leadId}`);
            return {
                success: true,
                message: 'Reply processed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error processing generic webhook: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleManualReply(payload) {
        this.logger.log(`Creating manual reply for lead ${payload.leadId}`);
        try {
            if (!payload.leadId || !payload.emailLogId || !payload.content || !payload.companyId) {
                throw new common_1.BadRequestException('Missing required fields: leadId, emailLogId, content, or companyId');
            }
            const replyDto = {
                content: payload.content,
                leadId: payload.leadId,
                emailLogId: payload.emailLogId,
                source: reply_constants_1.ReplySource.MANUAL,
                metadata: {
                    ...payload.metadata,
                    createdManually: true,
                    createdAt: new Date().toISOString(),
                },
            };
            const reply = await this.replyService.create(replyDto, payload.companyId);
            this.logger.log(`Manual reply created successfully: ${reply.id}`);
            return {
                success: true,
                message: 'Reply created successfully',
                replyId: reply.id,
            };
        }
        catch (error) {
            this.logger.error(`Error creating manual reply: ${error.message}`, error.stack);
            throw error;
        }
    }
    validateSmartleadSignature(headers, payload) {
        const signature = headers['x-smartlead-signature'];
        if (!signature) {
            this.logger.warn('Missing Smartlead webhook signature');
            return false;
        }
        return true;
    }
    validateWebhookToken(headers) {
        const token = headers['x-webhook-token'];
        if (!token) {
            this.logger.warn('Missing webhook token');
            return false;
        }
        const expectedToken = process.env.WEBHOOK_TOKEN || 'test-token';
        return token === expectedToken;
    }
    async healthCheck() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.ReplyWebhookController = ReplyWebhookController;
__decorate([
    (0, common_1.Post)('smartlead'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Smartlead reply webhook' }),
    (0, swagger_1.ApiHeader)({ name: 'x-smartlead-signature', description: 'Smartlead webhook signature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReplyWebhookController.prototype, "handleSmartleadWebhook", null);
__decorate([
    (0, common_1.Post)('generic'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle generic reply webhook' }),
    (0, swagger_1.ApiHeader)({ name: 'x-webhook-token', description: 'Webhook authentication token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReplyWebhookController.prototype, "handleGenericWebhook", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle manual reply creation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReplyWebhookController.prototype, "handleManualReply", null);
__decorate([
    (0, common_1.Post)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Webhook health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook service is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReplyWebhookController.prototype, "healthCheck", null);
exports.ReplyWebhookController = ReplyWebhookController = ReplyWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('webhooks'),
    (0, common_1.Controller)('webhooks/replies'),
    __metadata("design:paramtypes", [reply_service_1.ReplyService,
        prisma_service_1.PrismaService])
], ReplyWebhookController);
//# sourceMappingURL=reply-webhook.controller.js.map