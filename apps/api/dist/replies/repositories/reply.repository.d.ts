import { PrismaService } from '../../prisma/prisma.service';
import { ReplyEntity } from '../entities/reply.entity';
import { CreateReplyDto, UpdateReplyDto, ReplyQueryDto } from '../dto/reply.dto';
import { $Enums } from '../../../generated/prisma';
export declare class ReplyRepository {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateReplyDto, companyId: string): Promise<ReplyEntity>;
    findOne(id: string, companyId: string): Promise<ReplyEntity | null>;
    findWithCursor(companyId: string, query: ReplyQueryDto): Promise<{
        data: ReplyEntity[];
        nextCursor: string | null;
    }>;
    update(id: string, companyId: string, dto: UpdateReplyDto): Promise<ReplyEntity>;
    updateWithWorkflowData(id: string, companyId: string, workflowData: any): Promise<ReplyEntity>;
    remove(id: string, companyId: string): Promise<void>;
    findByLead(leadId: string, companyId: string): Promise<ReplyEntity[]>;
    findByEmailLog(emailLogId: string, companyId: string): Promise<ReplyEntity[]>;
    findByClassification(classification: $Enums.ReplyClassification, companyId: string): Promise<ReplyEntity[]>;
    findRequiringAttention(companyId: string): Promise<ReplyEntity[]>;
    findRecent(companyId: string, days?: number): Promise<ReplyEntity[]>;
    countByCompany(companyId: string): Promise<number>;
    countByClassification(classification: $Enums.ReplyClassification, companyId: string): Promise<number>;
    countRecent(companyId: string, days?: number): Promise<number>;
    getStats(companyId: string): Promise<any>;
    private getClassificationStats;
    findEmailLogByLeadAndEmailId(leadId: string, emailId: string, companyId: string): Promise<any>;
    createFromWebhook(data: {
        leadId: string;
        emailLogId: string;
        companyId: string;
        content: string;
        classification?: $Enums.ReplyClassification;
        handledBy?: string;
    }): Promise<ReplyEntity>;
    updateClassification(id: string, companyId: string, classification: $Enums.ReplyClassification, handledBy: string): Promise<ReplyEntity>;
}
