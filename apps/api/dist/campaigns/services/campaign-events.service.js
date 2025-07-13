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
var CampaignEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignEventsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../../prisma/prisma.service");
const workflow_execution_service_1 = require("../../workflows/services/workflow-execution.service");
let CampaignEventsService = CampaignEventsService_1 = class CampaignEventsService {
    httpService;
    prisma;
    workflowExecutionService;
    logger = new common_1.Logger(CampaignEventsService_1.name);
    constructor(httpService, prisma, workflowExecutionService) {
        this.httpService = httpService;
        this.prisma = prisma;
        this.workflowExecutionService = workflowExecutionService;
    }
    async triggerCampaignActivation(campaign) {
        try {
            this.logger.log(`Triggering campaign activation workflow for campaign ${campaign.id}`);
            const webhookUrl = process.env.N8N_CAMPAIGN_ACTIVATION_WEBHOOK;
            if (!webhookUrl) {
                this.logger.warn('N8N_CAMPAIGN_ACTIVATION_WEBHOOK not configured, skipping campaign activation');
                return;
            }
            const payload = {
                campaignId: campaign.id,
                companyId: campaign.companyId,
                aiPersonaId: campaign.aiPersonaId,
                workflowId: campaign.workflowId,
                campaignName: campaign.name,
                campaignDescription: campaign.description,
                credentials: {
                    smartleadApiKey: process.env.SMARTLEAD_API_KEY,
                    airtableApiKey: process.env.AIRTABLE_API_KEY,
                    openRouterApiKey: process.env.OPENROUTER_API_KEY,
                },
                config: {
                    airtableBaseId: process.env.AIRTABLE_BASE_ID,
                    airtableTableName: process.env.AIRTABLE_TABLE_NAME,
                    backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                    backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                },
            };
            const workflowId = process.env.N8N_CAMPAIGN_ACTIVATION_WORKFLOW_ID;
            if (workflowId) {
                await this.workflowExecutionService.createExecutionRecord({
                    workflowId,
                    leadId: '',
                    companyId: campaign.companyId,
                    type: 'LEAD_ROUTING',
                    inputData: payload,
                    triggeredBy: 'CampaignActivation',
                });
            }
            if (process.env.NODE_ENV === 'test') {
                this.logger.log(`Skipping HTTP request in test environment for campaign ${campaign.id}`);
                return;
            }
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`Campaign activation workflow triggered successfully for campaign ${campaign.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger campaign activation workflow for campaign ${campaign.id}`, error);
            if (process.env.NODE_ENV === 'test') {
                this.logger.warn(`Suppressing error in test environment for campaign ${campaign.id}`);
                return;
            }
            throw error;
        }
    }
    async triggerCampaignPause(campaign) {
        try {
            this.logger.log(`Triggering campaign pause workflow for campaign ${campaign.id}`);
            const webhookUrl = process.env.N8N_CAMPAIGN_PAUSE_WEBHOOK;
            if (!webhookUrl) {
                this.logger.warn('N8N_CAMPAIGN_PAUSE_WEBHOOK not configured, skipping campaign pause');
                return;
            }
            const payload = {
                campaignId: campaign.id,
                companyId: campaign.companyId,
                campaignName: campaign.name,
                credentials: {
                    smartleadApiKey: process.env.SMARTLEAD_API_KEY,
                },
                config: {
                    backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                    backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                },
            };
            const workflowId = process.env.N8N_CAMPAIGN_PAUSE_WORKFLOW_ID;
            if (workflowId) {
                await this.workflowExecutionService.createExecutionRecord({
                    workflowId,
                    leadId: '',
                    companyId: campaign.companyId,
                    type: 'LEAD_ROUTING',
                    inputData: payload,
                    triggeredBy: 'CampaignPause',
                });
            }
            if (process.env.NODE_ENV === 'test') {
                this.logger.log(`Skipping HTTP request in test environment for campaign ${campaign.id}`);
                return;
            }
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`Campaign pause workflow triggered successfully for campaign ${campaign.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger campaign pause workflow for campaign ${campaign.id}`, error);
            if (process.env.NODE_ENV === 'test') {
                this.logger.warn(`Suppressing error in test environment for campaign ${campaign.id}`);
                return;
            }
            throw error;
        }
    }
    async triggerCampaignCompletion(campaign) {
        try {
            this.logger.log(`Triggering campaign completion workflow for campaign ${campaign.id}`);
            const webhookUrl = process.env.N8N_CAMPAIGN_COMPLETION_WEBHOOK;
            if (!webhookUrl) {
                this.logger.warn('N8N_CAMPAIGN_COMPLETION_WEBHOOK not configured, skipping campaign completion');
                return;
            }
            const payload = {
                campaignId: campaign.id,
                companyId: campaign.companyId,
                campaignName: campaign.name,
                credentials: {
                    smartleadApiKey: process.env.SMARTLEAD_API_KEY,
                    airtableApiKey: process.env.AIRTABLE_API_KEY,
                },
                config: {
                    airtableBaseId: process.env.AIRTABLE_BASE_ID,
                    airtableTableName: process.env.AIRTABLE_TABLE_NAME,
                    backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                    backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                },
            };
            const workflowId = process.env.N8N_CAMPAIGN_COMPLETION_WORKFLOW_ID;
            if (workflowId) {
                await this.workflowExecutionService.createExecutionRecord({
                    workflowId,
                    leadId: '',
                    companyId: campaign.companyId,
                    type: 'LEAD_ROUTING',
                    inputData: payload,
                    triggeredBy: 'CampaignCompletion',
                });
            }
            if (process.env.NODE_ENV === 'test') {
                this.logger.log(`Skipping HTTP request in test environment for campaign ${campaign.id}`);
                return;
            }
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`Campaign completion workflow triggered successfully for campaign ${campaign.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger campaign completion workflow for campaign ${campaign.id}`, error);
            if (process.env.NODE_ENV === 'test') {
                this.logger.warn(`Suppressing error in test environment for campaign ${campaign.id}`);
                return;
            }
            throw error;
        }
    }
    async triggerStatusChangeWorkflow(campaign, previousStatus) {
        try {
            this.logger.log(`Triggering status change workflow for campaign ${campaign.id} (${previousStatus} -> ${campaign.status})`);
            const webhookUrl = process.env.N8N_CAMPAIGN_STATUS_CHANGE_WEBHOOK;
            if (!webhookUrl) {
                this.logger.warn('N8N_CAMPAIGN_STATUS_CHANGE_WEBHOOK not configured, skipping status change workflow');
                return;
            }
            const payload = {
                campaignId: campaign.id,
                previousStatus,
                newStatus: campaign.status,
                companyId: campaign.companyId,
                campaignName: campaign.name,
                credentials: {
                    smartleadApiKey: process.env.SMARTLEAD_API_KEY,
                },
                config: {
                    backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                    backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                },
            };
            const workflowId = process.env.N8N_CAMPAIGN_STATUS_CHANGE_WORKFLOW_ID;
            if (workflowId) {
                await this.workflowExecutionService.createExecutionRecord({
                    workflowId,
                    leadId: '',
                    companyId: campaign.companyId,
                    type: 'LEAD_ROUTING',
                    inputData: payload,
                    triggeredBy: 'CampaignStatusChange',
                });
            }
            if (process.env.NODE_ENV === 'test') {
                this.logger.log(`Skipping HTTP request in test environment for campaign ${campaign.id}`);
                return;
            }
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`Status change workflow triggered successfully for campaign ${campaign.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger status change workflow for campaign ${campaign.id}`, error);
            if (process.env.NODE_ENV === 'test') {
                this.logger.warn(`Suppressing error in test environment for campaign ${campaign.id}`);
                return;
            }
            throw error;
        }
    }
    async logExecution(campaign, action, metadata) {
        try {
            this.logger.log(`Logging execution for campaign ${campaign.id}: ${action}`, metadata);
            if (campaign.workflowId) {
                await this.prisma.workflowExecution.create({
                    data: {
                        status: 'COMPLETED',
                        triggeredBy: action,
                        companyId: campaign.companyId,
                        workflowId: campaign.workflowId,
                        leadId: null,
                        inputData: metadata || {},
                        outputData: {},
                        durationMs: 0,
                        startTime: new Date(),
                        endTime: new Date(),
                    },
                });
            }
            this.logger.log(`Execution logged successfully for campaign ${campaign.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to log execution for campaign ${campaign.id}`, error);
        }
    }
    async triggerLeadAssignment(campaign, leadId, leadData) {
        try {
            this.logger.log(`Triggering lead assignment workflow for campaign ${campaign.id}, lead ${leadId}`);
            const webhookUrl = process.env.N8N_LEAD_ASSIGNMENT_WEBHOOK;
            if (!webhookUrl) {
                this.logger.warn('N8N_LEAD_ASSIGNMENT_WEBHOOK not configured, skipping lead assignment');
                return;
            }
            const payload = {
                campaignId: campaign.id,
                leadId,
                companyId: campaign.companyId,
                campaignName: campaign.name,
                aiPersonaId: campaign.aiPersonaId,
                leadData,
                credentials: {
                    smartleadApiKey: process.env.SMARTLEAD_API_KEY,
                    openRouterApiKey: process.env.OPENROUTER_API_KEY,
                },
                config: {
                    backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                    backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                },
            };
            const workflowId = process.env.N8N_LEAD_ASSIGNMENT_WORKFLOW_ID;
            if (workflowId) {
                await this.workflowExecutionService.createExecutionRecord({
                    workflowId,
                    leadId,
                    companyId: campaign.companyId,
                    type: 'LEAD_ENRICHMENT',
                    inputData: payload,
                    triggeredBy: 'LeadAssignment',
                });
            }
            if (process.env.NODE_ENV === 'test') {
                this.logger.log(`Skipping HTTP request in test environment for campaign ${campaign.id}, lead ${leadId}`);
                return;
            }
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`Lead assignment workflow triggered successfully for campaign ${campaign.id}, lead ${leadId}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger lead assignment workflow for campaign ${campaign.id}, lead ${leadId}`, error);
            if (process.env.NODE_ENV === 'test') {
                this.logger.warn(`Suppressing error in test environment for campaign ${campaign.id}, lead ${leadId}`);
                return;
            }
            throw error;
        }
    }
    async triggerAnalyticsUpdate(campaign) {
        try {
            this.logger.log(`Triggering analytics update for campaign ${campaign.id}`);
            const webhookUrl = process.env.N8N_ANALYTICS_UPDATE_WEBHOOK;
            if (!webhookUrl) {
                this.logger.warn('N8N_ANALYTICS_UPDATE_WEBHOOK not configured, skipping analytics update');
                return;
            }
            const payload = {
                campaignId: campaign.id,
                companyId: campaign.companyId,
                campaignName: campaign.name,
                credentials: {
                    smartleadApiKey: process.env.SMARTLEAD_API_KEY,
                    airtableApiKey: process.env.AIRTABLE_API_KEY,
                },
                config: {
                    airtableBaseId: process.env.AIRTABLE_BASE_ID,
                    airtableTableName: process.env.AIRTABLE_TABLE_NAME,
                    backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                    backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                },
            };
            const workflowId = process.env.N8N_ANALYTICS_UPDATE_WORKFLOW_ID;
            if (workflowId) {
                await this.workflowExecutionService.createExecutionRecord({
                    workflowId,
                    leadId: '',
                    companyId: campaign.companyId,
                    type: 'LEAD_ROUTING',
                    inputData: payload,
                    triggeredBy: 'AnalyticsUpdate',
                });
            }
            if (process.env.NODE_ENV === 'test') {
                this.logger.log(`Skipping HTTP request in test environment for campaign ${campaign.id}`);
                return;
            }
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`Analytics update triggered successfully for campaign ${campaign.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger analytics update for campaign ${campaign.id}`, error);
            if (process.env.NODE_ENV === 'test') {
                this.logger.warn(`Suppressing error in test environment for campaign ${campaign.id}`);
                return;
            }
            throw error;
        }
    }
};
exports.CampaignEventsService = CampaignEventsService;
exports.CampaignEventsService = CampaignEventsService = CampaignEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        prisma_service_1.PrismaService,
        workflow_execution_service_1.WorkflowExecutionService])
], CampaignEventsService);
//# sourceMappingURL=campaign-events.service.js.map