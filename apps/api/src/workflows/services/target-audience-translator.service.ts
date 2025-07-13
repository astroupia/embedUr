import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { TargetAudienceTranslatorRepository } from '../repositories/target-audience-translator.repository';
import { TargetAudienceTranslatorAiService } from './target-audience-translator-ai.service';
import { TargetAudienceTranslatorEntity } from '../entities/target-audience-translator.entity';
import { CreateTargetAudienceTranslatorDto, QueryTargetAudienceTranslatorCursorDto, InputFormat } from '../dto/target-audience-translator.dto';
import { TargetAudienceTranslatorEventsService } from './target-audience-translator-events.service';

@Injectable()
export class TargetAudienceTranslatorService {
  private readonly logger = new Logger(TargetAudienceTranslatorService.name);

  constructor(
    private readonly repository: TargetAudienceTranslatorRepository,
    private readonly aiService: TargetAudienceTranslatorAiService,
    private readonly events: TargetAudienceTranslatorEventsService,
  ) {}

  /**
   * Create and process a target audience translation request
   */
  async create(
    dto: CreateTargetAudienceTranslatorDto,
    companyId: string,
    createdBy: string,
  ): Promise<TargetAudienceTranslatorEntity> {
    this.logger.log(`Creating target audience translator for company ${companyId}`);

    // Validate input format and data
    this.validateInput(dto);

    // Create the translation entity
    const translation = TargetAudienceTranslatorEntity.create(
      dto.inputFormat,
      dto.targetAudienceData,
      dto.structuredData || null,
      dto.config || null,
      companyId,
      createdBy,
    );

    const createdTranslation = await this.repository.create(translation);

    // Log the creation
    await this.events.logCreation(createdTranslation, {
      inputFormat: dto.inputFormat,
      targetAudienceData: dto.targetAudienceData.substring(0, 100) + '...',
    });

    // Process the translation asynchronously
    this.processTranslation(createdTranslation.id, companyId).catch(error => {
      this.logger.error(`Translation processing failed for ${createdTranslation.id}:`, error);
    });

    return createdTranslation;
  }

  /**
   * Get all translation requests with pagination
   */
  async findAll(
    companyId: string,
    query: QueryTargetAudienceTranslatorCursorDto,
  ): Promise<{ data: TargetAudienceTranslatorEntity[]; nextCursor: string | null }> {
    this.logger.log(`Fetching target audience translators for company ${companyId}`);
    
    return this.repository.findWithCursor(companyId, query);
  }

  /**
   * Get translation request by ID
   */
  async findOne(id: string, companyId: string): Promise<TargetAudienceTranslatorEntity> {
    this.logger.log(`Fetching target audience translator ${id} for company ${companyId}`);
    
    const translation = await this.repository.findOne(id, companyId);
    
    if (!translation) {
      throw new NotFoundException('Target audience translator not found');
    }
    
    return translation;
  }

  /**
   * Get translation requests by status
   */
  async findByStatus(status: string, companyId: string): Promise<TargetAudienceTranslatorEntity[]> {
    this.logger.log(`Fetching target audience translators with status ${status} for company ${companyId}`);
    
    return this.repository.findByStatus(status, companyId);
  }

  /**
   * Get translation requests by input format
   */
  async findByInputFormat(inputFormat: InputFormat, companyId: string): Promise<TargetAudienceTranslatorEntity[]> {
    this.logger.log(`Fetching target audience translators with input format ${inputFormat} for company ${companyId}`);
    
    return this.repository.findByInputFormat(inputFormat, companyId);
  }

  /**
   * Get translation statistics
   */
  async getStats(companyId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byInputFormat: Record<InputFormat, number>;
    successful: number;
    failed: number;
    pending: number;
  }> {
    this.logger.log(`Fetching target audience translator stats for company ${companyId}`);
    
    return this.repository.getStats(companyId);
  }

