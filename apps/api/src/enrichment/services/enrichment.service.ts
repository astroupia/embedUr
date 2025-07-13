import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { EnrichmentRepository } from '../repositories/enrichment.repository';
import { EnrichmentEventsService } from '../events/enrichment-events.service';
import { ApolloEnrichmentProvider } from '../providers/apollo-enrichment-provider';
import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
import { TriggerEnrichmentDto, RetryEnrichmentDto, EnrichmentStatsDto } from '../dto/enrichment.dto';
import { QueryEnrichmentCursorDto } from '../dto/query-enrichment-cursor.dto';
import { EnrichmentProvider, EnrichmentStatus, ENRICHMENT_ERROR_MESSAGES } from '../constants/enrichment.constants';
import { LeadRepository } from '../../leads/repositories/lead.repository';
import { LeadEventsService } from '../../leads/services/lead-events.service';

@Injectable()
export class EnrichmentService {
  private readonly logger = new Logger(EnrichmentService.name);

  constructor(
    private readonly enrichmentRepository: EnrichmentRepository,
    private readonly enrichmentEvents: EnrichmentEventsService,
    private readonly apolloProvider: ApolloEnrichmentProvider,
    private readonly leadRepository: LeadRepository,
    private readonly leadEvents: LeadEventsService,
  ) {}

  /**
   * Trigger enrichment for a lead
   */
  async triggerEnrichment(
    dto: TriggerEnrichmentDto,
    companyId: string,
    triggeredBy: string,
  ): Promise<EnrichmentRequestEntity> {
    this.logger.log(`Triggering enrichment for lead ${dto.leadId} in company ${companyId}`);

    // Validate lead exists and belongs to company
    const lead = await this.leadRepository.findOne(dto.leadId, companyId);

    if (!lead) {
      throw new NotFoundException(ENRICHMENT_ERROR_MESSAGES.LEAD_NOT_FOUND);
    }

    // Check for active enrichment
    const activeEnrichment = await this.enrichmentRepository.findActiveEnrichment(dto.leadId, companyId);
    if (activeEnrichment) {
      throw new BadRequestException(ENRICHMENT_ERROR_MESSAGES.ALREADY_ENRICHING);
    }

    // Determine provider
    const provider = dto.provider || await this.getDefaultProvider(companyId);

    // Create enrichment request
    const enrichment = EnrichmentRequestEntity.create(
      provider,
      {
        email: lead.email,
        fullName: lead.fullName,
        linkedinUrl: lead.linkedinUrl,
        ...dto.requestData,
      },
      dto.leadId,
      companyId,
    );

    const createdEnrichment = await this.enrichmentRepository.create(enrichment);

    // Log the request
    await this.enrichmentEvents.logEnrichmentRequest(createdEnrichment, triggeredBy);

    // Process enrichment asynchronously
    this.processEnrichment(createdEnrichment.id, companyId).catch(error => {
      this.logger.error(`Enrichment processing failed for ${createdEnrichment.id}:`, error);
    });

    return createdEnrichment;
  }

  /**
   * Retry a failed enrichment
   */
  async retryEnrichment(
    enrichmentId: string,
    companyId: string,
    dto: RetryEnrichmentDto,
    triggeredBy: string,
  ): Promise<EnrichmentRequestEntity> {
    this.logger.log(`Retrying enrichment ${enrichmentId} for company ${companyId}`);

    const originalEnrichment = await this.enrichmentRepository.findOne(enrichmentId, companyId);

    if (!originalEnrichment.canBeRetried) {
      throw new BadRequestException('Enrichment cannot be retried');
    }

    // Create new enrichment request with retry data
    const retryEnrichment = originalEnrichment.withRetry();
    
    // Update request data if provided
    if (dto.requestData) {
      retryEnrichment.requestData = { ...retryEnrichment.requestData, ...dto.requestData };
    }

    // Use alternative provider if specified
    if (dto.provider) {
      retryEnrichment.provider = dto.provider;
    }

    const createdRetry = await this.enrichmentRepository.create(retryEnrichment);

    // Log the retry
    await this.enrichmentEvents.logEnrichmentRetry(createdRetry, createdRetry.retryCount || 0);

    // Process enrichment asynchronously
    this.processEnrichment(createdRetry.id, companyId).catch(error => {
      this.logger.error(`Enrichment retry processing failed for ${createdRetry.id}:`, error);
    });

    return createdRetry;
  }

