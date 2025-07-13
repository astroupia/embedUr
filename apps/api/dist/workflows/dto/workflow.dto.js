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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryExecutionDto = exports.ExecuteWorkflowDto = exports.UpdateWorkflowDto = exports.CreateWorkflowDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const workflow_constants_1 = require("../constants/workflow.constants");
class CreateWorkflowDto {
    name;
    type;
    n8nWorkflowId;
}
exports.CreateWorkflowDto = CreateWorkflowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow name', minLength: 1, maxLength: 100 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow type', enum: workflow_constants_1.WorkflowType }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(workflow_constants_1.WorkflowType),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'N8N workflow ID for external automation reference' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "n8nWorkflowId", void 0);
class UpdateWorkflowDto {
    name;
    n8nWorkflowId;
}
exports.UpdateWorkflowDto = UpdateWorkflowDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Workflow name', minLength: 1, maxLength: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateWorkflowDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'N8N workflow ID for external automation reference' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkflowDto.prototype, "n8nWorkflowId", void 0);
class ExecuteWorkflowDto {
    inputData;
    leadId;
    campaignId;
}
exports.ExecuteWorkflowDto = ExecuteWorkflowDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Input data for workflow execution',
        type: 'object',
        additionalProperties: true
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ExecuteWorkflowDto.prototype, "inputData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lead ID if execution is related to a specific lead' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExecuteWorkflowDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Campaign ID if execution is related to a specific campaign' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExecuteWorkflowDto.prototype, "campaignId", void 0);
class RetryExecutionDto {
    inputData;
}
exports.RetryExecutionDto = RetryExecutionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated input data for retry',
        type: 'object',
        additionalProperties: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RetryExecutionDto.prototype, "inputData", void 0);
//# sourceMappingURL=workflow.dto.js.map