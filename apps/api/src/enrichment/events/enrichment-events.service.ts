import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
import { EnrichmentProvider, EnrichmentStatus } from '../constants/enrichment.constants';
import { AuditTrailService } from '../../workflows/services/audit-trail.service';

@Injectable()
export class EnrichmentEventsService {
  private readonly logger = new Logger(EnrichmentEventsService.name);

  constructor(private readonly auditTrailService: AuditTrailService) {}

  /**
   * Log enrichment request creation
   */
  async logEnrichmentRequest(
    enrichment: EnrichmentRequestEntity,
    triggeredBy: string,
  ): Promise<void> {
    this.logger.log(`Enrichment request created: ${enrichment.id} for lead ${enrichment.leadId} by ${triggeredBy}`);
    
    // Add audit trail logging
    await this.auditTrailService.logEnrichmentEvent(
      enrichment.id,
      'ENRICHMENT_REQUESTED',
      enrichment.companyId,
      triggeredBy,
      {
        provider: enrichment.provider,
        leadId: enrichment.leadId,
      },
    );
  }

  /**
   * Log enrichment completion
   */
  async logEnrichmentCompletion(
    enrichment: EnrichmentRequestEntity,
    success: boolean,
  ): Promise<void> {
    const action = success ? 'ENRICHMENT_COMPLETED' : 'ENRICHMENT_FAILED';
    
    this.logger.log(`Enrichment ${action}: ${enrichment.id} for lead ${enrichment.leadId}`);
    
    // Add audit trail logging
    await this.auditTrailService.logEnrichmentEvent(
      enrichment.id,
      action,
      enrichment.companyId,
      undefined,
      {
        status: enrichment.status,
        durationMs: enrichment.durationMs,
        errorMessage: enrichment.errorMessage,
      },
    );
  }

  /**
   * Log enrichment retry
   */
  async logEnrichmentRetry(
    enrichment: EnrichmentRequestEntity,
    retryCount: number,
  ): Promise<void> {
    this.logger.log(`Enrichment retry ${retryCount}: ${enrichment.id} for lead ${enrichment.leadId}`);
    
    // Add audit trail logging
    await this.auditTrailService.logEnrichmentEvent(
      enrichment.id,
      'ENRICHMENT_RETRY',
      enrichment.companyId,
      undefined,
      {
        retryCount,
        provider: enrichment.provider,
      },
    );
  }

  /**
   * Send system notification for enrichment failures
   */
  async notifyEnrichmentFailure(
    enrichment: EnrichmentRequestEntity,
    error: string,
  ): Promise<void> {
    this.logger.warn(`Enrichment failure notification: ${enrichment.id} - ${error}`);
    
    // TODO: Add system notification
    // await this.notificationService.create({
    //   message: `Enrichment failed for lead ${enrichment.leadId} using ${enrichment.providerName}: ${error}`,
    //   level: 'WARNING',
    //   companyId: enrichment.companyId,
    // });
  }

  /**
   * Send system notification for provider unavailability
   */
  async notifyProviderUnavailable(
    provider: EnrichmentProvider,
    companyId: string,
  ): Promise<void> {
    this.logger.warn(`Provider unavailable notification: ${provider} for company ${companyId}`);
    
    // TODO: Add system notification
    // await this.notificationService.create({
    //   message: `Enrichment provider ${provider} is currently unavailable`,
    //   level: 'WARNING',
    //   companyId,
    // });
  }

  /**
   * Log enrichment statistics
   */
  async logEnrichmentStats(
    companyId: string,
    stats: {
      total: number;
      successful: number;
      failed: number;
      pending: number;
    },
  ): Promise<void> {
    this.logger.log(`Enrichment stats for company ${companyId}:`, stats);
    
    // TODO: Add usage metrics
    // await this.usageMetricService.record({
    //   metricName: 'enrichment_requests',
    //   count: stats.total,
    //   period: 'daily',
    //   companyId,
    // });
  }

  /**
   * Log lead data update after successful enrichment
   */
  async logLeadDataUpdate(
    leadId: string,
    companyId: string,
    updatedFields: string[],
    enrichmentId: string,
  ): Promise<void> {
    this.logger.log(`Lead data updated: ${leadId} with fields: ${updatedFields.join(', ')} via enrichment ${enrichmentId}`);
    
    // Add audit trail logging
    await this.auditTrailService.log({
      entity: 'Lead',
      entityId: leadId,
      action: 'LEAD_ENRICHED',
      companyId,
      changes: {
        updatedFields,
        enrichmentId,
      },
    });
  }

  /**
   * Log workflow completion event
   */
  async logWorkflowCompletion(
    leadId: string,
    companyId: string,
    workflowName: string,
    success: boolean,
    outputData?: Record<string, any>,
    errorMessage?: string,
  ): Promise<void> {
    const action = success ? 'WORKFLOW_COMPLETED' : 'WORKFLOW_FAILED';
    
    this.logger.log(`Workflow ${action}: ${workflowName} for lead ${leadId}`);
    
    // Add audit trail logging
    await this.auditTrailService.log({
      entity: 'Lead',
      entityId: leadId,
      action,
      companyId,
      changes: {
        workflowName,
        success,
        outputData,
        errorMessage,
      },
    });
  }

  /**
   * Trigger next workflow in sequence
   */
  async triggerNextWorkflow(
    leadId: string,
    companyId: string,
    currentWorkflow: string,
  ): Promise<void> {
    this.logger.log(`Triggering next workflow for lead ${leadId} after ${currentWorkflow}`);
    
    // TODO: Implement workflow chaining logic
    // await this.workflowOrchestratorService.triggerNextWorkflow(
    //   leadId,
    //   companyId,
    //   currentWorkflow,
    // );
  }
} 