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
var WorkflowEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEventsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const workflow_execution_repository_1 = require("../repositories/workflow-execution.repository");
const workflow_repository_1 = require("../repositories/workflow.repository");
const workflow_constants_1 = require("../constants/workflow.constants");
const lead_repository_1 = require("../../leads/repositories/lead.repository");
const campaign_repository_1 = require("../../campaigns/repositories/campaign.repository");
const target_audience_translator_service_1 = require("./target-audience-translator.service");
const admin_repository_1 = require("../../admin/admin.repository");
let WorkflowEventsService = WorkflowEventsService_1 = class WorkflowEventsService {
    httpService;
    workflowExecutionRepository;
    workflowRepository;
    leadRepository;
    campaignRepository;
    targetAudienceTranslatorService;
    adminRepository;
    logger = new common_1.Logger(WorkflowEventsService_1.name);
    constructor(httpService, workflowExecutionRepository, workflowRepository, leadRepository, campaignRepository, targetAudienceTranslatorService, adminRepository) {
        this.httpService = httpService;
        this.workflowExecutionRepository = workflowExecutionRepository;
        this.workflowRepository = workflowRepository;
        this.leadRepository = leadRepository;
        this.campaignRepository = campaignRepository;
        this.targetAudienceTranslatorService = targetAudienceTranslatorService;
        this.adminRepository = adminRepository;
    }
    async triggerWorkflowExecution(workflow, execution) {
        try {
            this.logger.log(`Triggering workflow execution ${execution.id} for workflow ${workflow.id}`);
            if (workflow.type === workflow_constants_1.WorkflowType.TARGET_AUDIENCE_TRANSLATOR) {
                await this.handleTargetAudienceTranslatorExecution(workflow, execution);
                return;
            }
            const webhookUrl = process.env.N8N_WORKFLOW_EXECUTION_WEBHOOK;
            if (!webhookUrl) {
                this.logger.warn('N8N_WORKFLOW_EXECUTION_WEBHOOK not configured, skipping workflow execution');
                return;
            }
            const payload = {
                workflowId: workflow.n8nWorkflowId,
                executionId: execution.id,
                workflowType: workflow.type,
                inputData: execution.inputData,
                companyId: workflow.companyId,
                leadId: execution.leadId,
                credentials: {
                    smartleadApiKey: process.env.SMARTLEAD_API_KEY,
                    openRouterApiKey: process.env.OPENROUTER_API_KEY,
                    airtableApiKey: process.env.AIRTABLE_API_KEY,
                },
                config: {
                    airtableBaseId: process.env.AIRTABLE_BASE_ID,
                    airtableTableName: process.env.AIRTABLE_TABLE_NAME,
                    backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
                    backendCompleteUrl: `${process.env.BACKEND_URL}/api/n8n/complete`,
                },
            };
            await this.workflowExecutionRepository.updateStatus(execution.id, workflow_constants_1.WorkflowExecutionStatus.RUNNING, undefined, undefined, undefined, undefined);
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(webhookUrl, payload));
            this.logger.log(`Workflow execution ${execution.id} triggered successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger workflow execution ${execution.id}`, error);
            await this.workflowExecutionRepository.updateStatus(execution.id, workflow_constants_1.WorkflowExecutionStatus.FAILED, undefined, error.message, new Date(), Date.now() - execution.startTime.getTime());
            throw error;
        }
    }
    async handleExecutionWebhook(executionId, status, outputData, errorMessage) {
        try {
            this.logger.log(`Handling webhook for execution ${executionId} with status ${status}`);
            const endTime = new Date();
            const execution = await this.workflowExecutionRepository.findById(executionId);
            if (!execution) {
                throw new Error(`Workflow execution not found: ${executionId}`);
            }
            const durationMs = endTime.getTime() - execution.startTime.getTime();
            await this.workflowExecutionRepository.updateStatus(executionId, status, outputData, errorMessage, endTime, durationMs);
            if (status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS) {
                await this.handleSuccessfulExecution(executionId, outputData);
            }
            else if (status === workflow_constants_1.WorkflowExecutionStatus.FAILED) {
                await this.handleFailedExecution(executionId, errorMessage);
            }
            this.logger.log(`Webhook handled successfully for execution ${executionId}`);
        }
        catch (error) {
            this.logger.error(`Failed to handle webhook for execution ${executionId}`, error);
            throw error;
        }
    }
    async handleSuccessfulExecution(executionId, outputData) {
        try {
            this.logger.log(`Handling successful execution ${executionId}`);
            const execution = await this.workflowExecutionRepository.findById(executionId);
            if (!execution) {
                this.logger.error(`Execution not found: ${executionId}`);
                return;
            }
            const workflow = await this.workflowRepository.findOne(execution.workflowId, execution.companyId);
            if (!workflow) {
                this.logger.error(`Workflow not found for execution ${executionId}`);
                return;
            }
            switch (workflow.type) {
                case workflow_constants_1.WorkflowType.TARGET_AUDIENCE_TRANSLATOR:
                    await this.handleTargetAudienceTranslatorSuccess(execution, outputData);
                    break;
                case workflow_constants_1.WorkflowType.LEAD_ENRICHMENT:
                    await this.handleLeadEnrichmentSuccess(execution, outputData);
                    break;
                case workflow_constants_1.WorkflowType.EMAIL_SEQUENCE:
                    await this.handleEmailSequenceSuccess(execution, outputData);
                    break;
                case workflow_constants_1.WorkflowType.LEAD_ROUTING:
                    await this.handleLeadRoutingSuccess(execution, outputData);
                    break;
                default:
                    this.logger.warn(`Unknown workflow type: ${workflow.type}`);
            }
            this.logger.log(`Successful execution ${executionId} handled`);
        }
        catch (error) {
            this.logger.error(`Failed to handle successful execution ${executionId}`, error);
        }
    }
    async handleFailedExecution(executionId, errorMessage) {
        try {
            this.logger.log(`Handling failed execution ${executionId}: ${errorMessage}`);
            const execution = await this.workflowExecutionRepository.findById(executionId);
            if (!execution) {
                this.logger.error(`Execution not found: ${executionId}`);
                return;
            }
            await this.adminRepository.createActionLog({
                action: 'WORKFLOW_EXECUTION_FAILED',
                targetType: 'WORKFLOW_EXECUTION',
                targetId: executionId,
                performedBy: process.env.SYSTEM_USER_ID || 'system',
                details: {
                    companyId: execution.companyId,
                    workflowId: execution.workflowId,
                    errorMessage: errorMessage || 'Unknown error',
                },
            });
            if (this.shouldRetry(errorMessage)) {
                await this.scheduleRetry(execution);
            }
            if (this.isCriticalFailure(errorMessage)) {
                await this.alertAdministrators(execution, errorMessage || 'Unknown error');
            }
            this.logger.log(`Failed execution ${executionId} handled`);
        }
        catch (error) {
            this.logger.error(`Failed to handle failed execution ${executionId}`, error);
        }
    }
    async logExecution(workflow, action, metadata) {
        try {
            this.logger.log(`Logging workflow execution: ${action} for workflow ${workflow.id}`);
            await this.workflowExecutionRepository.create({
                workflowId: workflow.id,
                leadId: null,
                companyId: workflow.companyId,
                status: 'LOGGED',
                triggeredBy: action,
                startTime: new Date(),
                inputData: metadata || {},
            });
            this.logger.log(`Workflow execution logged successfully: ${action}`);
        }
        catch (error) {
            this.logger.error(`Failed to log workflow execution: ${action}`, error);
        }
    }
    async handleLeadEnrichmentSuccess(execution, outputData) {
        this.logger.log(`Handling lead enrichment success for execution ${execution.id}`);
        if (execution.leadId && outputData?.enrichedData) {
            await this.leadRepository.update(execution.leadId, execution.companyId, {
                enrichmentData: outputData.enrichedData,
            });
            if (outputData.campaignId) {
                this.logger.log(`Campaign update requested for lead ${execution.leadId}: ${outputData.campaignId}`);
            }
        }
    }
    async handleEmailSequenceSuccess(execution, outputData) {
        if (!execution.leadId || !outputData)
            return;
        try {
            if (outputData.status === 'interested') {
                await this.leadRepository.updateStatus(execution.leadId, execution.companyId, 'INTERESTED');
            }
            else if (outputData.status === 'not_interested') {
                await this.leadRepository.updateStatus(execution.leadId, execution.companyId, 'NOT_INTERESTED');
            }
            this.logger.log(`Email sequence completed for lead ${execution.leadId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update lead ${execution.leadId} after email sequence`, error);
        }
    }
    async handleLeadRoutingSuccess(execution, outputData) {
        if (!execution.leadId || !outputData)
            return;
        try {
            if (outputData.campaignId) {
                this.logger.log(`Campaign update requested for lead ${execution.leadId}: ${outputData.campaignId}`);
            }
            this.logger.log(`Lead ${execution.leadId} routed successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to route lead ${execution.leadId}`, error);
        }
    }
    async handleTargetAudienceTranslatorExecution(workflow, execution) {
        try {
            this.logger.log(`Processing Target Audience Translator execution ${execution.id}`);
            await this.workflowExecutionRepository.updateStatus(execution.id, workflow_constants_1.WorkflowExecutionStatus.RUNNING, undefined, undefined, undefined, undefined);
            const inputData = execution.inputData || {};
            const createDto = {
                inputFormat: inputData.inputFormat,
                targetAudienceData: inputData.targetAudienceData,
                structuredData: inputData.structuredData,
                config: inputData.config,
            };
            const translation = await this.targetAudienceTranslatorService.create(createDto, execution.companyId, execution.triggeredBy);
            let processedTranslation = translation;
            let attempts = 0;
            const maxAttempts = 30;
            while ((processedTranslation.status === 'PENDING' || processedTranslation.status === 'PROCESSING') && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                processedTranslation = await this.targetAudienceTranslatorService.findOne(translation.id, execution.companyId);
                attempts++;
            }
            if (processedTranslation.status === 'SUCCESS') {
                await this.workflowExecutionRepository.updateStatus(execution.id, workflow_constants_1.WorkflowExecutionStatus.SUCCESS, {
                    leads: processedTranslation.leads,
                    enrichmentSchema: processedTranslation.enrichmentSchema,
                    interpretedCriteria: processedTranslation.interpretedCriteria,
                    confidence: processedTranslation.confidence,
                    reasoning: processedTranslation.reasoning,
                }, undefined, new Date(), Date.now() - execution.startTime.getTime());
            }
            else {
                throw new Error(`Translation processing failed or timed out. Status: ${processedTranslation.status}`);
            }
            this.logger.log(`Target Audience Translator execution ${execution.id} completed successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to process Target Audience Translator execution ${execution.id}`, error);
            await this.workflowExecutionRepository.updateStatus(execution.id, workflow_constants_1.WorkflowExecutionStatus.FAILED, undefined, error.message, new Date(), Date.now() - execution.startTime.getTime());
            throw error;
        }
    }
    async handleTargetAudienceTranslatorSuccess(execution, outputData) {
        this.logger.log(`Handling target audience translator success for execution ${execution.id}`);
        await this.adminRepository.createActionLog({
            action: 'TARGET_AUDIENCE_TRANSLATION_COMPLETED',
            targetType: 'TARGET_AUDIENCE_TRANSLATOR',
            targetId: execution.workflowId,
            performedBy: execution.triggeredBy,
            details: {
                companyId: execution.companyId,
                executionId: execution.id,
                leadsCount: outputData?.leads?.length || 0,
                enrichmentSchema: outputData?.enrichmentSchema,
                interpretedCriteria: outputData?.interpretedCriteria,
                confidence: outputData?.confidence,
                reasoning: outputData?.reasoning,
            },
        });
        this.logger.log(`Target audience translation completed with ${outputData?.leads?.length || 0} leads`);
    }
    shouldRetry(errorMessage) {
        if (!errorMessage)
            return false;
        const retryableErrors = [
            'timeout',
            'network',
            'rate limit',
            'temporary',
            'service unavailable',
        ];
        return retryableErrors.some(error => errorMessage.toLowerCase().includes(error));
    }
    async scheduleRetry(execution) {
        try {
            await this.workflowExecutionRepository.create({
                workflowId: execution.workflowId,
                leadId: execution.leadId || '',
                companyId: execution.companyId,
                status: workflow_constants_1.WorkflowExecutionStatus.STARTED,
                triggeredBy: `RETRY_${execution.triggeredBy}`,
                startTime: new Date(),
                inputData: execution.inputData || {},
            });
            this.logger.log(`Retry scheduled for execution ${execution.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to schedule retry for execution ${execution.id}`, error);
        }
    }
    isCriticalFailure(errorMessage) {
        if (!errorMessage)
            return false;
        const criticalErrors = [
            'authentication',
            'authorization',
            'invalid configuration',
            'database',
            'critical',
        ];
        return criticalErrors.some(error => errorMessage.toLowerCase().includes(error));
    }
    async alertAdministrators(execution, errorMessage) {
        try {
            await this.adminRepository.createActionLog({
                action: 'CRITICAL_WORKFLOW_EXECUTION_FAILED',
                targetType: 'WORKFLOW_EXECUTION',
                targetId: execution.id,
                performedBy: execution.triggeredBy,
                details: {
                    companyId: execution.companyId,
                    workflowId: execution.workflowId,
                    errorMessage: errorMessage,
                },
            });
            this.logger.warn(`Administrators alerted for critical failure in execution ${execution.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to alert administrators for execution ${execution.id}`, error);
        }
    }
    async triggerWorkflowWithRetry(workflow, execution, maxRetries = 3) {
        let attempts = 0;
        while (attempts < maxRetries) {
            try {
                await this.triggerWorkflowExecution(workflow, execution);
                return;
            }
            catch (error) {
                attempts++;
                this.logger.warn(`Workflow execution attempt ${attempts} failed for ${execution.id}: ${error.message}`);
                if (attempts >= maxRetries) {
                    this.logger.error(`Max retries reached for workflow execution ${execution.id}`);
                    throw error;
                }
                const delay = Math.pow(2, attempts) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
};
exports.WorkflowEventsService = WorkflowEventsService;
exports.WorkflowEventsService = WorkflowEventsService = WorkflowEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => lead_repository_1.LeadRepository))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => campaign_repository_1.CampaignRepository))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => target_audience_translator_service_1.TargetAudienceTranslatorService))),
    __metadata("design:paramtypes", [axios_1.HttpService,
        workflow_execution_repository_1.WorkflowExecutionRepository,
        workflow_repository_1.WorkflowRepository,
        lead_repository_1.LeadRepository,
        campaign_repository_1.CampaignRepository,
        target_audience_translator_service_1.TargetAudienceTranslatorService,
        admin_repository_1.AdminRepository])
], WorkflowEventsService);
//# sourceMappingURL=workflow-events.service.js.map