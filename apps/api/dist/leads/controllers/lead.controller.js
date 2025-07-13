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
exports.LeadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lead_service_1 = require("../services/lead.service");
const lead_dto_1 = require("../dtos/lead.dto");
const query_leads_cursor_dto_1 = require("../dtos/query-leads-cursor.dto");
const lead_constants_1 = require("../constants/lead.constants");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const lead_response_dto_1 = require("../dtos/lead-response.dto");
const lead_response_mapper_1 = require("../mappers/lead-response.mapper");
let LeadController = class LeadController {
    leadService;
    constructor(leadService) {
        this.leadService = leadService;
    }
    async create(createLeadDto, user) {
        const lead = await this.leadService.create(createLeadDto, user.companyId);
        return lead_response_mapper_1.LeadResponseMapper.toResponseDto(lead);
    }
    async findAll(query, user) {
        const result = await this.leadService.findAll(user.companyId, query);
        return {
            data: lead_response_mapper_1.LeadResponseMapper.toResponseDtoList(result.data),
            nextCursor: result.nextCursor,
        };
    }
    async getStats(user) {
        return this.leadService.getStats(user.companyId);
    }
    async findByStatus(status, user) {
        const leads = await this.leadService.findByStatus(status, user.companyId);
        return lead_response_mapper_1.LeadResponseMapper.toResponseDtoList(leads);
    }
    async findOne(id, user) {
        const lead = await this.leadService.findOne(id, user.companyId);
        return lead_response_mapper_1.LeadResponseMapper.toResponseDto(lead);
    }
    async update(id, updateLeadDto, user) {
        const lead = await this.leadService.update(id, user.companyId, updateLeadDto);
        return lead_response_mapper_1.LeadResponseMapper.toResponseDto(lead);
    }
    async remove(id, user) {
        return this.leadService.remove(id, user.companyId);
    }
    async triggerEnrichment(id, user) {
        await this.leadService.triggerEnrichment(id, user.companyId);
        const lead = await this.leadService.findOne(id, user.companyId);
        return lead_response_mapper_1.LeadResponseMapper.toResponseDto(lead);
    }
};
exports.LeadController = LeadController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new lead' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Lead created successfully',
        type: lead_response_dto_1.LeadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Lead already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lead_dto_1.CreateLeadDto, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all leads with cursor-based pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leads retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/LeadResponseDto' },
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
    __metadata("design:paramtypes", [query_leads_cursor_dto_1.QueryLeadsCursorDto, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lead statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                byStatus: {
                    type: 'object',
                    properties: {
                        NEW: { type: 'number' },
                        CONTACTED: { type: 'number' },
                        INTERESTED: { type: 'number' },
                        NOT_INTERESTED: { type: 'number' },
                        BOOKED: { type: 'number' },
                        DO_NOT_CONTACT: { type: 'number' },
                    },
                },
            },
        },
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('status/:status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get leads by status' }),
    (0, swagger_1.ApiParam)({ name: 'status', enum: lead_constants_1.LeadStatus }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leads retrieved successfully',
        type: [lead_response_dto_1.LeadResponseDto],
    }),
    __param(0, (0, common_1.Param)('status')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a lead by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Lead ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lead retrieved successfully',
        type: lead_response_dto_1.LeadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lead not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a lead' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Lead ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lead updated successfully',
        type: lead_response_dto_1.LeadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lead not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lead_dto_1.UpdateLeadDto, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a lead' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Lead ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Lead deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lead not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/enrich'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Manually trigger enrichment for a lead' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Lead ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrichment triggered successfully', type: lead_response_dto_1.LeadResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lead not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "triggerEnrichment", null);
exports.LeadController = LeadController = __decorate([
    (0, swagger_1.ApiTags)('leads'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('leads'),
    __metadata("design:paramtypes", [lead_service_1.LeadService])
], LeadController);
//# sourceMappingURL=lead.controller.js.map