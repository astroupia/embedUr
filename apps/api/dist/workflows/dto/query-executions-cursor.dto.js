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
exports.QueryExecutionsCursorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const workflow_constants_1 = require("../constants/workflow.constants");
class QueryExecutionsCursorDto {
    cursor;
    take = 20;
    status;
    workflowId;
    leadId;
    startDate;
    endDate;
}
exports.QueryExecutionsCursorDto = QueryExecutionsCursorDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID of last seen execution' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryExecutionsCursorDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, minimum: 1, maximum: 100 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryExecutionsCursorDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by execution status', enum: workflow_constants_1.WorkflowExecutionStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(workflow_constants_1.WorkflowExecutionStatus),
    __metadata("design:type", String)
], QueryExecutionsCursorDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by workflow ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryExecutionsCursorDto.prototype, "workflowId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by lead ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryExecutionsCursorDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by date range (start date in ISO format)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryExecutionsCursorDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by date range (end date in ISO format)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryExecutionsCursorDto.prototype, "endDate", void 0);
//# sourceMappingURL=query-executions-cursor.dto.js.map