  /**
   * Get all enrichment requests with pagination
   */
  async findAll(
    companyId: string,
    query: QueryEnrichmentCursorDto,
  ): Promise<{ data: EnrichmentRequestEntity[]; nextCursor: string | null }> {
    this.logger.log(`Fetching enrichment requests for company ${companyId}`);
    
    return this.enrichmentRepository.findWithCursor(companyId, query);
  }

  /**
   * Get enrichment request by ID
   */
  async findOne(id: string, companyId: string): Promise<EnrichmentRequestEntity> {
    this.logger.log(`Fetching enrichment request ${id} for company ${companyId}`);
    
    return this.enrichmentRepository.findOne(id, companyId);
  }

  /**
   * Get enrichment requests by lead
   */
  async findByLead(leadId: string, companyId: string): Promise<EnrichmentRequestEntity[]> {
    this.logger.log(`Fetching enrichment requests for lead ${leadId} in company ${companyId}`);
    
    return this.enrichmentRepository.findByLead(leadId, companyId);
  }

  /**
   * Get enrichment requests by provider
   */
  async findByProvider(provider: EnrichmentProvider, companyId: string): Promise<EnrichmentRequestEntity[]> {
    this.logger.log(`Fetching enrichment requests for provider ${provider} in company ${companyId}`);
    
    return this.enrichmentRepository.findByProvider(provider, companyId);
  }

  /**
   * Get enrichment statistics
   */
  async getStats(companyId: string): Promise<EnrichmentStatsDto> {
    this.logger.log(`Fetching enrichment stats for company ${companyId}`);
    
    const stats = await this.enrichmentRepository.getStats(companyId);
    
    // Log stats
    await this.enrichmentEvents.logEnrichmentStats(companyId, {
      total: stats.total,
      successful: stats.successful,
      failed: stats.failed,
      pending: stats.pending,
    });
    
    return stats;
  }

  /**
   * Process enrichment asynchronously
   */
  private async processEnrichment(enrichmentId: string, companyId: string): Promise<void> {
    try {
      const enrichment = await this.enrichmentRepository.findOne(enrichmentId, companyId);
      
      // Update status to in progress
      const inProgressEnrichment = enrichment.withStatus(EnrichmentStatus.IN_PROGRESS);
      await this.enrichmentRepository.update(enrichmentId, companyId, inProgressEnrichment);

      // Get provider
      const provider = this.getProvider(enrichment.provider);
      if (!provider.isAvailable()) {
        throw new Error(`Provider ${enrichment.provider} is not available`);
      }

      // Perform enrichment
      const result = await provider.enrich(enrichment.requestData);

      if (result.success && result.data) {
        // Update lead with enriched data
        await this.updateLeadWithEnrichedData(enrichment.leadId, companyId, result.data, enrichmentId);

        // Mark enrichment as successful
        const successfulEnrichment = enrichment.withStatus(EnrichmentStatus.SUCCESS, result.data);
        await this.enrichmentRepository.update(enrichmentId, companyId, successfulEnrichment);

        // Log completion
        await this.enrichmentEvents.logEnrichmentCompletion(successfulEnrichment, true);
      } else {
        // Mark enrichment as failed
        const failedEnrichment = enrichment.withStatus(EnrichmentStatus.FAILED, undefined, result.error);
        await this.enrichmentRepository.update(enrichmentId, companyId, failedEnrichment);

        // Log failure
        await this.enrichmentEvents.logEnrichmentCompletion(failedEnrichment, false);
        await this.enrichmentEvents.notifyEnrichmentFailure(failedEnrichment, result.error || 'Unknown error');
      }
    } catch (error) {
      this.logger.error(`Enrichment processing failed for ${enrichmentId}:`, error);

      try {
        const enrichment = await this.enrichmentRepository.findOne(enrichmentId, companyId);
        const failedEnrichment = enrichment.withStatus(EnrichmentStatus.FAILED, undefined, error.message);
        await this.enrichmentRepository.update(enrichmentId, companyId, failedEnrichment);

        await this.enrichmentEvents.logEnrichmentCompletion(failedEnrichment, false);
        await this.enrichmentEvents.notifyEnrichmentFailure(failedEnrichment, error.message);
      } catch (updateError) {
        this.logger.error(`Failed to update enrichment status for ${enrichmentId}:`, updateError);
      }
    }
  }

