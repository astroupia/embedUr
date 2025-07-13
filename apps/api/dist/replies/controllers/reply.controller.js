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
var ReplyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reply_service_1 = require("../services/reply.service");
const reply_dto_1 = require("../dto/reply.dto");
const prisma_1 = require("../../../generated/prisma");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
let ReplyController = ReplyController_1 = class ReplyController {
    replyService;
    logger = new common_1.Logger(ReplyController_1.name);
    constructor(replyService) {
        this.replyService = replyService;
    }
    async markAsHandled(id, user) {
        return this.replyService.markAsHandled(id, user.companyId, user.id);
    }
    async classifyReply(id, body, user) {
        this.logger.log(`Classifying reply ${id} as ${body.classification} by user ${user.id}`);
        this.logger.log(`Classify endpoint called with body:`, body);
        return this.replyService.classifyReply(id, user.companyId, body.classification, user.id);
    }
    async create(dto, user) {
        this.logger.log(`Creating reply for user ${user.id} in company ${user.companyId}`);
        this.logger.log(`Create endpoint called with body:`, dto);
        return this.replyService.create(dto, user.companyId);
    }
    async findAll(query, user) {
        this.logger.log(`Fetching replies for user ${user.id} in company ${user.companyId}`);
        return this.replyService.findAll(user.companyId, query);
    }
    async findByLead(leadId, user) {
        this.logger.log(`Fetching replies for lead ${leadId} in company ${user.companyId}`);
        return this.replyService.findByLead(leadId, user.companyId);
    }
    async findByEmailLog(emailLogId, user) {
        this.logger.log(`Fetching replies for email log ${emailLogId} in company ${user.companyId}`);
        return this.replyService.findByEmailLog(emailLogId, user.companyId);
    }
    async findByClassification(classification, user) {
        this.logger.log(`Fetching replies with classification ${classification} in company ${user.companyId}`);
        return this.replyService.findByClassification(classification, user.companyId);
    }
    async findRequiringAttention(user) {
        this.logger.log(`Fetching replies requiring attention in company ${user.companyId}`);
        return this.replyService.findRequiringAttention(user.companyId);
    }
    async getStats(user) {
        this.logger.log(`Fetching reply stats for company ${user.companyId}`);
        return this.replyService.getStats(user.companyId);
    }
    async getReplyPriority(id, user) {
        this.logger.log(`Getting priority for reply ${id} in company ${user.companyId}`);
        const priority = await this.replyService.getReplyPriority(id, user.companyId);
        return { priority };
    }
    async findOne(id, user) {
        this.logger.log(`Fetching reply ${id} for user ${user.id} in company ${user.companyId}`);
        return this.replyService.findOne(id, user.companyId);
    }
    async update(id, dto, user) {
        this.logger.log(`Updating reply ${id} for user ${user.id} in company ${user.companyId}`);
        return this.replyService.update(id, user.companyId, dto);
    }
    async remove(id, user) {
        this.logger.log(`Removing reply ${id} for user ${user.id} in company ${user.companyId}`);
        return this.replyService.remove(id, user.companyId);
    }
};
exports.ReplyController = ReplyController;
__decorate([
    (0, common_1.Put)('mark-handled/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark reply as handled' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply marked as handled', type: reply_dto_1.ReplyResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Reply already handled' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "markAsHandled", null);
__decorate([
    (0, common_1.Post)(':id/classify'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually classify a reply' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply classified successfully', type: reply_dto_1.ReplyResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Reply cannot be classified' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "classifyReply", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new reply' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Reply created successfully', type: reply_dto_1.ReplyResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reply_dto_1.CreateReplyDto, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all replies with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Replies retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reply_dto_1.ReplyQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('lead/:leadId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get replies by lead ID' }),
    (0, swagger_1.ApiParam)({ name: 'leadId', description: 'Lead ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Replies retrieved successfully', type: [reply_dto_1.ReplyResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "findByLead", null);
__decorate([
    (0, common_1.Get)('email-log/:emailLogId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get replies by email log ID' }),
    (0, swagger_1.ApiParam)({ name: 'emailLogId', description: 'Email log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Replies retrieved successfully', type: [reply_dto_1.ReplyResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('emailLogId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "findByEmailLog", null);
__decorate([
    (0, common_1.Get)('classification/:classification'),
    (0, swagger_1.ApiOperation)({ summary: 'Get replies by classification' }),
    (0, swagger_1.ApiParam)({ name: 'classification', description: 'Reply classification', enum: prisma_1.$Enums.ReplyClassification }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Replies retrieved successfully', type: [reply_dto_1.ReplyResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('classification')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "findByClassification", null);
__decorate([
    (0, common_1.Get)('attention/required'),
    (0, swagger_1.ApiOperation)({ summary: 'Get replies requiring attention' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Replies retrieved successfully', type: [reply_dto_1.ReplyResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "findRequiringAttention", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reply statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully', type: reply_dto_1.ReplyStatsDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id/priority'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reply priority' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Priority retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "getReplyPriority", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reply by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply retrieved successfully', type: reply_dto_1.ReplyResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update reply' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply updated successfully', type: reply_dto_1.ReplyResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Reply cannot be updated' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reply_dto_1.UpdateReplyDto, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete reply' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Reply deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReplyController.prototype, "remove", null);
exports.ReplyController = ReplyController = ReplyController_1 = __decorate([
    (0, swagger_1.ApiTags)('replies'),
    (0, common_1.Controller)('replies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [reply_service_1.ReplyService])
], ReplyController);
//# sourceMappingURL=reply.controller.js.map