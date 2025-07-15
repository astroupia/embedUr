import { ReplyClassification, ReplySource } from '../constants/reply.constants';
export declare class ReplyEntity {
    readonly id: string;
    readonly content: string;
    readonly classification: ReplyClassification;
    readonly leadId: string;
    readonly emailLogId: string;
    readonly companyId: string;
    readonly handledBy: string | null;
    readonly source: ReplySource;
    readonly metadata: Record<string, any> | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, content: string, classification: ReplyClassification, leadId: string, emailLogId: string, companyId: string, handledBy: string | null, source: ReplySource, metadata: Record<string, any> | null, createdAt: Date, updatedAt: Date);
    get isInterested(): boolean;
    get isNegative(): boolean;
    get isNeutral(): boolean;
    get isAutoReply(): boolean;
    get sentimentScore(): number;
    get requiresAttention(): boolean;
    get summary(): string;
    canBeUpdated(): boolean;
    canBeClassified(): boolean;
    getAgeInHours(): number;
    get isRecent(): boolean;
    get priority(): 'high' | 'medium' | 'low';
}
