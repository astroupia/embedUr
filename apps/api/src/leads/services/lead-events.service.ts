import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LeadRepository } from '../repositories/lead.repository';
import { WorkflowExecutionService } from '../../workflows/services/workflow-execution.service';
import { WorkflowType, WorkflowExecutionStatus } from '../../workflows/constants/workflow.constants';
import { LeadStatus } from '../constants/lead.constants';
import { firstValueFrom } from 'rxjs';
import { 
  LeadValidationPayloadDto, 
  LeadEnrichmentPayloadDto, 
  EmailDraftingPayloadDto 
} from '../../n8n/dto/n8n.dto';

export interface LeadData {
  id: string;
  fullName: string;
  email: string;
  linkedinUrl?: string;
  companyId: string;
  campaignId: string;
  enrichmentData?: Record<string, any>;
}

@Injectable()
export class LeadEventsService {
  private readonly logger = new Logger(LeadEventsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly leadRepository: LeadRepository,
    private readonly workflowExecutionService: WorkflowExecutionService,
  ) {}

  /**
   * Trigger LinkedIn scraping workflow when a lead with LinkedIn URL is created/updated
   */
  async triggerLinkedInScraping(lead: LeadData): Promise<void> {
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

    // Create workflow execution record
    const workflowId = process.env.N8N_LEAD_VALIDATION_WORKFLOW_ID;
    if (!workflowId) {
      throw new Error('N8N_LEAD_VALIDATION_WORKFLOW_ID environment variable not configured');
    }

    await this.workflowExecutionService.createExecutionRecord({
      workflowId,
      leadId: lead.id,
      companyId: lead.companyId,
      type: WorkflowType.LEAD_ENRICHMENT,
      inputData: payload,
      triggeredBy: 'LeadService',
    });

    // Trigger n8n workflow
    try {
      await firstValueFrom(this.httpService.post(webhookUrl, payload));
      this.logger.log(`LinkedIn scraping workflow triggered successfully for lead ${lead.id}`);
    } catch (error) {
      this.logger.error(`Failed to trigger LinkedIn scraping workflow for lead ${lead.id}:`, error);
      throw error;
    }
  }

  /**
   * Trigger lead enrichment workflow after LinkedIn scraping
   */
  async triggerEnrichment(lead: { id: string; companyId: string }): Promise<void> {
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
      company: (leadData.enrichmentData as any)?.company,
      jobTitle: (leadData.enrichmentData as any)?.jobTitle,
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

    // Create workflow execution record
    const workflowId = process.env.N8N_ENRICHMENT_WORKFLOW_ID;
    if (workflowId) {
      await this.workflowExecutionService.createExecutionRecord({
        workflowId,
        leadId: lead.id,
        companyId: lead.companyId,
        type: WorkflowType.LEAD_ENRICHMENT,
        inputData: payload,
        triggeredBy: 'LeadEventsService',
      });
    } else {
      this.logger.warn('N8N_ENRICHMENT_WORKFLOW_ID not configured, skipping workflow execution record');
    }

    // Trigger n8n workflow
    try {
      await firstValueFrom(this.httpService.post(webhookUrl, payload));
      this.logger.log(`Enrichment workflow triggered successfully for lead ${lead.id}`);
    } catch (error) {
      this.logger.error(`Failed to trigger enrichment workflow for lead ${lead.id}:`, error);
      // Don't throw error in test mode, just log it
      if (process.env.NODE_ENV !== 'test') {
        throw error;
      }
    }
  }

