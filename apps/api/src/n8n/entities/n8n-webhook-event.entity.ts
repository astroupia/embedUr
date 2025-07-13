import { $Enums } from '../../../generated/prisma';

export class N8nWebhookEventEntity {
  constructor(
    public readonly id: string,
    public readonly source: $Enums.WebhookSource,
    public readonly payload: Record<string, any>,
    public readonly companyId: string,
    public readonly receivedAt: Date,
  ) {}

  static create(
    source: $Enums.WebhookSource,
    payload: Record<string, any>,
    companyId: string,
  ): {
    source: $Enums.WebhookSource;
    payload: Record<string, any>;
    companyId: string;
  } {
    return {
      source,
      payload,
      companyId,
    };
  }

  /**
   * Get workflow type from payload
   */
  getWorkflowType(): string | null {
    return this.payload.workflowType || this.payload.workflowName || null;
  }

  /**
   * Get lead ID from payload
   */
  getLeadId(): string | null {
    return this.payload.leadId || null;
  }

  /**
   * Get workflow ID from payload
   */
  getWorkflowId(): string | null {
    return this.payload.workflowId || null;
  }

  /**
   * Check if webhook is for workflow completion
   */
  isWorkflowCompletion(): boolean {
    return this.payload.status !== undefined;
  }

  /**
   * Check if webhook is for reply handling
   */
  isReplyHandling(): boolean {
    return this.payload.replyId !== undefined || this.payload.replyContent !== undefined || this.payload.content !== undefined;
  }

  /**
   * Get status from payload
   */
  getStatus(): string | null {
    return this.payload.status || null;
  }

  /**
   * Get error message from payload
   */
  getErrorMessage(): string | null {
    return this.payload.errorMessage || null;
  }

  /**
   * Get output data from payload
   */
  getOutputData(): Record<string, any> | null {
    return this.payload.outputData || null;
  }

  /**
   * Validate webhook payload structure
   */
  validatePayload(): boolean {
    // All webhooks need leadId in payload and companyId in entity
    if (!this.payload.leadId || !this.companyId) {
      return false;
    }

    // Reply handling webhooks need additional fields
    if (this.isReplyHandling()) {
      // For reply completion webhooks, replyId is sufficient
      if (this.payload.status || this.payload.outputData) {
        return !!this.payload.replyId;
      }
      // For reply creation webhooks, need content (either content or replyContent)
      return !!(this.payload.content || this.payload.replyContent);
    }

    // Workflow completion webhooks need workflowId (but it can be either n8n workflow ID or actual workflow ID)
    if (this.isWorkflowCompletion()) {
      return !!this.payload.workflowId;
    }

    // For other webhooks (enrichment completion, logs), leadId and companyId are sufficient
    return true;
  }

  /**
   * Get audit trail data
   */
  getAuditTrailData(): {
    action: string;
    details: Record<string, any>;
  } {
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