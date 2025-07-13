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
var N8nController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lead_events_service_1 = require("../leads/services/lead-events.service");
const workflow_execution_service_1 = require("../workflows/services/workflow-execution.service");
const workflow_events_service_1 = require("../workflows/services/workflow-events.service");
const workflow_constants_1 = require("../workflows/constants/workflow.constants");
const api_key_guard_1 = require("../auth/guards/api-key.guard");
const lead_repository_1 = require("../leads/repositories/lead.repository");
const reply_repository_1 = require("../replies/repositories/reply.repository");
const booking_repository_1 = require("../replies/repositories/booking.repository");
const n8n_service_1 = require("./services/n8n.service");
const prisma_1 = require("../../generated/prisma");
const n8n_dto_1 = require("./dto/n8n.dto");
let N8nController = N8nController_1 = class N8nController {
    leadRepository;
    replyRepository;
    bookingRepository;
    leadEvents;
    workflowExecutionService;
    workflowEventsService;
    n8nService;
    logger = new common_1.Logger(N8nController_1.name);
    constructor(leadRepository, replyRepository, bookingRepository, leadEvents, workflowExecutionService, workflowEventsService, n8nService) {
        this.leadRepository = leadRepository;
        this.replyRepository = replyRepository;
        this.bookingRepository = bookingRepository;
        this.leadEvents = leadEvents;
        this.workflowExecutionService = workflowExecutionService;
        this.workflowEventsService = workflowEventsService;
        this.n8nService = n8nService;
    }
    async handleWorkflowCompletion(data) {
        this.logger.log(`Received workflow completion webhook: ${data.executionId || 'unknown'}`);
        try {
            return { success: true };
        }
        catch (error) {
            this.logger.error('Error handling workflow completion webhook:', error);
            return { success: false, error: error.message };
        }
    }
    async handleSmartleadReplyWebhook(data) {
        this.logger.log(`Received Smartlead reply webhook for lead: ${data.leadId || 'unknown'}`);
        try {
            return await this.handleSmartleadReply(data);
        }
        catch (error) {
            this.logger.error('Error handling Smartlead reply webhook:', error);
            return { success: false, error: error.message };
        }
    }
    async handleReplyHandlingCompletionWebhook(data) {
        this.logger.log(`Received reply handling completion webhook: ${data.replyId || 'unknown'}`);
        try {
            return await this.handleReplyHandlingCompletion(data);
        }
        catch (error) {
            this.logger.error('Error handling reply handling completion webhook:', error);
            return { success: false, error: error.message };
        }
    }
    async handleCompletion(data) {
        this.logger.log(`Handling workflow completion for lead ${data.leadId}, workflow ${data.workflowId}`);
        try {
            await this.n8nService.logWebhookEvent({
                source: prisma_1.$Enums.WebhookSource.N8N,
                payload: data,
                companyId: data.companyId,
            });
            const execution = await this.findWorkflowExecution(data.workflowId, data.leadId, data.companyId);
            if (execution) {
                await this.workflowEventsService.handleExecutionWebhook(execution.id, this.mapStatus(data.status), data.outputData, data.errorMessage);
            }
            else {
                this.logger.warn(`No workflow execution found for workflow ${data.workflowId} and lead ${data.leadId}`);
            }
            if (data.status === n8n_dto_1.WorkflowCompletionStatus.SUCCESS && data.outputData) {
                await this.leadEvents.handleWorkflowCompletion({
                    workflowId: data.workflowId,
                    leadId: data.leadId,
                    companyId: data.companyId,
                    status: this.mapStatus(data.status),
                    outputData: data.outputData,
                });
            }
            this.logger.log(`Workflow completion handled successfully for lead ${data.leadId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to handle workflow completion for lead ${data.leadId}:`, error);
            await this.n8nService.handleWebhookError(prisma_1.$Enums.WebhookSource.N8N, data.companyId || 'unknown', error, data);
            throw new common_1.BadRequestException('Failed to process workflow completion');
        }
    }
    async handleEnrichmentComplete(data) {
        this.logger.log(`Handling enrichment completion for lead ${data.leadId}`);
        try {
            await this.n8nService.logWebhookEvent({
                source: prisma_1.$Enums.WebhookSource.N8N,
                payload: data,
                companyId: data.companyId,
            });
            await this.leadRepository.findOne(data.leadId, data.companyId);
            if (data.status === 'SUCCESS' && data.enrichedData) {
                await this.leadRepository.updateEnrichmentData(data.leadId, data.companyId, {
                    ...data.enrichedData,
                    lastEnrichedAt: new Date().toISOString(),
                });
                await this.leadRepository.createAuditTrail(data.leadId, 'Enrichment completed successfully', data.enrichedData, data.companyId, undefined);
                await this.leadEvents.triggerEmailDraftingWorkflow(data.leadId, data.companyId);
            }
            else if (data.status === 'FAILED') {
                await this.leadRepository.createAuditTrail(data.leadId, 'Enrichment failed', { errorMessage: data.errorMessage }, data.companyId, undefined);
            }
            this.logger.log(`Enrichment completion handled successfully for lead ${data.leadId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to handle enrichment completion for lead ${data.leadId}:`, error);
            await this.n8nService.handleWebhookError(prisma_1.$Enums.WebhookSource.N8N, data.companyId || 'unknown', error, data);
            throw new common_1.BadRequestException('Failed to process enrichment completion');
        }
    }
    async handleLog(data) {
        this.logger.log(`Handling workflow log for lead ${data.leadId}, node: ${data.nodeName}`);
        try {
            await this.n8nService.logWebhookEvent({
                source: prisma_1.$Enums.WebhookSource.N8N,
                payload: data,
                companyId: data.companyId,
            });
            await this.leadRepository.findOne(data.leadId, data.companyId);
            await this.leadRepository.createAuditTrail(data.leadId, `Log from ${data.nodeName}`, data, data.companyId, undefined);
            this.logger.log(`Workflow log handled successfully for lead ${data.leadId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to handle workflow log for lead ${data.leadId}:`, error);
            await this.n8nService.handleWebhookError(prisma_1.$Enums.WebhookSource.N8N, data.companyId || 'unknown', error, data);
            throw new common_1.BadRequestException('Failed to process workflow log');
        }
    }
    async handleSmartleadReply(data) {
        this.logger.log(`Handling Smartlead reply for lead ${data.leadId}, email ${data.emailId}`);
        try {
            await this.n8nService.logWebhookEvent({
                source: prisma_1.$Enums.WebhookSource.SMARTLEAD,
                payload: data,
                companyId: data.companyId,
            });
            await this.leadRepository.findOne(data.leadId, data.companyId);
            const emailLog = await this.replyRepository.findEmailLogByLeadAndEmailId(data.leadId, data.emailId, data.companyId);
            const reply = await this.replyRepository.createFromWebhook({
                leadId: data.leadId,
                emailLogId: emailLog.id,
                companyId: data.companyId,
                content: data.content,
                classification: prisma_1.$Enums.ReplyClassification.QUESTION,
                handledBy: undefined,
            });
            if (!process.env.N8N_REPLY_HANDLING_WEBHOOK) {
                this.logger.warn('N8N_REPLY_HANDLING_WEBHOOK not configured, skipping reply handling workflow');
                this.logger.log(`Smartlead reply handled successfully for lead ${data.leadId} (without workflow trigger)`);
                return { success: true };
            }
            const triggerResult = await this.triggerReplyHandlingWorkflow({
                leadId: data.leadId,
                emailId: data.emailId,
                replyId: reply.id,
                content: data.content,
                companyId: data.companyId,
            });
            this.logger.log(`Smartlead reply handled successfully for lead ${data.leadId}`);
            return triggerResult;
        }
        catch (error) {
            this.logger.error(`Failed to handle Smartlead reply for lead ${data.leadId}:`, error);
            if (error?.message?.includes('N8N_REPLY_HANDLING_WEBHOOK not configured') ||
                error?.message?.includes('N8N_REPLY_HANDLING_WORKFLOW_ID not configured')) {
                return { success: true };
            }
            await this.n8nService.handleWebhookError(prisma_1.$Enums.WebhookSource.SMARTLEAD, data.companyId || 'unknown', error, data);
            return { success: false, error: 'Failed to process Smartlead reply' };
        }
    }
    async handleReplyHandlingCompletion(data) {
        this.logger.log(`=== ENTERING handleReplyHandlingCompletion ===`);
        this.logger.log(`Handling reply processing completion for lead ${data.leadId}`);
        this.logger.log(`Payload received in /n8n/replies/complete: ${JSON.stringify(data)}`);
        try {
            await this.n8nService.logWebhookEvent({
                source: prisma_1.$Enums.WebhookSource.N8N,
                payload: data,
                companyId: data.companyId,
            });
            const reply = await this.replyRepository.findOne(data.replyId, data.companyId);
            if (!reply) {
                this.logger.warn(`Reply not found: ${data.replyId}`);
                return { success: false, error: 'Reply not found' };
            }
            const { outputData } = data;
            await this.replyRepository.updateClassification(data.replyId, data.companyId, outputData.replyClassification || prisma_1.$Enums.ReplyClassification.QUESTION, 'AI');
            if (outputData.replyClassification === prisma_1.$Enums.ReplyClassification.INTERESTED && outputData.meetingLink) {
                await this.bookingRepository.createFromWebhook({
                    leadId: data.leadId,
                    companyId: data.companyId,
                    calendlyLink: outputData.meetingLink,
                    status: prisma_1.$Enums.BookingStatus.BOOKED,
                    scheduledTime: new Date(outputData.scheduledTime || Date.now()),
                });
                await this.bookingRepository.updateLeadStatus(data.leadId, data.companyId, prisma_1.$Enums.LeadStatus.BOOKED);
                await this.n8nService.createSystemNotification({
                    message: `Positive reply from lead ${data.leadId}, meeting booked: ${outputData.meetingLink}`,
                    level: prisma_1.$Enums.SystemNotificationLevel.SUCCESS,
                    companyId: data.companyId,
                });
            }
            this.logger.log(`Reply handling completed for lead ${data.leadId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to handle reply processing completion for lead ${data.leadId}:`, error);
            await this.n8nService.handleWebhookError(prisma_1.$Enums.WebhookSource.N8N, data.companyId || 'unknown', error, data);
            return { success: false, error: 'Failed to process reply handling completion' };
        }
    }
    async findWorkflowExecution(workflowId, leadId, companyId) {
        this.logger.log(`Looking for workflow execution: workflowId=${workflowId}, leadId=${leadId}, companyId=${companyId}`);
        const execution = await this.workflowExecutionService.findByWorkflowLeadAndCompany(workflowId, leadId, companyId);
        this.logger.log(`Found execution: ${execution ? execution.id : 'null'}`);
        return execution;
    }
    async triggerReplyHandlingWorkflow(data) {
        const webhookUrl = process.env.N8N_REPLY_HANDLING_WEBHOOK;
        if (!webhookUrl) {
            this.logger.warn('N8N_REPLY_HANDLING_WEBHOOK not configured, skipping reply handling');
            return { success: true };
        }
        const payload = {
            leadId: data.leadId,
            emailId: data.emailId,
            replyId: data.replyId,
            replyContent: data.content,
            companyId: data.companyId,
            credentials: {
                airtableApiKey: process.env.AIRTABLE_API_KEY,
                openRouterApiKey: process.env.OPENROUTER_API_KEY,
                calendlyApiKey: process.env.CALENDLY_API_KEY,
            },
            config: {
                airtableBaseId: process.env.AIRTABLE_BASE_ID,
                airtableTableName: process.env.AIRTABLE_TABLE_NAME,
                backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/replies/complete`,
                calendlyEventTypeId: process.env.CALENDLY_EVENT_TYPE_ID,
            },
            prompts: {
                classifyReplyPrompt: 'Classify reply as INTERESTED, NOT_INTERESTED, AUTO_REPLY, UNSUBSCRIBE, or QUESTION',
                meetingPrompt: 'If interested, suggest a meeting and provide Calendly link',
            },
        };
        const workflowId = process.env.N8N_REPLY_HANDLING_WORKFLOW_ID;
        if (!workflowId) {
            this.logger.warn('N8N_REPLY_HANDLING_WORKFLOW_ID not configured, skipping reply handling');
            return { success: true };
        }
        await this.workflowExecutionService.createExecutionRecord({
            workflowId,
            leadId: data.leadId,
            companyId: data.companyId,
            type: workflow_constants_1.WorkflowType.LEAD_ROUTING,
            inputData: payload,
            triggeredBy: 'SmartleadWebhook',
        });
        try {
            const { HttpService } = await Promise.resolve().then(() => require('@nestjs/axios'));
            const httpService = new HttpService();
            const { firstValueFrom } = await Promise.resolve().then(() => require('rxjs'));
            await firstValueFrom(httpService.post(webhookUrl, payload));
            this.logger.log(`Reply handling workflow triggered successfully for lead ${data.leadId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to trigger reply handling workflow for lead ${data.leadId}:`, error);
            return { success: true };
        }
    }
    mapStatus(status) {
        switch (status) {
            case n8n_dto_1.WorkflowCompletionStatus.SUCCESS:
                return workflow_constants_1.WorkflowExecutionStatus.SUCCESS;
            case n8n_dto_1.WorkflowCompletionStatus.FAILED:
                return workflow_constants_1.WorkflowExecutionStatus.FAILED;
            case n8n_dto_1.WorkflowCompletionStatus.TIMEOUT:
                return workflow_constants_1.WorkflowExecutionStatus.TIMEOUT;
            default:
                return workflow_constants_1.WorkflowExecutionStatus.STARTED;
        }
    }
    async getWebhookEvents(companyId, limit = '50') {
        if (!companyId) {
            throw new common_1.BadRequestException('Company ID is required');
        }
        const events = await this.n8nService.getWebhookEvents(companyId, parseInt(limit));
        return {
            success: true,
            data: events,
            total: events.length,
        };
    }
    async getWebhookEventsBySource(source, companyId, limit = '50') {
        if (!companyId) {
            throw new common_1.BadRequestException('Company ID is required');
        }
        const validSources = Object.values(prisma_1.$Enums.WebhookSource);
        const normalizedSource = source.toUpperCase();
        if (!validSources.includes(normalizedSource)) {
            throw new common_1.BadRequestException('Invalid webhook source');
        }
        const events = await this.n8nService.getWebhookEventsBySource(normalizedSource, companyId, parseInt(limit));
        return {
            success: true,
            data: events,
            total: events.length,
        };
    }
    async getNotifications(companyId, limit = '50') {
        if (!companyId) {
            throw new common_1.BadRequestException('Company ID is required');
        }
        const notifications = await this.n8nService.getSystemNotifications(companyId, parseInt(limit));
        return {
            success: true,
            data: notifications,
            total: notifications.length,
        };
    }
    async markNotificationAsRead(id, companyId) {
        if (!companyId) {
            throw new common_1.BadRequestException('Company ID is required');
        }
        await this.n8nService.markNotificationAsRead(id, companyId);
        return {
            success: true,
            message: 'Notification marked as read',
        };
    }
    async cleanup() {
        const result = await this.n8nService.cleanupOldData();
        return {
            success: true,
            data: result,
            message: 'Cleanup completed successfully',
        };
    }
    async getDashboard(companyId) {
        if (!companyId) {
            throw new common_1.BadRequestException('Company ID is required');
        }
        const dashboardData = await this.n8nService.getDashboardData(companyId);
        return {
            success: true,
            data: dashboardData,
        };
    }
};
exports.N8nController = N8nController;
__decorate([
    (0, common_1.Post)('workflow-completion'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle workflow completion webhook from n8n (legacy)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "handleWorkflowCompletion", null);
__decorate([
    (0, common_1.Post)(['smartlead-reply', 'smartlead/reply']),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Smartlead reply webhook from n8n (legacy and new)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid payload' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ type: n8n_dto_1.SmartleadReplyPayloadDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [n8n_dto_1.SmartleadReplyPayloadDto]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "handleSmartleadReplyWebhook", null);
__decorate([
    (0, common_1.Post)(['reply-handling-completion', 'reply/complete']),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle reply handling completion webhook from n8n (legacy and new)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid payload' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ type: n8n_dto_1.ReplyHandlingCompletionPayloadDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [n8n_dto_1.ReplyHandlingCompletionPayloadDto]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "handleReplyHandlingCompletionWebhook", null);
__decorate([
    (0, common_1.Post)('complete'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle workflow completion from n8n' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow completion processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid payload' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ type: n8n_dto_1.WorkflowCompletionPayloadDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [n8n_dto_1.WorkflowCompletionPayloadDto]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "handleCompletion", null);
__decorate([
    (0, common_1.Post)('enrichment/complete'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle enrichment completion from n8n' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrichment completion processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid payload' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "handleEnrichmentComplete", null);
__decorate([
    (0, common_1.Post)('log'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle workflow log entries from n8n' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Log entry handled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid payload' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ type: n8n_dto_1.WorkflowLogPayloadDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [n8n_dto_1.WorkflowLogPayloadDto]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "handleLog", null);
__decorate([
    (0, common_1.Post)('replies'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Smartlead reply webhooks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply webhook handled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid payload' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ type: n8n_dto_1.SmartleadReplyPayloadDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [n8n_dto_1.SmartleadReplyPayloadDto]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "handleSmartleadReply", null);
__decorate([
    (0, common_1.Post)('replies/complete'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle reply handling workflow completion' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply handling completion processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid payload' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ type: n8n_dto_1.ReplyHandlingCompletionPayloadDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [n8n_dto_1.ReplyHandlingCompletionPayloadDto]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "handleReplyHandlingCompletion", null);
__decorate([
    (0, common_1.Get)('webhooks'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get webhook events for company' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook events retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing company ID' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "getWebhookEvents", null);
__decorate([
    (0, common_1.Get)('webhooks/:source'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get webhook events by source for company' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook events retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid source or missing company ID' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('source')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "getWebhookEventsBySource", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get system notifications for company' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing company ID' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Put)('notifications/:id/read'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing company ID' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clean up old n8n data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cleanup completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "cleanup", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get n8n dashboard data for company' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing company ID' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "getDashboard", null);
exports.N8nController = N8nController = N8nController_1 = __decorate([
    (0, swagger_1.ApiTags)('n8n'),
    (0, common_1.Controller)('n8n'),
    __metadata("design:paramtypes", [lead_repository_1.LeadRepository,
        reply_repository_1.ReplyRepository,
        booking_repository_1.BookingRepository,
        lead_events_service_1.LeadEventsService,
        workflow_execution_service_1.WorkflowExecutionService,
        workflow_events_service_1.WorkflowEventsService,
        n8n_service_1.N8nService])
], N8nController);
//# sourceMappingURL=n8n.controller.js.map