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
exports.WorkflowExecutionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const workflow_constants_1 = require("../constants/workflow.constants");
class WorkflowExecutionResponseDto {
    id;
    status;
    triggeredBy;
    startTime;
    endTime;
    inputData;
    outputData;
    durationMs;
    leadId;
    workflowId;
    companyId;
    errorMessage;
    isCompleted;
    isRunning;
    isSuccessful;
    isFailed;
    durationSeconds;
    hasError;
    executionTime;
    canBeRetried;
}
exports.WorkflowExecutionResponseDto = WorkflowExecutionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow execution ID' }),
    __metadata("design:type", String)
], WorkflowExecutionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Execution status', enum: workflow_constants_1.WorkflowExecutionStatus }),
    __metadata("design:type", String)
], WorkflowExecutionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who triggered the execution' }),
    __metadata("design:type", String)
], WorkflowExecutionResponseDto.prototype, "triggeredBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Execution start time' }),
    __metadata("design:type", Date)
], WorkflowExecutionResponseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Execution end time' }),
    __metadata("design:type", Object)
], WorkflowExecutionResponseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Input data for the execution' }),
    __metadata("design:type", Object)
], WorkflowExecutionResponseDto.prototype, "inputData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Output data from the execution' }),
    __metadata("design:type", Object)
], WorkflowExecutionResponseDto.prototype, "outputData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Execution duration in milliseconds' }),
    __metadata("design:type", Object)
], WorkflowExecutionResponseDto.prototype, "durationMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lead ID if execution is related to a specific lead' }),
    __metadata("design:type", Object)
], WorkflowExecutionResponseDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow ID' }),
    __metadata("design:type", String)
], WorkflowExecutionResponseDto.prototype, "workflowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Company ID' }),
    __metadata("design:type", String)
], WorkflowExecutionResponseDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error message if execution failed' }),
    __metadata("design:type", String)
], WorkflowExecutionResponseDto.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the execution is completed' }),
    __metadata("design:type", Boolean)
], WorkflowExecutionResponseDto.prototype, "isCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the execution is currently running' }),
    __metadata("design:type", Boolean)
], WorkflowExecutionResponseDto.prototype, "isRunning", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the execution was successful' }),
    __metadata("design:type", Boolean)
], WorkflowExecutionResponseDto.prototype, "isSuccessful", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the execution failed' }),
    __metadata("design:type", Boolean)
], WorkflowExecutionResponseDto.prototype, "isFailed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Execution duration in seconds' }),
    __metadata("design:type", Object)
], WorkflowExecutionResponseDto.prototype, "durationSeconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the execution has an error' }),
    __metadata("design:type", Boolean)
], WorkflowExecutionResponseDto.prototype, "hasError", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Human-readable execution time' }),
    __metadata("design:type", String)
], WorkflowExecutionResponseDto.prototype, "executionTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the execution can be retried' }),
    __metadata("design:type", Boolean)
], WorkflowExecutionResponseDto.prototype, "canBeRetried", void 0);
//# sourceMappingURL=workflow-execution-response.dto.js.map