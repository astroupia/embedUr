"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nWebhookEventEntity = void 0;
class N8nWebhookEventEntity {
    id;
    source;
    payload;
    companyId;
    receivedAt;
    constructor(id, source, payload, companyId, receivedAt) {
        this.id = id;
        this.source = source;
        this.payload = payload;
        this.companyId = companyId;
        this.receivedAt = receivedAt;
    }
    static create(source, payload, companyId) {
        return {
            source,
            payload,
            companyId,
        };
    }
    getWorkflowType() {
        return this.payload.workflowType || this.payload.workflowName || null;
    }
    getLeadId() {
        return this.payload.leadId || null;
    }
    getWorkflowId() {
        return this.payload.workflowId || null;
    }
    isWorkflowCompletion() {
        return this.payload.status !== undefined;
    }
    isReplyHandling() {
        return this.payload.replyId !== undefined || this.payload.replyContent !== undefined || this.payload.content !== undefined;
    }
    getStatus() {
        return this.payload.status || null;
    }
    getErrorMessage() {
        return this.payload.errorMessage || null;
    }
    getOutputData() {
        return this.payload.outputData || null;
    }
    validatePayload() {
        if (!this.payload.leadId || !this.companyId) {
            return false;
        }
        if (this.isReplyHandling()) {
            if (this.payload.status || this.payload.outputData) {
                return !!this.payload.replyId;
            }
            return !!(this.payload.content || this.payload.replyContent);
        }
        if (this.isWorkflowCompletion()) {
            return !!this.payload.workflowId;
        }
        return true;
    }
    getAuditTrailData() {
        if (this.isWorkflowCompletion()) {
            return {
                action: `WORKFLOW_${this.getStatus()?.toUpperCase() || 'UNKNOWN'}`,
                details: {
                    workflowId: this.getWorkflowId(),
                    workflowType: this.getWorkflowType(),
                    status: this.getStatus(),
                    hasOutputData: !!this.getOutputData(),
                    hasError: !!this.getErrorMessage(),
                },
            };
        }
        if (this.isReplyHandling()) {
            return {
                action: 'REPLY_WEBHOOK_RECEIVED',
                details: {
                    replyId: this.payload.replyId,
                    hasContent: !!this.payload.content,
                },
            };
        }
        return {
            action: 'WEBHOOK_RECEIVED',
            details: {
                source: this.source,
                workflowType: this.getWorkflowType(),
            },
        };
    }
}
exports.N8nWebhookEventEntity = N8nWebhookEventEntity;
//# sourceMappingURL=n8n-webhook-event.entity.js.map