  /**
   * Trigger email drafting and sending workflow after enrichment
   */
  async triggerEmailDrafting(lead: { id: string; companyId: string }): Promise<void> {
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
      company: (leadData.enrichmentData as any)?.company,
      jobTitle: (leadData.enrichmentData as any)?.jobTitle,
      industry: (leadData.enrichmentData as any)?.industry,
      companySize: (leadData.enrichmentData as any)?.companySize,
      emailVerified: (leadData.enrichmentData as any)?.emailVerified,
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

    // Create workflow execution record
    const workflowId = process.env.N8N_EMAIL_SENDING_WORKFLOW_ID;
    if (!workflowId) {
      throw new Error('N8N_EMAIL_SENDING_WORKFLOW_ID environment variable not configured');
    }

    await this.workflowExecutionService.createExecutionRecord({
      workflowId,
      leadId: lead.id,
      companyId: lead.companyId,
      type: WorkflowType.EMAIL_SEQUENCE,
      inputData: payload,
      triggeredBy: 'LeadEventsService',
    });

    // Trigger n8n workflow
    try {
      await firstValueFrom(this.httpService.post(webhookUrl, payload));
      this.logger.log(`Email drafting workflow triggered successfully for lead ${lead.id}`);
    } catch (error) {
      this.logger.error(`Failed to trigger email drafting workflow for lead ${lead.id}:`, error);
      throw error;
    }
  }

  /**
   * Log lead execution events
   */
  async logExecution(lead: any, action: string, changes: Record<string, any>): Promise<void> {
    await this.leadRepository.createAuditTrail(lead.id, action, changes, lead.companyId);
  }

  /**
   * Trigger status change workflow
   */
  async triggerStatusChangeWorkflow(lead: any, previousStatus: string): Promise<void> {
    this.logger.log(`Triggering status change workflow for lead ${lead.id}: ${previousStatus} -> ${lead.status}`);
    
    // This could trigger different workflows based on status change
    // For now, we'll just log the status change
    await this.logExecution(lead, 'STATUS_CHANGED', {
      previousStatus,
      newStatus: lead.status,
    });
  }

  /**
   * Handle workflow completion and chain to next workflow
   */
  async handleWorkflowCompletion(data: {
    workflowId: string;
    leadId: string;
    companyId: string;
    status: WorkflowExecutionStatus;
    outputData?: Record<string, any>;
    errorMessage?: string;
  }): Promise<void> {
    this.logger.log(`Handling workflow completion for lead ${data.leadId}, workflow ${data.workflowId}`);

    // Find workflow execution by lead and workflow
    const executions = await this.workflowExecutionService.findPendingExecutions(data.leadId, data.companyId);
    const execution = executions.find(e => e.workflowId === data.workflowId);
    
    if (!execution) {
      this.logger.error(`No pending workflow execution found for workflow ${data.workflowId}`);
      return;
    }

    // Update workflow execution status
    await this.workflowExecutionService.updateExecutionStatus(
      execution.id,
      data.status,
      data.outputData,
      data.errorMessage,
    );

    if (data.status === WorkflowExecutionStatus.SUCCESS && data.outputData) {
      // Handle successful workflow completion based on workflow type
      await this.handleSuccessfulWorkflow(execution, data.outputData);
    } else if (data.status === WorkflowExecutionStatus.FAILED) {
      // Handle failed workflow
      await this.handleFailedWorkflow(execution, data.errorMessage);
    }
  }

  /**
   * Handle successful workflow completion
   */
  private async handleSuccessfulWorkflow(
    execution: any,
    outputData: Record<string, any>,
  ): Promise<void> {
    const workflowName = execution.workflow?.name || 'Unknown';

    switch (workflowName) {
      case 'Lead Validation and LinkedIn Scraping':
        await this.handleLinkedInScrapingSuccess(execution.leadId, outputData);
        // Chain to enrichment workflow
        await this.triggerEnrichment({ id: execution.leadId, companyId: execution.companyId });
        break;

      case 'Lead Enrichment and Verification':
        await this.handleEnrichmentSuccess(execution.leadId, outputData);
        // Chain to email drafting workflow
        await this.triggerEmailDrafting({ id: execution.leadId, companyId: execution.companyId });
        break;

      case 'Email Drafting and Smartlead Sending':
        await this.handleEmailSendingSuccess(execution.leadId, outputData);
        // No further chaining - workflow complete
        break;

      default:
        this.logger.warn(`Unknown workflow type: ${workflowName}`);
    }
  }

