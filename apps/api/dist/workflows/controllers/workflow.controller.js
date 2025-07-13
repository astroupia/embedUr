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
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workflow_service_1 = require("../services/workflow.service");
const workflow_dto_1 = require("../dto/workflow.dto");
const query_workflows_cursor_dto_1 = require("../dto/query-workflows-cursor.dto");
const query_executions_cursor_dto_1 = require("../dto/query-executions-cursor.dto");
const workflow_constants_1 = require("../constants/workflow.constants");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const workflow_response_dto_1 = require("../dto/workflow-response.dto");
const workflow_response_mapper_1 = require("../mappers/workflow-response.mapper");
const workflow_execution_response_dto_1 = require("../dto/workflow-execution-response.dto");
const workflow_execution_response_mapper_1 = require("../mappers/workflow-execution-response.mapper");
let WorkflowController = class WorkflowController {
    workflowService;
    constructor(workflowService) {
        this.workflowService = workflowService;
    }
    async create(createWorkflowDto, user) {
        const workflow = await this.workflowService.create(createWorkflowDto, user.companyId);
        return workflow_response_mapper_1.WorkflowResponseMapper.toDto(workflow);
    }
    async findAll(query, user) {
        const result = await this.workflowService.findAll(user.companyId, query);
        return {
            data: workflow_response_mapper_1.WorkflowResponseMapper.toDtoArray(result.data),
            nextCursor: result.nextCursor,
        };
    }
    async getStats(user) {
        return this.workflowService.getStats(user.companyId);
    }
    async findByType(type, user) {
        const workflows = await this.workflowService.findByType(type, user.companyId);
        return workflow_response_mapper_1.WorkflowResponseMapper.toDtoArray(workflows);
    }
    async findExecutions(query, user) {
        const result = await this.workflowService.findExecutions(user.companyId, query);
        return {
            data: workflow_execution_response_mapper_1.WorkflowExecutionResponseMapper.toDtoArray(result.data),
            nextCursor: result.nextCursor,
        };
    }
    async findExecution(executionId, user) {
        const execution = await this.workflowService.findExecution(executionId, user.companyId);
        return workflow_execution_response_mapper_1.WorkflowExecutionResponseMapper.toDto(execution);
    }
    async retryExecution(executionId, retryExecutionDto, user) {
        const execution = await this.workflowService.retryExecution(executionId, user.companyId, retryExecutionDto, user.userId);
        return workflow_execution_response_mapper_1.WorkflowExecutionResponseMapper.toDto(execution);
    }
    async findOne(id, user) {
        const workflow = await this.workflowService.findOne(id, user.companyId);
        return workflow_response_mapper_1.WorkflowResponseMapper.toDto(workflow);
    }
    async update(id, updateWorkflowDto, user) {
        const workflow = await this.workflowService.update(id, user.companyId, updateWorkflowDto);
        return workflow_response_mapper_1.WorkflowResponseMapper.toDto(workflow);
    }
    async remove(id, user) {
        return this.workflowService.remove(id, user.companyId);
    }
    async executeWorkflow(id, executeWorkflowDto, user) {
        const execution = await this.workflowService.executeWorkflow(id, user.companyId, executeWorkflowDto, user.userId);
        return workflow_execution_response_mapper_1.WorkflowExecutionResponseMapper.toDto(execution);
    }
    async findExecutionsByWorkflow(id, user) {
        const executions = await this.workflowService.findExecutionsByWorkflow(id, user.companyId);
        return workflow_execution_response_mapper_1.WorkflowExecutionResponseMapper.toDtoArray(executions);
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new workflow' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Workflow created successfully',
        type: workflow_response_dto_1.WorkflowResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Workflow already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [workflow_dto_1.CreateWorkflowDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all workflows with cursor-based pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflows retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/WorkflowResponseDto' },
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
    __metadata("design:paramtypes", [query_workflows_cursor_dto_1.QueryWorkflowsCursorDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                byType: {
                    type: 'object',
                    properties: {
                        TARGET_AUDIENCE_TRANSLATOR: { type: 'number' },
                        LEAD_ENRICHMENT: { type: 'number' },
                        EMAIL_SEQUENCE: { type: 'number' },
                        LEAD_ROUTING: { type: 'number' },
                    },
                },
                totalExecutions: { type: 'number' },
                successfulExecutions: { type: 'number' },
                failedExecutions: { type: 'number' },
            },
        },
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('type/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflows by type' }),
    (0, swagger_1.ApiParam)({ name: 'type', enum: workflow_constants_1.WorkflowType }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflows retrieved successfully',
        type: [workflow_response_dto_1.WorkflowResponseDto],
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)('executions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all workflow executions with cursor-based pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow executions retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/WorkflowExecutionResponseDto' },
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
    __metadata("design:paramtypes", [query_executions_cursor_dto_1.QueryExecutionsCursorDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findExecutions", null);
__decorate([
    (0, common_1.Get)('executions/:executionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a workflow execution by ID' }),
    (0, swagger_1.ApiParam)({ name: 'executionId', description: 'Workflow Execution ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow execution retrieved successfully',
        type: workflow_execution_response_dto_1.WorkflowExecutionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Workflow execution not found' }),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findExecution", null);
__decorate([
    (0, common_1.Post)('executions/:executionId/retry'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed workflow execution' }),
    (0, swagger_1.ApiParam)({ name: 'executionId', description: 'Workflow Execution ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow execution retry started successfully',
        type: workflow_execution_response_dto_1.WorkflowExecutionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Workflow execution not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Execution cannot be retried' }),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workflow_dto_1.RetryExecutionDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "retryExecution", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a workflow by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow retrieved successfully',
        type: workflow_response_dto_1.WorkflowResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Workflow not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a workflow' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow updated successfully',
        type: workflow_response_dto_1.WorkflowResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Workflow not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workflow_dto_1.UpdateWorkflowDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a workflow' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Workflow deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Workflow not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Workflow cannot be deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a workflow' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow ID' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Workflow execution started successfully',
        type: workflow_execution_response_dto_1.WorkflowExecutionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Workflow not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workflow_dto_1.ExecuteWorkflowDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "executeWorkflow", null);
__decorate([
    (0, common_1.Get)(':id/executions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow executions' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow executions retrieved successfully',
        type: [workflow_execution_response_dto_1.WorkflowExecutionResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Workflow not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findExecutionsByWorkflow", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, swagger_1.ApiTags)('workflows'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('workflows'),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map