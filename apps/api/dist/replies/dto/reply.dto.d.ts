import { ReplyClassification, ReplySource } from '../constants/reply.constants';
import { $Enums } from '../../../generated/prisma';
export declare class CreateReplyDto {
    content: string;
    leadId: string;
    emailLogId: string;
    source?: ReplySource;
    metadata?: Record<string, any>;
}
export declare class UpdateReplyDto {
    content?: string;
    classification?: $Enums.ReplyClassification;
    handledBy?: string;
    metadata?: Record<string, any>;
}
export declare class ReplyResponseDto {
    id: string;
    content: string;
    classification: ReplyClassification;
    leadId: string;
    emailLogId: string;
    companyId: string;
    handledBy: string | null;
    source: ReplySource;
    metadata: Record<string, any> | null;
    createdAt: Date;
    updatedAt: Date;
    isInterested: boolean;
    isNegative: boolean;
    isNeutral: boolean;
    isAutoReply: boolean;
    sentimentScore: number;
    requiresAttention: boolean;
    summary: string;
    priority: 'high' | 'medium' | 'low';
    isRecent: boolean;
}
export declare class ReplyStatsDto {
    total: number;
    byClassification: Record<ReplyClassification, number>;
    bySource: Record<ReplySource, number>;
    recentCount: number;
    averageResponseTime: number;
    positiveRate: number;
}
export declare class ReplyQueryDto {
    leadId?: string;
    emailLogId?: string;
    classification?: ReplyClassification;
    source?: ReplySource;
    requiresAttention?: boolean;
    recent?: boolean;
    cursor?: string;
    limit?: number;
}
