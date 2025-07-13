import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowExecutionService } from '../../workflows/services/workflow-execution.service';
import { CampaignEntity } from '../entities/campaign.entity';
import { CampaignStatus } from '../constants/campaign.constants';
export declare class CampaignEventsService {
    private readonly httpService;
    private readonly prisma;
    private readonly workflowExecutionService;
    private readonly logger;
    constructor(httpService: HttpService, prisma: PrismaService, workflowExecutionService: WorkflowExecutionService);
    triggerCampaignActivation(campaign: CampaignEntity): Promise<void>;
    triggerCampaignPause(campaign: CampaignEntity): Promise<void>;
    triggerCampaignCompletion(campaign: CampaignEntity): Promise<void>;
    triggerStatusChangeWorkflow(campaign: CampaignEntity, previousStatus: CampaignStatus): Promise<void>;
    logExecution(campaign: CampaignEntity, action: string, metadata?: Record<string, any>): Promise<void>;
    triggerLeadAssignment(campaign: CampaignEntity, leadId: string, leadData: any): Promise<void>;
    triggerAnalyticsUpdate(campaign: CampaignEntity): Promise<void>;
}
