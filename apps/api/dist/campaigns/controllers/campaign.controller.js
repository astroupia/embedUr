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
exports.CampaignController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const campaign_service_1 = require("../services/campaign.service");
const campaign_dto_1 = require("../dto/campaign.dto");
const query_campaigns_cursor_dto_1 = require("../dto/query-campaigns-cursor.dto");
const campaign_entity_1 = require("../entities/campaign.entity");
const campaign_constants_1 = require("../constants/campaign.constants");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
let CampaignController = class CampaignController {
    campaignService;
    constructor(campaignService) {
        this.campaignService = campaignService;
    }
    async create(createCampaignDto, user) {
        return this.campaignService.create(createCampaignDto, user.companyId);
    }
    async findAll(query, user) {
        return this.campaignService.findAll(user.companyId, query);
    }
    async getStats(user) {
        return this.campaignService.getStats(user.companyId);
    }
    async findByStatus(status, user) {
        return this.campaignService.findByStatus(status, user.companyId);
    }
    async findOne(id, user) {
        return this.campaignService.findOne(id, user.companyId);
    }
    async update(id, updateCampaignDto, user) {
        return this.campaignService.update(id, user.companyId, updateCampaignDto);
    }
    async activate(id, user) {
        return this.campaignService.activate(id, user.companyId);
    }
    async pause(id, user) {
        return this.campaignService.pause(id, user.companyId);
    }
    async complete(id, user) {
        return this.campaignService.complete(id, user.companyId);
    }
    async archive(id, user) {
        return this.campaignService.archive(id, user.companyId);
    }
    async remove(id, user) {
        return this.campaignService.remove(id, user.companyId);
    }
};
exports.CampaignController = CampaignController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new campaign' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Campaign created successfully',
        type: campaign_entity_1.CampaignEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Campaign already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [campaign_dto_1.CreateCampaignDto, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all campaigns with cursor-based pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaigns retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CampaignEntity' },
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
    __metadata("design:paramtypes", [query_campaigns_cursor_dto_1.QueryCampaignsCursorDto, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get campaign statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                active: { type: 'number' },
                byStatus: {
                    type: 'object',
                    properties: {
                        DRAFT: { type: 'number' },
                        ACTIVE: { type: 'number' },
                        PAUSED: { type: 'number' },
                        COMPLETED: { type: 'number' },
                        ARCHIVED: { type: 'number' },
                    },
                },
            },
        },
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('status/:status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get campaigns by status' }),
    (0, swagger_1.ApiParam)({ name: 'status', enum: campaign_constants_1.CampaignStatus }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaigns retrieved successfully',
        type: [campaign_entity_1.CampaignEntity],
    }),
    __param(0, (0, common_1.Param)('status')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a campaign by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign retrieved successfully',
        type: campaign_entity_1.CampaignEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign updated successfully',
        type: campaign_entity_1.CampaignEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status transition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campaign_dto_1.UpdateCampaignDto, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign activated successfully',
        type: campaign_entity_1.CampaignEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Campaign cannot be activated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Pause a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign paused successfully',
        type: campaign_entity_1.CampaignEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Campaign cannot be paused' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Complete a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign completed successfully',
        type: campaign_entity_1.CampaignEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Campaign cannot be completed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Archive a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign archived successfully',
        type: campaign_entity_1.CampaignEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Campaign cannot be archived' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "archive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Campaign deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Campaign cannot be deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "remove", null);
exports.CampaignController = CampaignController = __decorate([
    (0, swagger_1.ApiTags)('campaigns'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('campaigns'),
    __metadata("design:paramtypes", [campaign_service_1.CampaignService])
], CampaignController);
//# sourceMappingURL=campaign.controller.js.map