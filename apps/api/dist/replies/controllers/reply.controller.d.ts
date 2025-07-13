import { ReplyService } from '../services/reply.service';
import { CreateReplyDto, UpdateReplyDto, ReplyQueryDto, ReplyResponseDto, ReplyStatsDto } from '../dto/reply.dto';
import { $Enums } from '../../../generated/prisma';
export declare class ReplyController {
    private readonly replyService;
    private readonly logger;
    constructor(replyService: ReplyService);
    markAsHandled(id: string, user: any): Promise<ReplyResponseDto>;
    classifyReply(id: string, body: {
        classification: $Enums.ReplyClassification;
    }, user: any): Promise<ReplyResponseDto>;
    create(dto: CreateReplyDto, user: any): Promise<ReplyResponseDto>;
    findAll(query: ReplyQueryDto, user: any): Promise<{
        data: ReplyResponseDto[];
        nextCursor: string | null;
    }>;
    findByLead(leadId: string, user: any): Promise<ReplyResponseDto[]>;
    findByEmailLog(emailLogId: string, user: any): Promise<ReplyResponseDto[]>;
    findByClassification(classification: $Enums.ReplyClassification, user: any): Promise<ReplyResponseDto[]>;
    findRequiringAttention(user: any): Promise<ReplyResponseDto[]>;
    getStats(user: any): Promise<ReplyStatsDto>;
    getReplyPriority(id: string, user: any): Promise<{
        priority: 'high' | 'medium' | 'low';
    }>;
    findOne(id: string, user: any): Promise<ReplyResponseDto>;
    update(id: string, dto: UpdateReplyDto, user: any): Promise<ReplyResponseDto>;
    remove(id: string, user: any): Promise<void>;
}
