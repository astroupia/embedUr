import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WorkflowExecutionRepository } from '../repositories/workflow-execution.repository';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { WorkflowEntity } from '../entities/workflow.entity';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionStatus, WorkflowType } from '../constants/workflow.constants';
import { LeadRepository } from '../../leads/repositories/lead.repository';
import { CampaignRepository } from '../../campaigns/repositories/campaign.repository';
import { TargetAudienceTranslatorService } from './target-audience-translator.service';
import { AdminRepository } from '../../admin/admin.repository';

@Injectable()
export class WorkflowEventsService {
  private readonly logger = new Logger(WorkflowEventsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    private readonly workflowRepository: WorkflowRepository,
    @Inject(forwardRef(() => LeadRepository))
    private readonly leadRepository: LeadRepository,
    @Inject(forwardRef(() => CampaignRepository))
    private readonly campaignRepository: CampaignRepository,
    @Inject(forwardRef(() => TargetAudienceTranslatorService))
    private readonly targetAudienceTranslatorService: TargetAudienceTranslatorService,
    private readonly adminRepository: AdminRepository,
  ) {}

  async triggerWorkflowExecution(
    workflow: WorkflowEntity,
    execution: WorkflowExecutionEntity,
  ): Promise<void> {
    try {
      this.logger.log(`Triggering workflow execution ${execution.id} for workflow ${workflow.id}`);

      // Handle Target Audience Translator workflow type directly
      if (workflow.type === WorkflowType.TARGET_AUDIENCE_TRANSLATOR) {
        await this.handleTargetAudienceTranslatorExecution(workflow, execution);
        return;
      }

      // For other workflow types, use external workflow engine
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

      // Update execution status to RUNNING
      await this.workflowExecutionRepository.updateStatus(
        execution.id,
        WorkflowExecutionStatus.RUNNING,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      // Trigger n8n workflow
      await firstValueFrom(this.httpService.post(webhookUrl, payload));

      this.logger.log(`Workflow execution ${execution.id} triggered successfully`);
    } catch (error) {
      this.logger.error(`Failed to trigger workflow execution ${execution.id}`, error);
      
      // Update execution status to FAILED
      await this.workflowExecutionRepository.updateStatus(
        execution.id,
        WorkflowExecutionStatus.FAILED,
        undefined,
        error.message,
        new Date(),
        Date.now() - execution.startTime.getTime(),
      );
      
      throw error;
    }
  }

  async handleExecutionWebhook(
    executionId: string,
    status: WorkflowExecutionStatus,
    outputData?: Record<string, any>,
    errorMessage?: string,
  ): Promise<void> {
    try {
      this.logger.log(`Handling webhook for execution ${executionId} with status ${status}`);

      // Update execution record via repository
      const endTime = new Date();
      
      // First get the execution to get the companyId and startTime
      const execution = await this.workflowExecutionRepository.findById(executionId);
      if (!execution) {
        throw new Error(`Workflow execution not found: ${executionId}`);
      }
      const durationMs = endTime.getTime() - execution.startTime.getTime();

      await this.workflowExecutionRepository.updateStatus(
        executionId,
        status,
        outputData,
        errorMessage,
        endTime,
        durationMs,
      );

      // Trigger downstream actions based on execution result
      if (status === WorkflowExecutionStatus.SUCCESS) {
        await this.handleSuccessfulExecution(executionId, outputData);
      } else if (status === WorkflowExecutionStatus.FAILED) {
        await this.handleFailedExecution(executionId, errorMessage);
      }

      this.logger.log(`Webhook handled successfully for execution ${executionId}`);
    } catch (error) {
      this.logger.error(`Failed to handle webhook for execution ${executionId}`, error);
      throw error;
    }
  }

  async handleSuccessfulExecution(executionId: string, outputData?: Record<string, any>): Promise<void> {
    try {
      this.logger.log(`Handling successful execution ${executionId}`);

      const execution = await this.workflowExecutionRepository.findById(executionId);
      if (!execution) {
        this.logger.error(`Execution not found: ${executionId}`);
        return;
      }
      
      // Get workflow details from the repository
      const workflow = await this.workflowRepository.findOne(execution.workflowId, execution.companyId);

      if (!workflow) {
        this.logger.error(`Workflow not found for execution ${executionId}`);
        return;
      }

      // Implement downstream actions based on workflow type
      switch (workflow.type) {
        case WorkflowType.TARGET_AUDIENCE_TRANSLATOR:
          await this.handleTargetAudienceTranslatorSuccess(execution, outputData);
          break;
        case WorkflowType.LEAD_ENRICHMENT:
          await this.handleLeadEnrichmentSuccess(execution, outputData);
          break;
        case WorkflowType.EMAIL_SEQUENCE:
          await this.handleEmailSequenceSuccess(execution, outputData);
          break;
        case WorkflowType.LEAD_ROUTING:
          await this.handleLeadRoutingSuccess(execution, outputData);
          break;
        default:
          this.logger.warn(`Unknown workflow type: ${workflow.type}`);
      }

      this.logger.log(`Successful execution ${executionId} handled`);
    } catch (error) {
      this.logger.error(`Failed to handle successful execution ${executionId}`, error);
      // Don't throw error for downstream processing failures
    }
  }

  async handleFailedExecution(executionId: string, errorMessage?: string): Promise<void> {
    try {
      this.logger.log(`Handling failed execution ${executionId}: ${errorMessage}`);

      const execution = await this.workflowExecutionRepository.findById(executionId);
      if (!execution) {
        this.logger.error(`Execution not found: ${executionId}`);
        return;
      }

      // Log to system notifications using admin repository
      await this.adminRepository.createActionLog({
        action: 'WORKFLOW_EXECUTION_FAILED',
        targetType: 'WORKFLOW_EXECUTION',
        targetId: executionId,
        performedBy: process.env.SYSTEM_USER_ID || 'system', // Use system user ID to avoid foreign key constraint
        details: {
          companyId: execution.companyId,
          workflowId: execution.workflowId,
          errorMessage: errorMessage || 'Unknown error',
        },
      });

      // Retry logic for certain error types
      if (this.shouldRetry(errorMessage)) {
        await this.scheduleRetry(execution);
      }

      // Alert administrators for critical failures
      if (this.isCriticalFailure(errorMessage)) {
        await this.alertAdministrators(execution, errorMessage || 'Unknown error');
      }

      this.logger.log(`Failed execution ${executionId} handled`);
    } catch (error) {
      this.logger.error(`Failed to handle failed execution ${executionId}`, error);
      // Don't throw error for error handling failures
    }
  }

  async logExecution(workflow: WorkflowEntity, action: string, metadata?: Record<string, any>): Promise<void> {
    try {
      this.logger.log(`Logging workflow execution: ${action} for workflow ${workflow.id}`);

      // Create a logged execution record
      await this.workflowExecutionRepository.create({
        workflowId: workflow.id,
        leadId: null, // Use null for logging events that don't have a specific lead
        companyId: workflow.companyId,
        status: 'LOGGED' as WorkflowExecutionStatus,
        triggeredBy: action,
        startTime: new Date(),
        inputData: metadata || {},
      });

      this.logger.log(`Workflow execution logged successfully: ${action}`);
    } catch (error) {
      this.logger.error(`Failed to log workflow execution: ${action}`, error);
    }
  }

  /**
   * Handle successful lead enrichment workflow
   */
  private async handleLeadEnrichmentSuccess(
    execution: WorkflowExecutionEntity,
    outputData?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Handling lead enrichment success for execution ${execution.id}`);

    if (execution.leadId && outputData?.enrichedData) {
      // Update lead with enriched data
      await this.leadRepository.update(execution.leadId, execution.companyId, {
        enrichmentData: outputData.enrichedData,
      });

      // Log campaign update request
      if (outputData.campaignId) {
        this.logger.log(`Campaign update requested for lead ${execution.leadId}: ${outputData.campaignId}`);
      }
    }
  }

  /**
   * Handle successful email sequence workflow
   */
  private async handleEmailSequenceSuccess(
    execution: WorkflowExecutionEntity,
    outputData?: Record<string, any>,
  ): Promise<void> {
    if (!execution.leadId || !outputData) return;

    try {
      // Update lead status based on email sequence result
      if (outputData.status === 'interested') {
        await this.leadRepository.updateStatus(execution.leadId, execution.companyId, 'INTERESTED');
      } else if (outputData.status === 'not_interested') {
        await this.leadRepository.updateStatus(execution.leadId, execution.companyId, 'NOT_INTERESTED');
      }

      this.logger.log(`Email sequence completed for lead ${execution.leadId}`);
    } catch (error) {
      this.logger.error(`Failed to update lead ${execution.leadId} after email sequence`, error);
    }
  }

  /**
   * Handle successful lead routing workflow
   */
  private async handleLeadRoutingSuccess(
    execution: WorkflowExecutionEntity,
    outputData?: Record<string, any>,
  ): Promise<void> {
    if (!execution.leadId || !outputData) return;

    try {
      // Assign lead to appropriate campaign or user
              if (outputData.campaignId) {
          // Note: Campaign update would need to be implemented in LeadRepository
          this.logger.log(`Campaign update requested for lead ${execution.leadId}: ${outputData.campaignId}`);
        }

      this.logger.log(`Lead ${execution.leadId} routed successfully`);
    } catch (error) {
      this.logger.error(`Failed to route lead ${execution.leadId}`, error);
    }
  }

  /**
   * Handle Target Audience Translator workflow execution directly
   */
  private async handleTargetAudienceTranslatorExecution(
    workflow: WorkflowEntity,
    execution: WorkflowExecutionEntity,
  ): Promise<void> {
    try {
      this.logger.log(`Processing Target Audience Translator execution ${execution.id}`);

      // Update execution status to RUNNING
      await this.workflowExecutionRepository.updateStatus(
        execution.id,
        WorkflowExecutionStatus.RUNNING,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      // Create a translation request using the input data
      const inputData = execution.inputData || {};
      const createDto = {
        inputFormat: inputData.inputFormat,
        targetAudienceData: inputData.targetAudienceData,
        structuredData: inputData.structuredData,
        config: inputData.config,
      };

      // Process the translation using the service
      const translation = await this.targetAudienceTranslatorService.create(
        createDto,
        execution.companyId,
        execution.triggeredBy,
      );

      // Wait for processing to complete (poll for status)
      let processedTranslation = translation;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait
      
      while ((processedTranslation.status === 'PENDING' || processedTranslation.status === 'PROCESSING') && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        processedTranslation = await this.targetAudienceTranslatorService.findOne(
          translation.id,
          execution.companyId,
        );
        attempts++;
      }

      if (processedTranslation.status === 'SUCCESS') {
        // Update execution status to SUCCESS with output data
        await this.workflowExecutionRepository.updateStatus(
          execution.id,
          WorkflowExecutionStatus.SUCCESS,
          {
            leads: processedTranslation.leads,
            enrichmentSchema: processedTranslation.enrichmentSchema,
            interpretedCriteria: processedTranslation.interpretedCriteria,
            confidence: processedTranslation.confidence,
            reasoning: processedTranslation.reasoning,
          },
          undefined,
          new Date(),
          Date.now() - execution.startTime.getTime(),
        );
      } else {
        throw new Error(`Translation processing failed or timed out. Status: ${processedTranslation.status}`);
      }

      this.logger.log(`Target Audience Translator execution ${execution.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Failed to process Target Audience Translator execution ${execution.id}`, error);
      
      // Update execution status to FAILED
      await this.workflowExecutionRepository.updateStatus(
        execution.id,
        WorkflowExecutionStatus.FAILED,
        undefined,
        error.message,
        new Date(),
        Date.now() - execution.startTime.getTime(),
      );
      
      throw error;
    }
  }

  /**
   * Handle successful target audience translator workflow
   */
  private async handleTargetAudienceTranslatorSuccess(
    execution: WorkflowExecutionEntity,
    outputData?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Handling target audience translator success for execution ${execution.id}`);

    // Create system notification for successful translation
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

    // Store the generated leads and enrichment schema for potential use in Workflow 1
    // This creates a seamless pipeline from Workflow 0 to Workflow 1
    // Note: This would need to be implemented in a dedicated repository
    this.logger.log(`Target audience translation completed with ${outputData?.leads?.length || 0} leads`);
  }

  /**
   * Determine if execution should be retried
   */
  private shouldRetry(errorMessage?: string): boolean {
    if (!errorMessage) return false;

    const retryableErrors = [
      'timeout',
      'network',
      'rate limit',
      'temporary',
      'service unavailable',
    ];

    return retryableErrors.some(error => 
      errorMessage.toLowerCase().includes(error)
    );
  }

  /**
   * Schedule retry for failed execution
   */
  private async scheduleRetry(execution: WorkflowExecutionEntity): Promise<void> {
    try {
      // Create a new execution record for retry
      await this.workflowExecutionRepository.create({
        workflowId: execution.workflowId,
        leadId: execution.leadId || '',
        companyId: execution.companyId,
        status: WorkflowExecutionStatus.STARTED,
        triggeredBy: `RETRY_${execution.triggeredBy}`,
        startTime: new Date(),
        inputData: execution.inputData || {},
      });

      this.logger.log(`Retry scheduled for execution ${execution.id}`);
    } catch (error) {
      this.logger.error(`Failed to schedule retry for execution ${execution.id}`, error);
    }
  }

  /**
   * Determine if failure is critical
   */
  private isCriticalFailure(errorMessage?: string): boolean {
    if (!errorMessage) return false;

    const criticalErrors = [
      'authentication',
      'authorization',
      'invalid configuration',
      'database',
      'critical',
    ];

    return criticalErrors.some(error => 
      errorMessage.toLowerCase().includes(error)
    );
  }

  /**
   * Alert administrators for critical failures
   */
  private async alertAdministrators(execution: WorkflowExecutionEntity, errorMessage: string): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Failed to alert administrators for execution ${execution.id}`, error);
    }
  }

  /**
   * Trigger workflow execution with retry logic
   */
  async triggerWorkflowWithRetry(
    workflow: WorkflowEntity,
    execution: WorkflowExecutionEntity,
    maxRetries: number = 3,
  ): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        await this.triggerWorkflowExecution(workflow, execution);
        return; // Success, exit retry loop
      } catch (error) {
        attempts++;
        this.logger.warn(`Workflow execution attempt ${attempts} failed for ${execution.id}: ${error.message}`);
        
        if (attempts >= maxRetries) {
          this.logger.error(`Max retries reached for workflow execution ${execution.id}`);
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
} 