  /**
   * Handle LinkedIn scraping success
   */
  private async handleLinkedInScrapingSuccess(leadId: string, outputData: Record<string, any>): Promise<void> {
    // Get the lead to get companyId
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

  /**
   * Handle enrichment success
   */
  private async handleEnrichmentSuccess(leadId: string, outputData: Record<string, any>): Promise<void> {
    // Get the lead to get companyId
    const lead = await this.leadRepository.findOne(leadId, outputData.companyId);
    
    await this.leadRepository.update(leadId, lead.companyId, {
      enrichmentData: {
        ...outputData,
        enrichedAt: new Date().toISOString(),
      },
      verified: outputData.emailVerified || false,
    });

    // Create enrichment request record
    await this.leadRepository.createEnrichmentRequest(leadId, {
      companyId: outputData.companyId,
      provider: 'CLEARBIT', // Example
      requestData: outputData,
    });

    this.logger.log(`Enrichment completed for lead ${leadId}`);
  }

  /**
   * Handle email sending success
   */
  private async handleEmailSendingSuccess(leadId: string, outputData: Record<string, any>): Promise<void> {
    // Create email log
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

    // Update lead status
    const lead = await this.leadRepository.findOne(leadId, outputData.companyId);
    await this.leadRepository.update(leadId, lead.companyId, { status: LeadStatus.CONTACTED });

    this.logger.log(`Email sent successfully for lead ${leadId}`);
  }

  /**
   * Handle failed workflow
   */
  private async handleFailedWorkflow(execution: any, errorMessage?: string): Promise<void> {
    this.logger.error(`Workflow failed for lead ${execution.leadId}: ${errorMessage}`);

    // Create system notification
    await this.leadRepository.createSystemNotification(
      `Workflow failed for lead ${execution.leadId}: ${errorMessage}`,
      'ERROR',
      execution.companyId
    );

    // Update lead status if needed
    if (execution.workflow?.type === WorkflowType.EMAIL_SEQUENCE) {
      const lead = await this.leadRepository.findOne(execution.leadId, execution.companyId);
      await this.leadRepository.update(execution.leadId, lead.companyId, { status: LeadStatus.NEW });
    }
  }

  /**
   * Trigger Lead Validation and LinkedIn Scraping workflow
   */
  async triggerLeadValidationWorkflow(leadId: string, companyId: string): Promise<void> {
    const webhookUrl = process.env.N8N_LEAD_VALIDATION_WEBHOOK;
    if (!webhookUrl) {
      this.logger.warn('N8N_LEAD_VALIDATION_WEBHOOK not configured, skipping lead validation');
      return;
    }

    // Get lead data
    const lead = await this.leadRepository.findOneWithCampaign(leadId, companyId);

    const payload: LeadValidationPayloadDto = {
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

    // Create workflow execution record
    const workflowId = process.env.N8N_LEAD_VALIDATION_WORKFLOW_ID;
    if (!workflowId) {
      this.logger.warn('N8N_LEAD_VALIDATION_WORKFLOW_ID not configured, skipping lead validation');
      return;
    }

    await this.workflowExecutionService.createExecutionRecord({
      workflowId,
      leadId,
      companyId,
      type: 'LEAD_ENRICHMENT' as any,
      inputData: payload,
      triggeredBy: 'LeadEventsService',
    });

    // Trigger n8n workflow
    try {
      const { HttpService } = await import('@nestjs/axios');
      const httpService = new HttpService();
      const { firstValueFrom } = await import('rxjs');
      
      await firstValueFrom(httpService.post(webhookUrl, payload));
      this.logger.log(`Lead validation workflow triggered successfully for lead ${leadId}`);
    } catch (error) {
      this.logger.error(`Failed to trigger lead validation workflow for lead ${leadId}:`, error);
    }
  }

  /**
   * Trigger Lead Enrichment and Verification workflow
   */
  async triggerLeadEnrichmentWorkflow(leadId: string, companyId: string): Promise<void> {
    const webhookUrl = process.env.N8N_LEAD_ENRICHMENT_WEBHOOK;
    if (!webhookUrl) {
      this.logger.warn('N8N_LEAD_ENRICHMENT_WEBHOOK not configured, skipping lead enrichment');
      return;
    }

    // Get lead data
    const lead = await this.leadRepository.findOneWithCampaign(leadId, companyId);

    const payload: LeadEnrichmentPayloadDto = {
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

    // Create workflow execution record
    const workflowId = process.env.N8N_LEAD_ENRICHMENT_WORKFLOW_ID;
    if (!workflowId) {
      this.logger.warn('N8N_LEAD_ENRICHMENT_WORKFLOW_ID not configured, skipping lead enrichment');
      return;
    }

    await this.workflowExecutionService.createExecutionRecord({
      workflowId,
      leadId,
      companyId,
      type: 'LEAD_ENRICHMENT' as any,
      inputData: payload,
      triggeredBy: 'LeadEventsService',
    });

    // Trigger n8n workflow
    try {
      const { HttpService } = await import('@nestjs/axios');
      const httpService = new HttpService();
      const { firstValueFrom } = await import('rxjs');
      
      await firstValueFrom(httpService.post(webhookUrl, payload));
      this.logger.log(`Lead enrichment workflow triggered successfully for lead ${leadId}`);
    } catch (error) {
      this.logger.error(`Failed to trigger lead enrichment workflow for lead ${leadId}:`, error);
    }
  }

  /**
   * Trigger Email Drafting and Smartlead Sending workflow
   */
  async triggerEmailDraftingWorkflow(leadId: string, companyId: string): Promise<void> {
    const webhookUrl = process.env.N8N_EMAIL_DRAFTING_WEBHOOK;
    if (!webhookUrl) {
      this.logger.warn('N8N_EMAIL_DRAFTING_WEBHOOK not configured, skipping email drafting');
      return;
    }

    // Get lead data with campaign and AI persona
    const lead = await this.leadRepository.findOneWithCampaignAndAiPersona(leadId, companyId);

    if (!lead.campaign?.aiPersona) {
      throw new Error(`No AI persona configured for campaign ${lead.campaignId}`);
    }

    const payload: EmailDraftingPayloadDto = {
      leadId: lead.id,
      fullName: lead.fullName,
      email: lead.email,
      linkedinUrl: lead.linkedinUrl || undefined,
      enrichmentData: lead.enrichmentData as Record<string, any> || undefined,
      companyId: lead.companyId,
      campaignId: lead.campaignId,
      aiPersona: {
        id: lead.campaign.aiPersona.id,
        name: lead.campaign.aiPersona.name,
        description: lead.campaign.aiPersona.description || undefined,
        prompt: lead.campaign.aiPersona.prompt,
        parameters: lead.campaign.aiPersona.parameters as Record<string, any> || undefined,
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

    // Create workflow execution record
    const workflowId = process.env.N8N_EMAIL_DRAFTING_WORKFLOW_ID;
    if (!workflowId) {
      this.logger.warn('N8N_EMAIL_DRAFTING_WORKFLOW_ID not configured, skipping email drafting');
      return;
    }

    await this.workflowExecutionService.createExecutionRecord({
      workflowId,
      leadId,
      companyId,
      type: 'EMAIL_SEQUENCE' as any,
      inputData: payload,
      triggeredBy: 'LeadEventsService',
    });

    // Trigger n8n workflow
    try {
      const { HttpService } = await import('@nestjs/axios');
      const httpService = new HttpService();
      const { firstValueFrom } = await import('rxjs');
      
      await firstValueFrom(httpService.post(webhookUrl, payload));
      this.logger.log(`Email drafting workflow triggered successfully for lead ${leadId}`);
    } catch (error) {
      this.logger.error(`Failed to trigger email drafting workflow for lead ${leadId}:`, error);
    }
  }
} 