  /**
   * Update lead with enriched data
   */
  private async updateLeadWithEnrichedData(
    leadId: string,
    companyId: string,
    enrichedData: Record<string, any>,
    enrichmentId: string,
  ): Promise<void> {
    const additionalFields: Record<string, any> = {};

    // Update specific fields if they're not already set
    if (enrichedData.linkedinUrl) {
      additionalFields.linkedinUrl = enrichedData.linkedinUrl;
    }

    if (enrichedData.verifiedEmail) {
      additionalFields.verified = true;
    }

    // Update lead using repository
    await this.leadRepository.updateEnrichmentData(leadId, companyId, enrichedData, additionalFields);

    // Log the update
    const updatedFields = Object.keys({ enrichedData, ...additionalFields });
    await this.enrichmentEvents.logLeadDataUpdate(leadId, companyId, updatedFields, enrichmentId);
  }

  /**
   * Get provider instance
   */
  private getProvider(provider: EnrichmentProvider) {
    switch (provider) {
      case EnrichmentProvider.APOLLO:
        return this.apolloProvider;
      // TODO: Add other providers
      default:
        throw new Error(`Provider ${provider} not implemented`);
    }
  }

  /**
   * Get default provider for company
   */
  private async getDefaultProvider(companyId: string): Promise<EnrichmentProvider> {
    // TODO: Implement company-specific provider preferences
    // For now, return Apollo as default
    return EnrichmentProvider.APOLLO;
  }

  /**
   * Trigger enrichment workflow for Workflow 2 (n8n)
   */
  async triggerEnrichmentWorkflow(leadId: string, companyId: string): Promise<void> {
    this.logger.log(`Triggering enrichment workflow for lead ${leadId} in company ${companyId}`);

    // Fetch lead record and validate required fields
    const lead = await this.leadRepository.findOneWithCampaign(leadId, companyId);

    if (!lead.linkedinUrl || !lead.email) {
      throw new BadRequestException('Lead missing required fields: linkedinUrl and email');
    }

    // Prepare n8n payload structure
    const payload = {
      leadId: lead.id,
      name: lead.fullName,
      email: lead.email,
      company: (lead.enrichmentData as any)?.company || '',
      jobTitle: (lead.enrichmentData as any)?.jobTitle || '',
      linkedinUrl: lead.linkedinUrl,
      companyId: lead.companyId,
      campaignId: lead.campaignId,
      clientId: lead.campaign?.name || 'default',
      credentials: {
        airtableApiKey: process.env.AIRTABLE_API_KEY,
        openRouterApiKey: process.env.OPENROUTER_API_KEY,
        emailVerificationApiKey: process.env.NEVERBOUNCE_API_KEY,
        clearbitApiKey: process.env.CLEARBIT_API_KEY,
      },
      config: {
        airtableBaseId: process.env.AIRTABLE_BASE_ID,
        airtableTableName: process.env.AIRTABLE_TABLE_NAME,
        backendLogUrl: `${process.env.BACKEND_URL}/api/n8n/log`,
        backendCompleteUrl: `${process.env.BACKEND_URL}/api/enrichment/complete`,
      },
      prompts: {
        enrichmentPrompt: 'Enrich with industry and company size from web search',
      },
    };

    // Create enrichment request record with status PENDING
    const enrichmentRequest = EnrichmentRequestEntity.create(
      EnrichmentProvider.N8N,
      payload,
      leadId,
      companyId,
    );

    const createdEnrichment = await this.enrichmentRepository.create(enrichmentRequest);

    // Log the enrichment request
    await this.enrichmentEvents.logEnrichmentRequest(createdEnrichment, 'EnrichmentService');

    // Trigger n8n workflow via LeadEventsService
    try {
      await this.leadEvents.triggerEnrichment({ id: leadId, companyId });
      this.logger.log(`Enrichment workflow triggered successfully for lead ${leadId}`);
    } catch (error) {
      this.logger.error(`Failed to trigger enrichment workflow for lead ${leadId}:`, error);
      
      // Mark enrichment request as failed
      const failedEnrichment = createdEnrichment.withStatus(EnrichmentStatus.FAILED);
      await this.enrichmentRepository.update(createdEnrichment.id, companyId, failedEnrichment);
      
      throw error;
    }
  }
} 