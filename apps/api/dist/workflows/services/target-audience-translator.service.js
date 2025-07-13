"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TargetAudienceTranslatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetAudienceTranslatorService = void 0;
const common_1 = require("@nestjs/common");
const target_audience_translator_repository_1 = require("../repositories/target-audience-translator.repository");
const target_audience_translator_ai_service_1 = require("./target-audience-translator-ai.service");
const target_audience_translator_entity_1 = require("../entities/target-audience-translator.entity");
const target_audience_translator_dto_1 = require("../dto/target-audience-translator.dto");
const target_audience_translator_events_service_1 = require("./target-audience-translator-events.service");
let TargetAudienceTranslatorService = TargetAudienceTranslatorService_1 = class TargetAudienceTranslatorService {
    repository;
    aiService;
    events;
    logger = new common_1.Logger(TargetAudienceTranslatorService_1.name);
    constructor(repository, aiService, events) {
        this.repository = repository;
        this.aiService = aiService;
        this.events = events;
    }
    async create(dto, companyId, createdBy) {
        this.logger.log(`Creating target audience translator for company ${companyId}`);
        this.validateInput(dto);
        const translation = target_audience_translator_entity_1.TargetAudienceTranslatorEntity.create(dto.inputFormat, dto.targetAudienceData, dto.structuredData || null, dto.config || null, companyId, createdBy);
        const createdTranslation = await this.repository.create(translation);
        await this.events.logCreation(createdTranslation, {
            inputFormat: dto.inputFormat,
            targetAudienceData: dto.targetAudienceData.substring(0, 100) + '...',
        });
        this.processTranslation(createdTranslation.id, companyId).catch(error => {
            this.logger.error(`Translation processing failed for ${createdTranslation.id}:`, error);
        });
        return createdTranslation;
    }
    async findAll(companyId, query) {
        this.logger.log(`Fetching target audience translators for company ${companyId}`);
        return this.repository.findWithCursor(companyId, query);
    }
    async findOne(id, companyId) {
        this.logger.log(`Fetching target audience translator ${id} for company ${companyId}`);
        const translation = await this.repository.findOne(id, companyId);
        if (!translation) {
            throw new common_1.NotFoundException('Target audience translator not found');
        }
        return translation;
    }
    async findByStatus(status, companyId) {
        this.logger.log(`Fetching target audience translators with status ${status} for company ${companyId}`);
        return this.repository.findByStatus(status, companyId);
    }
    async findByInputFormat(inputFormat, companyId) {
        this.logger.log(`Fetching target audience translators with input format ${inputFormat} for company ${companyId}`);
        return this.repository.findByInputFormat(inputFormat, companyId);
    }
    async getStats(companyId) {
        this.logger.log(`Fetching target audience translator stats for company ${companyId}`);
        return this.repository.getStats(companyId);
    }
    async retryTranslation(id, companyId, createdBy) {
        this.logger.log(`Retrying target audience translator ${id} for company ${companyId}`);
        const translation = await this.repository.findOne(id, companyId);
        if (!translation) {
            throw new common_1.NotFoundException('Target audience translator not found');
        }
        if (!translation.isFailed) {
            throw new common_1.BadRequestException('Translation cannot be retried');
        }
        const retryTranslation = target_audience_translator_entity_1.TargetAudienceTranslatorEntity.create(translation.inputFormat, translation.targetAudienceData, translation.structuredData, translation.config, companyId, createdBy);
        const createdRetry = await this.repository.create(retryTranslation);
        await this.events.logRetry(createdRetry, {
            originalId: id,
            inputFormat: translation.inputFormat,
        });
        this.processTranslation(createdRetry.id, companyId).catch(error => {
            this.logger.error(`Translation retry processing failed for ${createdRetry.id}:`, error);
        });
        return createdRetry;
    }
    async processTranslation(translationId, companyId) {
        try {
            const translation = await this.repository.findOne(translationId, companyId);
            if (!translation) {
                throw new Error(`Translation ${translationId} not found`);
            }
            const processingTranslation = translation.withStatus('PROCESSING');
            await this.repository.update(translationId, companyId, processingTranslation);
            const result = await this.aiService.processTargetAudience(translation.inputFormat, translation.targetAudienceData, translation.structuredData || undefined, translation.config || undefined);
            const successfulTranslation = translation.withResults(result.leads, result.enrichmentSchema, result.interpretedCriteria, result.reasoning, result.confidence);
            await this.repository.update(translationId, companyId, successfulTranslation);
            await this.events.logCompletion(successfulTranslation, {
                leadCount: result.leads.length,
                confidence: result.confidence,
                reasoning: result.reasoning,
            });
            this.logger.log(`Translation ${translationId} completed successfully with ${result.leads.length} leads`);
        }
        catch (error) {
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
            }
            catch (updateError) {
                this.logger.error(`Failed to update translation status for ${translationId}:`, updateError);
            }
        }
    }
    validateInput(dto) {
        if (!dto.targetAudienceData || dto.targetAudienceData.trim().length === 0) {
            throw new common_1.BadRequestException('Target audience data is required');
        }
        switch (dto.inputFormat) {
            case target_audience_translator_dto_1.InputFormat.FREE_TEXT:
                if (dto.targetAudienceData.length < 10) {
                    throw new common_1.BadRequestException('Free text input must be at least 10 characters long');
                }
                break;
            case target_audience_translator_dto_1.InputFormat.STRUCTURED_JSON:
                try {
                    JSON.parse(dto.targetAudienceData);
                }
                catch (error) {
                    throw new common_1.BadRequestException('Invalid JSON format for structured input');
                }
                break;
            case target_audience_translator_dto_1.InputFormat.CSV_UPLOAD:
                const lines = dto.targetAudienceData.split('\n').filter(line => line.trim());
                if (lines.length < 2) {
                    throw new common_1.BadRequestException('CSV data must have at least a header row and one data row');
                }
                break;
            case target_audience_translator_dto_1.InputFormat.FORM_INPUT:
                try {
                    JSON.parse(dto.targetAudienceData);
                }
                catch (error) {
                    throw new common_1.BadRequestException('Invalid JSON format for form input');
                }
                break;
            default:
                throw new common_1.BadRequestException(`Unsupported input format: ${dto.inputFormat}`);
        }
    }
};
exports.TargetAudienceTranslatorService = TargetAudienceTranslatorService;
exports.TargetAudienceTranslatorService = TargetAudienceTranslatorService = TargetAudienceTranslatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [target_audience_translator_repository_1.TargetAudienceTranslatorRepository,
        target_audience_translator_ai_service_1.TargetAudienceTranslatorAiService,
        target_audience_translator_events_service_1.TargetAudienceTranslatorEventsService])
], TargetAudienceTranslatorService);
//# sourceMappingURL=target-audience-translator.service.js.map