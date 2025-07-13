import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../../admin/admin.repository';

export interface AuditTrailLogData {
  entity: string;
  entityId: string;
  action: string;
  performedById?: string;
  companyId: string;
  changes?: Record<string, any>;
}

@Injectable()
export class AuditTrailService {
  constructor(private readonly adminRepository: AdminRepository) {}

  /**
   * Log an audit trail entry
   */
  async log(data: AuditTrailLogData): Promise<void> {
    try {
      await this.adminRepository.createActionLog({
        action: data.action,
        targetType: data.entity,
        targetId: data.entityId,
        performedBy: data.performedById || process.env.SYSTEM_USER_ID || 'system',
        details: {
          companyId: data.companyId,
          changes: data.changes,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to log audit trail entry:', error);
    }
  }

  /**
   * Log workflow-related events
   */
  async logWorkflowEvent(
    workflowId: string,
    action: string,
    companyId: string,
    performedById?: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      entity: 'Workflow',
      entityId: workflowId,
      action,
      performedById,
      companyId,
      changes: details,
    });
  }

  /**
   * Log workflow execution events
   */
  async logWorkflowExecutionEvent(
    executionId: string,
    action: string,
    companyId: string,
    performedById?: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      entity: 'WorkflowExecution',
      entityId: executionId,
      action,
      performedById,
      companyId,
      changes: details,
    });
  }

  /**
   * Log target audience translator events
   */
  async logTargetAudienceTranslatorEvent(
    translationId: string,
    action: string,
    companyId: string,
    performedById?: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      entity: 'TargetAudienceTranslator',
      entityId: translationId,
      action,
      performedById,
      companyId,
      changes: details,
    });
  }

  /**
   * Log enrichment events
   */
  async logEnrichmentEvent(
    enrichmentId: string,
    action: string,
    companyId: string,
    performedById?: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      entity: 'EnrichmentRequest',
      entityId: enrichmentId,
      action,
      performedById,
      companyId,
      changes: details,
    });
  }
} 