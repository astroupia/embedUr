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
exports.EnrichmentStatsDto = exports.RetryEnrichmentDto = exports.TriggerEnrichmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enrichment_constants_1 = require("../constants/enrichment.constants");
class TriggerEnrichmentDto {
    leadId;
    provider;
    requestData;
}
exports.TriggerEnrichmentDto = TriggerEnrichmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lead ID to enrich', example: 'lead_123' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TriggerEnrichmentDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Enrichment provider to use',
        enum: enrichment_constants_1.EnrichmentProvider,
        example: enrichment_constants_1.EnrichmentProvider.APOLLO
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enrichment_constants_1.EnrichmentProvider),
    __metadata("design:type", String)
], TriggerEnrichmentDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional request data for the provider',
        type: 'object',
        additionalProperties: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TriggerEnrichmentDto.prototype, "requestData", void 0);
class RetryEnrichmentDto {
    requestData;
    provider;
}
exports.RetryEnrichmentDto = RetryEnrichmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated request data for retry',
        type: 'object',
        additionalProperties: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RetryEnrichmentDto.prototype, "requestData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Alternative provider to use for retry',
        enum: enrichment_constants_1.EnrichmentProvider
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enrichment_constants_1.EnrichmentProvider),
    __metadata("design:type", String)
], RetryEnrichmentDto.prototype, "provider", void 0);
class EnrichmentStatsDto {
    total;
    successful;
    failed;
    pending;
    byProvider;
    averageDurationSeconds;
}
exports.EnrichmentStatsDto = EnrichmentStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total enrichment requests' }),
    __metadata("design:type", Number)
], EnrichmentStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Successful enrichments' }),
    __metadata("design:type", Number)
], EnrichmentStatsDto.prototype, "successful", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed enrichments' }),
    __metadata("design:type", Number)
], EnrichmentStatsDto.prototype, "failed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pending enrichments' }),
    __metadata("design:type", Number)
], EnrichmentStatsDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Statistics by provider' }),
    __metadata("design:type", Object)
], EnrichmentStatsDto.prototype, "byProvider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average enrichment duration in seconds' }),
    __metadata("design:type", Number)
], EnrichmentStatsDto.prototype, "averageDurationSeconds", void 0);
//# sourceMappingURL=enrichment.dto.js.map