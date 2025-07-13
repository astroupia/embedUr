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
exports.AIPersonaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const ai_persona_service_1 = require("./ai-persona.service");
const create_ai_persona_dto_1 = require("./dto/create-ai-persona.dto");
const update_ai_persona_dto_1 = require("./dto/update-ai-persona.dto");
const ai_persona_response_dto_1 = require("./dto/ai-persona-response.dto");
let AIPersonaController = class AIPersonaController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findAll(user) {
        return this.service.findAll(user.companyId);
    }
    async create(dto, user) {
        return this.service.create(dto, user.companyId);
    }
    async findById(id, user) {
        return this.service.findById(id, user.companyId);
    }
    async update(id, dto, user) {
        return this.service.update(id, dto, user.companyId);
    }
    async delete(id, user) {
        await this.service.delete(id, user.companyId);
    }
};
exports.AIPersonaController = AIPersonaController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all AI personas for the company' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'AI personas retrieved successfully',
        type: [ai_persona_response_dto_1.AIPersonaResponseDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIPersonaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new AI persona' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'AI persona created successfully',
        type: ai_persona_response_dto_1.AIPersonaResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ai_persona_dto_1.CreateAIPersonaDto, Object]),
    __metadata("design:returntype", Promise)
], AIPersonaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an AI persona by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'AI Persona ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'AI persona retrieved successfully',
        type: ai_persona_response_dto_1.AIPersonaResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'AI persona not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AIPersonaController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an AI persona' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'AI Persona ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'AI persona updated successfully',
        type: ai_persona_response_dto_1.AIPersonaResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'AI persona not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ai_persona_dto_1.UpdateAIPersonaDto, Object]),
    __metadata("design:returntype", Promise)
], AIPersonaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an AI persona' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'AI Persona ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'AI persona deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'AI persona not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot delete persona linked to active campaigns' }),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AIPersonaController.prototype, "delete", null);
exports.AIPersonaController = AIPersonaController = __decorate([
    (0, swagger_1.ApiTags)('ai-personas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai-personas'),
    __metadata("design:paramtypes", [ai_persona_service_1.AIPersonaService])
], AIPersonaController);
//# sourceMappingURL=ai-persona.controller.js.map