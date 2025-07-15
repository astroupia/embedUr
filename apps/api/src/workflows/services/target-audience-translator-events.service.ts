import { Injectable, Logger } from '@nestjs/common';
import { TargetAudienceTranslatorEntity } from '../entities/target-audience-translator.entity';
import { AuditTrailService } from './audit-trail.service';

@Injectable()
export class TargetAudienceTranslatorEventsService {
  private readonly logger = new Logger(TargetAudienceTranslatorEventsService.name);

  constructor(private readonly auditTrailService: AuditTrailService) {}

  /**
   * Log target audience translator creation
   */
  async logCreation(
    translation: TargetAudienceTranslatorEntity,
    details: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Target audience translator created: ${translation.id} for company ${translation.companyId}`);
    
    // Add audit trail logging
    await this.auditTrailService.logTargetAudienceTranslatorEvent(
      translation.id,
      'TARGET_AUDIENCE_TRANSLATOR_CREATED',
      translation.companyId,
      translation.createdBy,
      details,
    );
  }

  /**
   * Log target audience translator completion
   */
  async logCompletion(
    translation: TargetAudienceTranslatorEntity,
    details: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Target audience translator completed: ${translation.id} for company ${translation.companyId}`);
    
    // Add audit trail logging
    await this.auditTrailService.logTargetAudienceTranslatorEvent(
      translation.id,
      'TARGET_AUDIENCE_TRANSLATOR_COMPLETED',
      translation.companyId,
      translation.createdBy,
      details,
    );
  }

  /**
   * Log target audience translator failure
   */
  async logFailure(
    translation: TargetAudienceTranslatorEntity,
    details: Record<string, any>,
  ): Promise<void> {
    this.logger.warn(`Target audience translator failed: ${translation.id} for company ${translation.companyId}`);
    
    // Add audit trail logging
    await this.auditTrailService.logTargetAudienceTranslatorEvent(
      translation.id,
      'TARGET_AUDIENCE_TRANSLATOR_FAILED',
      translation.companyId,
      translation.createdBy,
      details,
    );
  }

  /**
   * Log target audience translator retry
   */
  async logRetry(
    translation: TargetAudienceTranslatorEntity,
    details: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Target audience translator retry: ${translation.id} for company ${translation.companyId}`);
    
    // Add audit trail logging
    await this.auditTrailService.logTargetAudienceTranslatorEvent(
      translation.id,
      'TARGET_AUDIENCE_TRANSLATOR_RETRY',
      translation.companyId,
      translation.createdBy,
      details,
    );
  }
} 