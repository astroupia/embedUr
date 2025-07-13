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
var LeadEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadEventsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const lead_repository_1 = require("../repositories/lead.repository");
const workflow_execution_service_1 = require("../../workflows/services/workflow-execution.service");
const workflow_constants_1 = require("../../workflows/constants/workflow.constants");
const lead_constants_1 = require("../constants/lead.constants");
const rxjs_1 = require("rxjs");
let LeadEventsService = LeadEventsService_1 = class LeadEventsService {
    httpService;
    leadRepository;
    workflowExecutionService;
    logger = new common_1.Logger(LeadEventsService_1.name);
    constructor(httpService, leadRepository, workflowExecutionService) {
        this.httpService = httpService;
        this.leadRepository = leadRepository;
        this.workflowExecutionService = workflowExecutionService;
    }
    async triggerLinkedInScraping(lead) {
        if (!lead.linkedinUrl) {
            this.logger.log(`No LinkedIn URL provided for lead ${lead.id}, skipping scraping`);
            return;
        }
        this.logger.log(`Triggering LinkedIn scraping for lead ${lead.id}`);
        const webhookUrl = process.env.N8N_LEAD_VALIDATION_WEBHOOK;
        if (!webhookUrl) {
            throw new Error('N8N_LEAD_VALIDATION_WEBHOOK environment variable not configured');
        }
        const payload = {
            linkedinUrl: lead.linkedinUrl,
            leadId: lead.id,
            name: lead.fullName,
            email: lead.email,
            companyId: lead.companyId,
            campaignId: lead.campaignId,
            credentials: {
                airtableApiKey: process.env.AIRTABLE_API_KEY,
                openRouterApiKey: process.env.OPENROUTER_API_KEY,
                scrapingBeeApiKey: process.env.SCRAPINGBEE_API_KEY,
            },
            config: {
                airtableBaseId: process.env.AIRTABLE_BASE_ID,
                airtableTableName: process.env.AIRTABLE_TABLE_NAME,
                backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
            },
            prompts: {
                structureDataPrompt: 'Parse LinkedIn data into { leadId, name, email, company, jobTitle }',
            },
        };
        const workflowId = process.env.N8N_LEAD_VALIDATION_WORKFLOW_ID;
        if (!workflowId) {
            throw new Error('N8N_LEAD_VALIDATION_WORKFLOW_ID environment variable not configured');
        }
        await this.workflowExecutionService.createExecutionRecord({
            workflowId,
            leadId: lead.id,
            companyId: lead.companyId,
            type: workflow_constants_1.WorkflowType.LEAD_ENRICHMENT,
            inputData: payload,
            triggeredBy: 'LeadService',
        });
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`LinkedIn scraping workflow triggered successfully for lead ${lead.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger LinkedIn scraping workflow for lead ${lead.id}:`, error);
            throw error;
        }
    }
    async triggerEnrichment(lead) {
        this.logger.log(`Triggering enrichment for lead ${lead.id}`);
        const leadData = await this.leadRepository.findOne(lead.id, lead.companyId);
        const webhookUrl = process.env.N8N_ENRICHMENT_WEBHOOK;
        if (!webhookUrl) {
            this.logger.warn('N8N_ENRICHMENT_WEBHOOK not configured, skipping enrichment workflow');
            return;
        }
        const payload = {
            leadId: lead.id,
            name: leadData.fullName,
            email: leadData.email,
            company: leadData.enrichmentData?.company,
            jobTitle: leadData.enrichmentData?.jobTitle,
            linkedinUrl: leadData.linkedinUrl,
            companyId: lead.companyId,
            campaignId: leadData.campaignId,
            credentials: {
                airtableApiKey: process.env.AIRTABLE_API_KEY,
                openRouterApiKey: process.env.OPENROUTER_API_KEY,
                emailVerificationApiKey: process.env.NEVERBOUNCE_API_KEY,
                clearbitApiKey: process.env.CLEARBIT_API_KEY,
            },
            config: {
                airtableBaseId: process.env.AIRTABLE_BASE_ID,
                airtableTableName: process.env.AIRTABLE_TABLE_NAME,
                backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
            },
            prompts: {
                enrichmentPrompt: 'Enrich with industry and company size from web search',
            },
        };
        const workflowId = process.env.N8N_ENRICHMENT_WORKFLOW_ID;
        if (workflowId) {
            await this.workflowExecutionService.createExecutionRecord({
                workflowId,
                leadId: lead.id,
                companyId: lead.companyId,
                type: workflow_constants_1.WorkflowType.LEAD_ENRICHMENT,
                inputData: payload,
                triggeredBy: 'LeadEventsService',
            });
        }
        else {
            this.logger.warn('N8N_ENRICHMENT_WORKFLOW_ID not configured, skipping workflow execution record');
        }
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`Enrichment workflow triggered successfully for lead ${lead.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger enrichment workflow for lead ${lead.id}:`, error);
            if (process.env.NODE_ENV !== 'test') {
                throw error;
            }
        }
    }
    async triggerEmailDrafting(lead) {
        this.logger.log(`Triggering email drafting for lead ${lead.id}`);
        const leadData = await this.leadRepository.findOneWithCampaign(lead.id, lead.companyId);
        const webhookUrl = process.env.N8N_EMAIL_SENDING_WEBHOOK;
        if (!webhookUrl) {
            throw new Error('N8N_EMAIL_SENDING_WEBHOOK environment variable not configured');
        }
        const payload = {
            leadId: lead.id,
            name: leadData.fullName,
            email: leadData.email,
            company: leadData.enrichmentData?.company,
            jobTitle: leadData.enrichmentData?.jobTitle,
            industry: leadData.enrichmentData?.industry,
            companySize: leadData.enrichmentData?.companySize,
            emailVerified: leadData.enrichmentData?.emailVerified,
            linkedinUrl: leadData.linkedinUrl,
            companyId: lead.companyId,
            campaignId: leadData.campaignId,
            campaignName: leadData.campaign?.name,
            credentials: {
                airtableApiKey: process.env.AIRTABLE_API_KEY,
                openRouterApiKey: process.env.OPENROUTER_API_KEY,
                smartleadApiKey: process.env.SMARTLEAD_API_KEY,
            },
            config: {
                airtableBaseId: process.env.AIRTABLE_BASE_ID,
                airtableTableName: process.env.AIRTABLE_TABLE_NAME,
                backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                smartleadCampaignId: process.env.SMARTLEAD_CAMPAIGN_ID,
            },
            prompts: {
                emailDraftPrompt: 'Draft a personalized cold email for outreach',
            },
        };
        const workflowId = process.env.N8N_EMAIL_SENDING_WORKFLOW_ID;
        if (!workflowId) {
            throw new Error('N8N_EMAIL_SENDING_WORKFLOW_ID environment variable not configured');
        }
        await this.workflowExecutionService.createExecutionRecord({
            workflowId,
            leadId: lead.id,
            companyId: lead.companyId,
            type: workflow_constants_1.WorkflowType.EMAIL_SEQUENCE,
            inputData: payload,
            triggeredBy: 'LeadEventsService',
        });
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`Email drafting workflow triggered successfully for lead ${lead.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger email drafting workflow for lead ${lead.id}:`, error);
            throw error;
        }
    }
    async logExecution(lead, action, changes) {
        await this.leadRepository.createAuditTrail(lead.id, action, changes, lead.companyId);
    }
    async triggerStatusChangeWorkflow(lead, previousStatus) {
        this.logger.log(`Triggering status change workflow for lead ${lead.id}: ${previousStatus} -> ${lead.status}`);
        await this.logExecution(lead, 'STATUS_CHANGED', {
            previousStatus,
            newStatus: lead.status,
        });
    }
    async handleWorkflowCompletion(data) {
        this.logger.log(`Handling workflow completion for lead ${data.leadId}, workflow ${data.workflowId}`);
        const executions = await this.workflowExecutionService.findPendingExecutions(data.leadId, data.companyId);
        const execution = executions.find(e => e.workflowId === data.workflowId);
        if (!execution) {
            this.logger.error(`No pending workflow execution found for workflow ${data.workflowId}`);
            return;
        }
        await this.workflowExecutionService.updateExecutionStatus(execution.id, data.status, data.outputData, data.errorMessage);
        if (data.status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS && data.outputData) {
            await this.handleSuccessfulWorkflow(execution, data.outputData);
        }
        else if (data.status === workflow_constants_1.WorkflowExecutionStatus.FAILED) {
            await this.handleFailedWorkflow(execution, data.errorMessage);
        }
    }
    async handleSuccessfulWorkflow(execution, outputData) {
        const workflowName = execution.workflow?.name || 'Unknown';
        switch (workflowName) {
            case 'Lead Validation and LinkedIn Scraping':
                await this.handleLinkedInScrapingSuccess(execution.leadId, outputData);
                await this.triggerEnrichment({ id: execution.leadId, companyId: execution.companyId });
                break;
            case 'Lead Enrichment and Verification':
                await this.handleEnrichmentSuccess(execution.leadId, outputData);
                await this.triggerEmailDrafting({ id: execution.leadId, companyId: execution.companyId });
                break;
            case 'Email Drafting and Smartlead Sending':
                await this.handleEmailSendingSuccess(execution.leadId, outputData);
                break;
            default:
                this.logger.warn(`Unknown workflow type: ${workflowName}`);
        }
    }
    async handleLinkedInScrapingSuccess(leadId, outputData) {
        const lead = await this.leadRepository.findOne(leadId, outputData.companyId);
        await this.leadRepository.update(leadId, lead.companyId, {
            fullName: outputData.name || outputData.fullName,
            email: outputData.email,
            linkedinUrl: outputData.linkedinUrl,
            enrichmentData: {
                ...outputData,
                scrapedAt: new Date().toISOString(),
            },
            verified: !!outputData.email,
        });
        this.logger.log(`LinkedIn scraping completed for lead ${leadId}`);
    }
    async handleEnrichmentSuccess(leadId, outputData) {
        const lead = await this.leadRepository.findOne(leadId, outputData.companyId);
        await this.leadRepository.update(leadId, lead.companyId, {
            enrichmentData: {
                ...outputData,
                enrichedAt: new Date().toISOString(),
            },
            verified: outputData.emailVerified || false,
        });
        await this.leadRepository.createEnrichmentRequest(leadId, {
            companyId: outputData.companyId,
            provider: 'CLEARBIT',
            requestData: outputData,
        });
        this.logger.log(`Enrichment completed for lead ${leadId}`);
    }
    async handleEmailSendingSuccess(leadId, outputData) {
        await this.leadRepository.createEmailLog(leadId, {
            campaignId: outputData.campaignId,
            companyId: outputData.companyId,
            status: 'SENT',
            metadata: {
                emailId: outputData.emailId,
                smartleadCampaignId: outputData.smartleadCampaignId,
                sentAt: new Date().toISOString(),
            },
        });
        const lead = await this.leadRepository.findOne(leadId, outputData.companyId);
        await this.leadRepository.update(leadId, lead.companyId, { status: lead_constants_1.LeadStatus.CONTACTED });
        this.logger.log(`Email sent successfully for lead ${leadId}`);
    }
    async handleFailedWorkflow(execution, errorMessage) {
        this.logger.error(`Workflow failed for lead ${execution.leadId}: ${errorMessage}`);
        await this.leadRepository.createSystemNotification(`Workflow failed for lead ${execution.leadId}: ${errorMessage}`, 'ERROR', execution.companyId);
        if (execution.workflow?.type === workflow_constants_1.WorkflowType.EMAIL_SEQUENCE) {
            const lead = await this.leadRepository.findOne(execution.leadId, execution.companyId);
            await this.leadRepository.update(execution.leadId, lead.companyId, { status: lead_constants_1.LeadStatus.NEW });
        }
    }
    async triggerLeadValidationWorkflow(leadId, companyId) {
        const webhookUrl = process.env.N8N_LEAD_VALIDATION_WEBHOOK;
        if (!webhookUrl) {
            this.logger.warn('N8N_LEAD_VALIDATION_WEBHOOK not configured, skipping lead validation');
            return;
        }
        const lead = await this.leadRepository.findOneWithCampaign(leadId, companyId);
        const payload = {
            leadId: lead.id,
            fullName: lead.fullName,
            email: lead.email,
            linkedinUrl: lead.linkedinUrl || undefined,
            companyId: lead.companyId,
            credentials: {
                apolloApiKey: process.env.APOLLO_API_KEY,
                dropContactApiKey: process.env.DROP_CONTACT_API_KEY,
                clearbitApiKey: process.env.CLEARBIT_API_KEY,
                linkedinScraperApiKey: process.env.LINKEDIN_SCRAPER_API_KEY,
            },
            config: {
                airtableBaseId: process.env.AIRTABLE_BASE_ID || '',
                airtableTableName: process.env.AIRTABLE_TABLE_NAME || '',
                backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                apolloCompanyId: process.env.APOLLO_COMPANY_ID,
                dropContactCompanyId: process.env.DROP_CONTACT_COMPANY_ID,
                clearbitCompanyId: process.env.CLEARBIT_COMPANY_ID,
                linkedinScraperCompanyId: process.env.LINKEDIN_SCRAPER_COMPANY_ID,
            },
            prompts: {
                validationPrompt: 'Validate lead data and check if email is valid and person exists',
                scrapingPrompt: 'Extract professional information from LinkedIn profile',
                enrichmentPrompt: 'Enrich lead with additional contact and company data',
            },
        };
        const workflowId = process.env.N8N_LEAD_VALIDATION_WORKFLOW_ID;
        if (!workflowId) {
            this.logger.warn('N8N_LEAD_VALIDATION_WORKFLOW_ID not configured, skipping lead validation');
            return;
        }
        await this.workflowExecutionService.createExecutionRecord({
            workflowId,
            leadId,
            companyId,
            type: 'LEAD_ENRICHMENT',
            inputData: payload,
            triggeredBy: 'LeadEventsService',
        });
        try {
            const { HttpService } = await Promise.resolve().then(() => require('@nestjs/axios'));
            const httpService = new HttpService();
            const { firstValueFrom } = await Promise.resolve().then(() => require('rxjs'));
            await firstValueFrom(httpService.post(webhookUrl, payload));
            this.logger.log(`Lead validation workflow triggered successfully for lead ${leadId}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger lead validation workflow for lead ${leadId}:`, error);
        }
    }
    async triggerLeadEnrichmentWorkflow(leadId, companyId) {
        const webhookUrl = process.env.N8N_LEAD_ENRICHMENT_WEBHOOK;
        if (!webhookUrl) {
            this.logger.warn('N8N_LEAD_ENRICHMENT_WEBHOOK not configured, skipping lead enrichment');
            return;
        }
        const lead = await this.leadRepository.findOneWithCampaign(leadId, companyId);
        const payload = {
            leadId: lead.id,
            fullName: lead.fullName,
            email: lead.email,
            linkedinUrl: lead.linkedinUrl || undefined,
            companyId: lead.companyId,
            credentials: {
                apolloApiKey: process.env.APOLLO_API_KEY,
                dropContactApiKey: process.env.DROP_CONTACT_API_KEY,
                clearbitApiKey: process.env.CLEARBIT_API_KEY,
                hunterApiKey: process.env.HUNTER_API_KEY,
                snovApiKey: process.env.SNOV_API_KEY,
            },
            config: {
                airtableBaseId: process.env.AIRTABLE_BASE_ID || '',
                airtableTableName: process.env.AIRTABLE_TABLE_NAME || '',
                backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                apolloCompanyId: process.env.APOLLO_COMPANY_ID,
                dropContactCompanyId: process.env.DROP_CONTACT_COMPANY_ID,
                clearbitCompanyId: process.env.CLEARBIT_COMPANY_ID,
                hunterCompanyId: process.env.HUNTER_COMPANY_ID,
                snovCompanyId: process.env.SNOV_COMPANY_ID,
            },
            prompts: {
                enrichmentPrompt: 'Enrich lead with comprehensive contact and company data',
                verificationPrompt: 'Verify email validity and find additional contact methods',
                scoringPrompt: 'Score lead based on enrichment data quality and completeness',
            },
        };
        const workflowId = process.env.N8N_LEAD_ENRICHMENT_WORKFLOW_ID;
        if (!workflowId) {
            this.logger.warn('N8N_LEAD_ENRICHMENT_WORKFLOW_ID not configured, skipping lead enrichment');
            return;
        }
        await this.workflowExecutionService.createExecutionRecord({
            workflowId,
            leadId,
            companyId,
            type: 'LEAD_ENRICHMENT',
            inputData: payload,
            triggeredBy: 'LeadEventsService',
        });
        try {
            const { HttpService } = await Promise.resolve().then(() => require('@nestjs/axios'));
            const httpService = new HttpService();
            const { firstValueFrom } = await Promise.resolve().then(() => require('rxjs'));
            await firstValueFrom(httpService.post(webhookUrl, payload));
            this.logger.log(`Lead enrichment workflow triggered successfully for lead ${leadId}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger lead enrichment workflow for lead ${leadId}:`, error);
        }
    }
    async triggerEmailDraftingWorkflow(leadId, companyId) {
        const webhookUrl = process.env.N8N_EMAIL_DRAFTING_WEBHOOK;
        if (!webhookUrl) {
            this.logger.warn('N8N_EMAIL_DRAFTING_WEBHOOK not configured, skipping email drafting');
            return;
        }
        const lead = await this.leadRepository.findOneWithCampaignAndAiPersona(leadId, companyId);
        if (!lead.campaign?.aiPersona) {
            throw new Error(`No AI persona configured for campaign ${lead.campaignId}`);
        }
        const payload = {
            leadId: lead.id,
            fullName: lead.fullName,
            email: lead.email,
            linkedinUrl: lead.linkedinUrl || undefined,
            enrichmentData: lead.enrichmentData || undefined,
            companyId: lead.companyId,
            campaignId: lead.campaignId,
            aiPersona: {
                id: lead.campaign.aiPersona.id,
                name: lead.campaign.aiPersona.name,
                description: lead.campaign.aiPersona.description || undefined,
                prompt: lead.campaign.aiPersona.prompt,
                parameters: lead.campaign.aiPersona.parameters || undefined,
            },
            credentials: {
                openRouterApiKey: process.env.OPENROUTER_API_KEY,
                smartleadApiKey: process.env.SMARTLEAD_API_KEY,
                gmailApiKey: process.env.GMAIL_API_KEY,
                outlookApiKey: process.env.OUTLOOK_API_KEY,
            },
            config: {
                airtableBaseId: process.env.AIRTABLE_BASE_ID || '',
                airtableTableName: process.env.AIRTABLE_TABLE_NAME || '',
                backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                smartleadCompanyId: process.env.SMARTLEAD_COMPANY_ID,
                gmailCompanyId: process.env.GMAIL_COMPANY_ID,
                outlookCompanyId: process.env.OUTLOOK_COMPANY_ID,
                emailTemplateId: process.env.EMAIL_TEMPLATE_ID,
            },
            prompts: {
                draftingPrompt: lead.campaign.aiPersona.prompt,
                personalizationPrompt: 'Personalize email based on lead data and enrichment information',
                subjectPrompt: 'Generate compelling email subject line',
                followUpPrompt: 'Create follow-up email sequence if needed',
            },
        };
        const workflowId = process.env.N8N_EMAIL_DRAFTING_WORKFLOW_ID;
        if (!workflowId) {
            this.logger.warn('N8N_EMAIL_DRAFTING_WORKFLOW_ID not configured, skipping email drafting');
            return;
        }
        await this.workflowExecutionService.createExecutionRecord({
            workflowId,
            leadId,
            companyId,
            type: 'EMAIL_SEQUENCE',
            inputData: payload,
            triggeredBy: 'LeadEventsService',
        });
        try {
            const { HttpService } = await Promise.resolve().then(() => require('@nestjs/axios'));
            const httpService = new HttpService();
            const { firstValueFrom } = await Promise.resolve().then(() => require('rxjs'));
            await firstValueFrom(httpService.post(webhookUrl, payload));
            this.logger.log(`Email drafting workflow triggered successfully for lead ${leadId}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger email drafting workflow for lead ${leadId}:`, error);
        }
    }
};
exports.LeadEventsService = LeadEventsService;
exports.LeadEventsService = LeadEventsService = LeadEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        lead_repository_1.LeadRepository,
        workflow_execution_service_1.WorkflowExecutionService])
], LeadEventsService);
//# sourceMappingURL=lead-events.service.js.map