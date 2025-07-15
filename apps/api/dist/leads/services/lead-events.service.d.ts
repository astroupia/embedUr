import { HttpService } from '@nestjs/axios';
import { LeadRepository } from '../repositories/lead.repository';
import { WorkflowExecutionService } from '../../workflows/services/workflow-execution.service';
import { WorkflowExecutionStatus } from '../../workflows/constants/workflow.constants';
export interface LeadData {
    id: string;
    fullName: string;
    email: string;
    linkedinUrl?: string;
    companyId: string;
    campaignId: string;
    enrichmentData?: Record<string, any>;
}
export declare class LeadEventsService {
    private readonly httpService;
    private readonly leadRepository;
    private readonly workflowExecutionService;
    private readonly logger;
    constructor(httpService: HttpService, leadRepository: LeadRepository, workflowExecutionService: WorkflowExecutionService);
    triggerLinkedInScraping(lead: LeadData): Promise<void>;
    triggerEnrichment(lead: {
        id: string;
        companyId: string;
    }): Promise<void>;
    triggerEmailDrafting(lead: {
        id: string;
        companyId: string;
    }): Promise<void>;
    logExecution(lead: any, action: string, changes: Record<string, any>): Promise<void>;
    triggerStatusChangeWorkflow(lead: any, previousStatus: string): Promise<void>;
    handleWorkflowCompletion(data: {
        workflowId: string;
        leadId: string;
        companyId: string;
        status: WorkflowExecutionStatus;
        outputData?: Record<string, any>;
        errorMessage?: string;
    }): Promise<void>;
    private handleSuccessfulWorkflow;
    private handleLinkedInScrapingSuccess;
    private handleEnrichmentSuccess;
    private handleEmailSendingSuccess;
    private handleFailedWorkflow;
    triggerLeadValidationWorkflow(leadId: string, companyId: string): Promise<void>;
    triggerLeadEnrichmentWorkflow(leadId: string, companyId: string): Promise<void>;
    triggerEmailDraftingWorkflow(leadId: string, companyId: string): Promise<void>;
}
