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
exports.WorkflowResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const workflow_constants_1 = require("../constants/workflow.constants");
class WorkflowResponseDto {
    id;
    name;
    type;
    n8nWorkflowId;
    companyId;
    createdAt;
    updatedAt;
    executionCount;
    lastExecution;
    isActive;
    typeDescription;
    canBeDeleted;
    isEnrichmentWorkflow;
    isEmailSequenceWorkflow;
    isRoutingWorkflow;
}
exports.WorkflowResponseDto = WorkflowResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow ID' }),
    __metadata("design:type", String)
], WorkflowResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow name' }),
    __metadata("design:type", String)
], WorkflowResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow type', enum: workflow_constants_1.WorkflowType }),
    __metadata("design:type", String)
], WorkflowResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'N8N workflow ID' }),
    __metadata("design:type", String)
], WorkflowResponseDto.prototype, "n8nWorkflowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Company ID' }),
    __metadata("design:type", String)
], WorkflowResponseDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], WorkflowResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], WorkflowResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of executions' }),
    __metadata("design:type", Number)
], WorkflowResponseDto.prototype, "executionCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last execution summary', required: false }),
    __metadata("design:type", Object)
], WorkflowResponseDto.prototype, "lastExecution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the workflow is active (has executions)' }),
    __metadata("design:type", Boolean)
], WorkflowResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Human-readable type description' }),
    __metadata("design:type", String)
], WorkflowResponseDto.prototype, "typeDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the workflow can be deleted' }),
    __metadata("design:type", Boolean)
], WorkflowResponseDto.prototype, "canBeDeleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is an enrichment workflow' }),
    __metadata("design:type", Boolean)
], WorkflowResponseDto.prototype, "isEnrichmentWorkflow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is an email sequence workflow' }),
    __metadata("design:type", Boolean)
], WorkflowResponseDto.prototype, "isEmailSequenceWorkflow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is a lead routing workflow' }),
    __metadata("design:type", Boolean)
], WorkflowResponseDto.prototype, "isRoutingWorkflow", void 0);
//# sourceMappingURL=workflow-response.dto.js.map