  /**
   * Retry a failed translation
   */
  async retryTranslation(
    id: string,
    companyId: string,
    createdBy: string,
  ): Promise<TargetAudienceTranslatorEntity> {
    this.logger.log(`Retrying target audience translator ${id} for company ${companyId}`);

    const translation = await this.repository.findOne(id, companyId);
    
    if (!translation) {
      throw new NotFoundException('Target audience translator not found');
    }

    if (!translation.isFailed) {
      throw new BadRequestException('Translation cannot be retried');
    }

    // Create new translation with same input data
    const retryTranslation = TargetAudienceTranslatorEntity.create(
      translation.inputFormat,
      translation.targetAudienceData,
      translation.structuredData,
      translation.config,
      companyId,
      createdBy,
    );

    const createdRetry = await this.repository.create(retryTranslation);

    // Log the retry
    await this.events.logRetry(createdRetry, {
      originalId: id,
      inputFormat: translation.inputFormat,
    });

    // Process the retry asynchronously
    this.processTranslation(createdRetry.id, companyId).catch(error => {
      this.logger.error(`Translation retry processing failed for ${createdRetry.id}:`, error);
    });

    return createdRetry;
  }

  /**
   * Process translation asynchronously
   */
  private async processTranslation(translationId: string, companyId: string): Promise<void> {
    try {
      const translation = await this.repository.findOne(translationId, companyId);
      
      if (!translation) {
        throw new Error(`Translation ${translationId} not found`);
      }

      // Update status to processing
      const processingTranslation = translation.withStatus('PROCESSING');
      await this.repository.update(translationId, companyId, processingTranslation);

      // Process with AI service
      const result = await this.aiService.processTargetAudience(
        translation.inputFormat,
        translation.targetAudienceData,
        translation.structuredData || undefined,
        translation.config || undefined,
      );

      // Update with results
      const successfulTranslation = translation.withResults(
        result.leads,
        result.enrichmentSchema,
        result.interpretedCriteria,
        result.reasoning,
        result.confidence,
      );

      await this.repository.update(translationId, companyId, successfulTranslation);

      // Log completion
      await this.events.logCompletion(successfulTranslation, {
        leadCount: result.leads.length,
        confidence: result.confidence,
        reasoning: result.reasoning,
      });

      this.logger.log(`Translation ${translationId} completed successfully with ${result.leads.length} leads`);
    } catch (error) {
      this.logger.error(`Translation processing failed for ${translationId}:`, error);

      try {
        const translation = await this.repository.findOne(translationId, companyId);
        if (translation) {
          const failedTranslation = translation.withError(error.message);
          await this.repository.update(translationId, companyId, failedTranslation);

          await this.events.logFailure(failedTranslation, {
            error: error.message,
          });
        }
      } catch (updateError) {
        this.logger.error(`Failed to update translation status for ${translationId}:`, updateError);
      }
    }
  }

  /**
   * Validate input data
   */
  private validateInput(dto: CreateTargetAudienceTranslatorDto): void {
    if (!dto.targetAudienceData || dto.targetAudienceData.trim().length === 0) {
      throw new BadRequestException('Target audience data is required');
    }

    switch (dto.inputFormat) {
      case InputFormat.FREE_TEXT:
        if (dto.targetAudienceData.length < 10) {
          throw new BadRequestException('Free text input must be at least 10 characters long');
        }
        break;

      case InputFormat.STRUCTURED_JSON:
        try {
          JSON.parse(dto.targetAudienceData);
        } catch (error) {
          throw new BadRequestException('Invalid JSON format for structured input');
        }
        break;

      case InputFormat.CSV_UPLOAD:
        const lines = dto.targetAudienceData.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new BadRequestException('CSV data must have at least a header row and one data row');
        }
        break;

      case InputFormat.FORM_INPUT:
        try {
          JSON.parse(dto.targetAudienceData);
        } catch (error) {
          throw new BadRequestException('Invalid JSON format for form input');
        }
        break;

      default:
        throw new BadRequestException(`Unsupported input format: ${dto.inputFormat}`);
    }
  }
} 