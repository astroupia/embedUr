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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetAudienceTranslatorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const target_audience_translator_service_1 = require("../services/target-audience-translator.service");
const target_audience_translator_dto_1 = require("../dto/target-audience-translator.dto");
const target_audience_translator_entity_1 = require("../entities/target-audience-translator.entity");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
let TargetAudienceTranslatorController = class TargetAudienceTranslatorController {
    targetAudienceTranslatorService;
    constructor(targetAudienceTranslatorService) {
        this.targetAudienceTranslatorService = targetAudienceTranslatorService;
    }
    async create(createDto, user) {
        return this.targetAudienceTranslatorService.create(createDto, user.companyId, user.userId);
    }
    async findAll(query, user) {
        return this.targetAudienceTranslatorService.findAll(user.companyId, query);
    }
    async getStats(user) {
        return this.targetAudienceTranslatorService.getStats(user.companyId);
    }
    async findByStatus(status, user) {
        return this.targetAudienceTranslatorService.findByStatus(status, user.companyId);
    }
    async findByInputFormat(format, user) {
        return this.targetAudienceTranslatorService.findByInputFormat(format, user.companyId);
    }
    async findOne(id, user) {
        return this.targetAudienceTranslatorService.findOne(id, user.companyId);
    }
    async retryTranslation(id, user) {
        return this.targetAudienceTranslatorService.retryTranslation(id, user.companyId, user.userId);
    }
};
exports.TargetAudienceTranslatorController = TargetAudienceTranslatorController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new target audience translation request' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Target audience translation request created successfully',
        type: target_audience_translator_entity_1.TargetAudienceTranslatorEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [target_audience_translator_dto_1.CreateTargetAudienceTranslatorDto, Object]),
    __metadata("design:returntype", Promise)
], TargetAudienceTranslatorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all target audience translation requests with cursor-based pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Target audience translation requests retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/TargetAudienceTranslatorEntity' },
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
    __metadata("design:paramtypes", [target_audience_translator_dto_1.QueryTargetAudienceTranslatorCursorDto, Object]),
    __metadata("design:returntype", Promise)
], TargetAudienceTranslatorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get target audience translator statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Target audience translator statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                byStatus: { type: 'object' },
                byInputFormat: { type: 'object' },
                successful: { type: 'number' },
                failed: { type: 'number' },
                pending: { type: 'number' },
            },
        },
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TargetAudienceTranslatorController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('status/:status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get target audience translation requests by status' }),
    (0, swagger_1.ApiParam)({ name: 'status', description: 'Status to filter by' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Target audience translation requests retrieved successfully',
        type: [target_audience_translator_entity_1.TargetAudienceTranslatorEntity],
    }),
    __param(0, (0, common_1.Param)('status')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TargetAudienceTranslatorController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)('format/:format'),
    (0, swagger_1.ApiOperation)({ summary: 'Get target audience translation requests by input format' }),
    (0, swagger_1.ApiParam)({ name: 'format', enum: target_audience_translator_dto_1.InputFormat }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Target audience translation requests retrieved successfully',
        type: [target_audience_translator_entity_1.TargetAudienceTranslatorEntity],
    }),
    __param(0, (0, common_1.Param)('format')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TargetAudienceTranslatorController.prototype, "findByInputFormat", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a target audience translation request by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Target Audience Translator ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Target audience translation request retrieved successfully',
        type: target_audience_translator_entity_1.TargetAudienceTranslatorEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Target audience translation request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TargetAudienceTranslatorController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed target audience translation request' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Target Audience Translator ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Target audience translation retry started successfully',
        type: target_audience_translator_entity_1.TargetAudienceTranslatorEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Target audience translation request not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Translation cannot be retried' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TargetAudienceTranslatorController.prototype, "retryTranslation", null);
exports.TargetAudienceTranslatorController = TargetAudienceTranslatorController = __decorate([
    (0, swagger_1.ApiTags)('target-audience-translator'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('target-audience-translator'),
    __metadata("design:paramtypes", [target_audience_translator_service_1.TargetAudienceTranslatorService])
], TargetAudienceTranslatorController);
//# sourceMappingURL=target-audience-translator.controller.js.map