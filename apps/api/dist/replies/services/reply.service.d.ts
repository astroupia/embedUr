import { ReplyRepository } from '../repositories/reply.repository';
import { LeadEventsService } from '../../leads/services/lead-events.service';
import { CreateReplyDto, UpdateReplyDto, ReplyQueryDto, ReplyResponseDto, ReplyStatsDto } from '../dto/reply.dto';
import { $Enums } from '../../../generated/prisma';
export declare class ReplyService {
    private readonly replyRepository;
    private readonly leadEvents;
    private readonly logger;
    constructor(replyRepository: ReplyRepository, leadEvents: LeadEventsService);
    create(createDto: CreateReplyDto, companyId: string): Promise<ReplyResponseDto>;
    findAll(companyId: string, query: ReplyQueryDto): Promise<{
        data: ReplyResponseDto[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<ReplyResponseDto>;
    update(id: string, companyId: string, updateDto: UpdateReplyDto): Promise<ReplyResponseDto>;
    remove(id: string, companyId: string): Promise<void>;
    findByLead(leadId: string, companyId: string): Promise<ReplyResponseDto[]>;
    findByEmailLog(emailLogId: string, companyId: string): Promise<ReplyResponseDto[]>;
    findByClassification(classification: $Enums.ReplyClassification, companyId: string): Promise<ReplyResponseDto[]>;
    findRequiringAttention(companyId: string): Promise<ReplyResponseDto[]>;
    getStats(companyId: string): Promise<ReplyStatsDto>;
    handleWorkflowCompletion(workflowData: {
        replyId: string;
        companyId: string;
        replySentiment: $Enums.ReplyClassification;
        meetingLink?: string;
        metadata?: Record<string, any>;
    }): Promise<void>;
    private triggerReplyClassification;
    private createBookingFromReply;
    classifyReply(id: string, companyId: string, classification: $Enums.ReplyClassification, handledBy: string): Promise<ReplyResponseDto>;
    getReplyPriority(replyId: string, companyId: string): Promise<'high' | 'medium' | 'low'>;
    markAsHandled(id: string, companyId: string, handledBy: string): Promise<ReplyResponseDto>;
}
