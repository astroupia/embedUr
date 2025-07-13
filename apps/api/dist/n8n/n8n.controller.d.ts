import { LeadEventsService } from '../leads/services/lead-events.service';
import { WorkflowExecutionService } from '../workflows/services/workflow-execution.service';
import { WorkflowEventsService } from '../workflows/services/workflow-events.service';
import { LeadRepository } from '../leads/repositories/lead.repository';
import { ReplyRepository } from '../replies/repositories/reply.repository';
import { BookingRepository } from '../replies/repositories/booking.repository';
import { N8nService } from './services/n8n.service';
import { WorkflowCompletionPayloadDto, WorkflowLogPayloadDto, SmartleadReplyPayloadDto, ReplyHandlingCompletionPayloadDto } from './dto/n8n.dto';
export declare class N8nController {
    private readonly leadRepository;
    private readonly replyRepository;
    private readonly bookingRepository;
    private readonly leadEvents;
    private readonly workflowExecutionService;
    private readonly workflowEventsService;
    private readonly n8nService;
    private readonly logger;
    constructor(leadRepository: LeadRepository, replyRepository: ReplyRepository, bookingRepository: BookingRepository, leadEvents: LeadEventsService, workflowExecutionService: WorkflowExecutionService, workflowEventsService: WorkflowEventsService, n8nService: N8nService);
    handleWorkflowCompletion(data: any): Promise<{
        success: boolean;
        error?: string;
    }>;
    handleSmartleadReplyWebhook(data: SmartleadReplyPayloadDto): Promise<{
        success: boolean;
        error?: string;
    }>;
    handleReplyHandlingCompletionWebhook(data: ReplyHandlingCompletionPayloadDto): Promise<{
        success: boolean;
        error?: string;
    }>;
    handleCompletion(data: WorkflowCompletionPayloadDto): Promise<{
        success: boolean;
    }>;
    handleEnrichmentComplete(data: {
        leadId: string;
        companyId: string;
        status: 'SUCCESS' | 'FAILED';
        enrichedData?: Record<string, any>;
        errorMessage?: string;
    }): Promise<{
        success: boolean;
    }>;
    handleLog(data: WorkflowLogPayloadDto): Promise<{
        success: boolean;
    }>;
    handleSmartleadReply(data: SmartleadReplyPayloadDto): Promise<{
        success: boolean;
        error?: string;
    }>;
    handleReplyHandlingCompletion(data: ReplyHandlingCompletionPayloadDto): Promise<{
        success: boolean;
        error?: string;
    }>;
    private findWorkflowExecution;
    private triggerReplyHandlingWorkflow;
    private mapStatus;
    getWebhookEvents(companyId: string, limit?: string): Promise<{
        success: boolean;
        data: any[];
        total: number;
    }>;
    getWebhookEventsBySource(source: string, companyId: string, limit?: string): Promise<{
        success: boolean;
        data: any[];
        total: number;
    }>;
    getNotifications(companyId: string, limit?: string): Promise<{
        success: boolean;
        data: any[];
        total: number;
    }>;
    markNotificationAsRead(id: string, companyId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cleanup(): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getDashboard(companyId: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
