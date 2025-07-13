import { ReplyClassification, ReplySource } from '../constants/reply.constants';

export class ReplyEntity {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly classification: ReplyClassification,
    public readonly leadId: string,
    public readonly emailLogId: string,
    public readonly companyId: string,
    public readonly handledBy: string | null,
    public readonly source: ReplySource,
    public readonly metadata: Record<string, any> | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Check if reply indicates interest
   */
  get isInterested(): boolean {
    return this.classification === ReplyClassification.INTERESTED;
  }

  /**
   * Check if reply is negative
   */
  get isNegative(): boolean {
    return this.classification === ReplyClassification.NOT_INTERESTED || 
           this.classification === ReplyClassification.UNSUBSCRIBE;
  }

  /**
   * Check if reply is neutral or requires follow-up
   */
  get isNeutral(): boolean {
    return this.classification === ReplyClassification.NEUTRAL || 
           this.classification === ReplyClassification.QUESTION;
  }

  /**
   * Check if reply is an auto-reply
   */
  get isAutoReply(): boolean {
    return this.classification === ReplyClassification.AUTO_REPLY;
  }

  /**
   * Get reply sentiment score (1 = positive, 0 = neutral, -1 = negative)
   */
  get sentimentScore(): number {
    switch (this.classification) {
      case ReplyClassification.INTERESTED:
        return 1;
      case ReplyClassification.NOT_INTERESTED:
      case ReplyClassification.UNSUBSCRIBE:
        return -1;
      default:
        return 0;
    }
  }

  /**
   * Check if reply requires immediate attention
   */
  get requiresAttention(): boolean {
    return this.isInterested || this.classification === ReplyClassification.QUESTION;
  }

  /**
   * Get reply summary for display
   */
  get summary(): string {
    const maxLength = 100;
    if (this.content.length <= maxLength) {
      return this.content;
    }
    return this.content.substring(0, maxLength) + '...';
  }

  /**
   * Check if reply can be updated
   */
  canBeUpdated(): boolean {
    // Replies can be updated if they haven't been handled yet
    return !this.handledBy;
  }

  /**
   * Check if reply can be classified
   */
  canBeClassified(): boolean {
    // Replies can be classified if they don't have a classification yet
    return !this.classification || this.classification === ReplyClassification.NEUTRAL;
  }

  /**
   * Get reply age in hours
   */
  getAgeInHours(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  /**
   * Check if reply is recent (within last 24 hours)
   */
  get isRecent(): boolean {
    return this.getAgeInHours() < 24;
  }

  /**
   * Get reply priority for handling
   */
  get priority(): 'high' | 'medium' | 'low' {
    if (this.isInterested) return 'high';
    if (this.classification === ReplyClassification.QUESTION) return 'medium';
    return 'low';
  }
} 