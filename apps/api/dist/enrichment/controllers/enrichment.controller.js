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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EnrichmentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enrichment_service_1 = require("../services/enrichment.service");
const enrichment_dto_1 = require("../dto/enrichment.dto");
const query_enrichment_cursor_dto_1 = require("../dto/query-enrichment-cursor.dto");
const enrichment_request_entity_1 = require("../entities/enrichment-request.entity");
const enrichment_constants_1 = require("../constants/enrichment.constants");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const complete_enrichment_dto_1 = require("../dto/complete-enrichment.dto");
const api_key_guard_1 = require("../../auth/guards/api-key.guard");
const enrichment_repository_1 = require("../repositories/enrichment.repository");
const enrichment_constants_2 = require("../constants/enrichment.constants");
let EnrichmentController = EnrichmentController_1 = class EnrichmentController {
    enrichmentService;
    enrichmentRepository;
    logger = new common_1.Logger(EnrichmentController_1.name);
    constructor(enrichmentService, enrichmentRepository) {
        this.enrichmentService = enrichmentService;
        this.enrichmentRepository = enrichmentRepository;
    }
    async triggerEnrichment(triggerEnrichmentDto, user) {
        return this.enrichmentService.triggerEnrichment(triggerEnrichmentDto, user.companyId, user.userId);
    }
    async retryEnrichment(id, retryEnrichmentDto, user) {
        return this.enrichmentService.retryEnrichment(id, user.companyId, retryEnrichmentDto, user.userId);
    }
    async findAll(query, user) {
        return this.enrichmentService.findAll(user.companyId, query);
    }
    async getStats(user) {
        return this.enrichmentService.getStats(user.companyId);
    }
    async findByLead(leadId, user) {
        return this.enrichmentService.findByLead(leadId, user.companyId);
    }
    async findByProvider(provider, user) {
        return this.enrichmentService.findByProvider(provider, user.companyId);
    }
    async findOne(id, user) {
        return this.enrichmentService.findOne(id, user.companyId);
    }
    async handleEnrichmentComplete(dto) {
        this.logger.log(`Handling enrichment completion for lead ${dto.leadId}`);
        try {
            await this.enrichmentRepository.findLeadById(dto.leadId, dto.companyId);
            if (dto.status === enrichment_constants_2.EnrichmentStatus.SUCCESS && dto.outputData) {
                await this.updateLeadWithEnrichedData(dto.leadId, dto.companyId, dto.outputData);
                await this.updateEnrichmentRequest(dto.leadId, dto.companyId, dto);
                await this.logEnrichmentCompletion(dto.leadId, dto.companyId, dto);
            }
            else if (dto.status === enrichment_constants_2.EnrichmentStatus.FAILED) {
                await this.handleFailedEnrichment(dto.leadId, dto.companyId, dto.errorMessage);
            }
            this.logger.log(`Enrichment completion handled successfully for lead ${dto.leadId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to handle enrichment completion for lead ${dto.leadId}:`, error);
            throw new common_1.BadRequestException('Failed to process enrichment completion');
        }
    }
    async updateLeadWithEnrichedData(leadId, companyId, outputData) {
        this.logger.log(`Updating lead ${leadId} with enriched data`);
        const enrichmentData = {
            ...outputData,
            lastEnrichedAt: new Date().toISOString(),
        };
        await this.enrichmentRepository.updateLeadEnrichmentData(leadId, companyId, enrichmentData);
    }
    async updateEnrichmentRequest(leadId, companyId, dto) {
        this.logger.log(`Updating enrichment request for lead ${leadId}`);
        const enrichmentRequest = await this.enrichmentRepository.findEnrichmentRequestByLead(leadId, companyId);
        if (enrichmentRequest) {
            await this.enrichmentRepository.updateEnrichmentRequestStatus(enrichmentRequest.id, companyId, dto.status, dto.outputData, dto.errorMessage);
        }
        else {
            this.logger.warn(`No enrichment request found for lead ${leadId}`);
        }
    }
    async handleFailedEnrichment(leadId, companyId, errorMessage) {
        this.logger.log(`Handling failed enrichment for lead ${leadId}`);
        const enrichmentRequest = await this.enrichmentRepository.findEnrichmentRequestByLead(leadId, companyId);
        if (enrichmentRequest) {
            await this.enrichmentRepository.updateEnrichmentRequestStatus(enrichmentRequest.id, companyId, enrichment_constants_2.EnrichmentStatus.FAILED, undefined, errorMessage);
        }
        await this.logEnrichmentCompletion(leadId, companyId, {
            leadId,
            companyId,
            status: enrichment_constants_2.EnrichmentStatus.FAILED,
            errorMessage,
        });
    }
    async logEnrichmentCompletion(leadId, companyId, dto) {
        this.logger.log(`Logging enrichment completion for lead ${leadId}`);
        const action = dto.status === enrichment_constants_2.EnrichmentStatus.SUCCESS ? 'Enrichment completed successfully' : 'Enrichment failed';
        const changes = {
            status: dto.status,
            outputData: dto.outputData,
            errorMessage: dto.errorMessage,
        };
        await this.enrichmentRepository.createAuditTrail(leadId, action, changes, companyId);
    }
};
exports.EnrichmentController = EnrichmentController;
__decorate([
    (0, common_1.Post)('trigger'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger enrichment for a lead' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Enrichment triggered successfully',
        type: enrichment_request_entity_1.EnrichmentRequestEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lead not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enrichment_dto_1.TriggerEnrichmentDto, Object]),
    __metadata("design:returntype", Promise)
], EnrichmentController.prototype, "triggerEnrichment", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed enrichment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Enrichment Request ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrichment retry started successfully',
        type: enrichment_request_entity_1.EnrichmentRequestEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Enrichment cannot be retried' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Enrichment request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, enrichment_dto_1.RetryEnrichmentDto, Object]),
    __metadata("design:returntype", Promise)
], EnrichmentController.prototype, "retryEnrichment", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all enrichment requests with cursor-based pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrichment requests retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EnrichmentRequestEntity' },
                },
                nextCursor: {
                    type: 'string',
                    nullable: true,
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_enrichment_cursor_dto_1.QueryEnrichmentCursorDto, Object]),
    __metadata("design:returntype", Promise)
], EnrichmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrichment statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrichment statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                successful: { type: 'number' },
                failed: { type: 'number' },
                pending: { type: 'number' },
                byProvider: {
                    type: 'object',
                    properties: {
                        APOLLO: {
                            type: 'object',
                            properties: {
                                total: { type: 'number' },
                                successful: { type: 'number' },
                                failed: { type: 'number' },
                            },
                        },
                        DROP_CONTACT: {
                            type: 'object',
                            properties: {
                                total: { type: 'number' },
                                successful: { type: 'number' },
                                failed: { type: 'number' },
                            },
                        },
                        CLEARBIT: {
                            type: 'object',
                            properties: {
                                total: { type: 'number' },
                                successful: { type: 'number' },
                                failed: { type: 'number' },
                            },
                        },
                    },
                },
                averageDurationSeconds: { type: 'number' },
            },
        },
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrichmentController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('lead/:leadId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrichment requests for a specific lead' }),
    (0, swagger_1.ApiParam)({ name: 'leadId', description: 'Lead ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrichment requests retrieved successfully',
        type: [enrichment_request_entity_1.EnrichmentRequestEntity],
    }),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnrichmentController.prototype, "findByLead", null);
__decorate([
    (0, common_1.Get)('provider/:provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrichment requests by provider' }),
    (0, swagger_1.ApiParam)({ name: 'provider', enum: enrichment_constants_1.EnrichmentProvider }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrichment requests retrieved successfully',
        type: [enrichment_request_entity_1.EnrichmentRequestEntity],
    }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnrichmentController.prototype, "findByProvider", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an enrichment request by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Enrichment Request ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrichment request retrieved successfully',
        type: enrichment_request_entity_1.EnrichmentRequestEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Enrichment request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnrichmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('complete'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle enrichment completion webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrichment completion processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid payload' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ type: complete_enrichment_dto_1.CompleteEnrichmentDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [complete_enrichment_dto_1.CompleteEnrichmentDto]),
    __metadata("design:returntype", Promise)
], EnrichmentController.prototype, "handleEnrichmentComplete", null);
exports.EnrichmentController = EnrichmentController = EnrichmentController_1 = __decorate([
    (0, swagger_1.ApiTags)('enrichment'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('enrichment'),
    __metadata("design:paramtypes", [enrichment_service_1.EnrichmentService,
        enrichment_repository_1.EnrichmentRepository])
], EnrichmentController);
//# sourceMappingURL=enrichment.controller.js.map