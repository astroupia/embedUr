"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyEntity = void 0;
const reply_constants_1 = require("../constants/reply.constants");
class ReplyEntity {
    id;
    content;
    classification;
    leadId;
    emailLogId;
    companyId;
    handledBy;
    source;
    metadata;
    createdAt;
    updatedAt;
    constructor(id, content, classification, leadId, emailLogId, companyId, handledBy, source, metadata, createdAt, updatedAt) {
        this.id = id;
        this.content = content;
        this.classification = classification;
        this.leadId = leadId;
        this.emailLogId = emailLogId;
        this.companyId = companyId;
        this.handledBy = handledBy;
        this.source = source;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    get isInterested() {
        return this.classification === reply_constants_1.ReplyClassification.INTERESTED;
    }
    get isNegative() {
        return this.classification === reply_constants_1.ReplyClassification.NOT_INTERESTED ||
            this.classification === reply_constants_1.ReplyClassification.UNSUBSCRIBE;
    }
    get isNeutral() {
        return this.classification === reply_constants_1.ReplyClassification.NEUTRAL ||
            this.classification === reply_constants_1.ReplyClassification.QUESTION;
    }
    get isAutoReply() {
        return this.classification === reply_constants_1.ReplyClassification.AUTO_REPLY;
    }
    get sentimentScore() {
        switch (this.classification) {
            case reply_constants_1.ReplyClassification.INTERESTED:
                return 1;
            case reply_constants_1.ReplyClassification.NOT_INTERESTED:
            case reply_constants_1.ReplyClassification.UNSUBSCRIBE:
                return -1;
            default:
                return 0;
        }
    }
    get requiresAttention() {
        return this.isInterested || this.classification === reply_constants_1.ReplyClassification.QUESTION;
    }
    get summary() {
        const maxLength = 100;
        if (this.content.length <= maxLength) {
            return this.content;
        }
        return this.content.substring(0, maxLength) + '...';
    }
    canBeUpdated() {
        return !this.handledBy;
    }
    canBeClassified() {
        return !this.classification || this.classification === reply_constants_1.ReplyClassification.NEUTRAL;
    }
    getAgeInHours() {
        const now = new Date();
        const diffMs = now.getTime() - this.createdAt.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60));
    }
    get isRecent() {
        return this.getAgeInHours() < 24;
    }
    get priority() {
        if (this.isInterested)
            return 'high';
        if (this.classification === reply_constants_1.ReplyClassification.QUESTION)
            return 'medium';
        return 'low';
    }
}
exports.ReplyEntity = ReplyEntity;
//# sourceMappingURL=reply.entity.js.map