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
exports.QueryEnrichmentCursorDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const enrichment_constants_1 = require("../constants/enrichment.constants");
class QueryEnrichmentCursorDto {
    cursor;
    limit = enrichment_constants_1.ENRICHMENT_DEFAULT_PAGE_SIZE;
    sortBy = enrichment_constants_1.EnrichmentSortField.CREATED_AT;
    sortOrder = enrichment_constants_1.EnrichmentSortOrder.DESC;
    leadId;
    provider;
    status;
}
exports.QueryEnrichmentCursorDto = QueryEnrichmentCursorDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cursor for pagination' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryEnrichmentCursorDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of items per page',
        minimum: 1,
        maximum: enrichment_constants_1.ENRICHMENT_MAX_PAGE_SIZE,
        default: enrichment_constants_1.ENRICHMENT_DEFAULT_PAGE_SIZE
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(enrichment_constants_1.ENRICHMENT_MAX_PAGE_SIZE),
    __metadata("design:type", Number)
], QueryEnrichmentCursorDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Field to sort by',
        enum: enrichment_constants_1.EnrichmentSortField,
        default: enrichment_constants_1.EnrichmentSortField.CREATED_AT
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enrichment_constants_1.EnrichmentSortField),
    __metadata("design:type", String)
], QueryEnrichmentCursorDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort order',
        enum: enrichment_constants_1.EnrichmentSortOrder,
        default: enrichment_constants_1.EnrichmentSortOrder.DESC
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enrichment_constants_1.EnrichmentSortOrder),
    __metadata("design:type", String)
], QueryEnrichmentCursorDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by lead ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryEnrichmentCursorDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by provider' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryEnrichmentCursorDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryEnrichmentCursorDto.prototype, "status", void 0);
//# sourceMappingURL=query-enrichment-cursor.dto.js.map