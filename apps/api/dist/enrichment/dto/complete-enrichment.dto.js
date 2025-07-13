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
exports.CompleteEnrichmentDto = exports.EnrichmentOutputDataDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class EnrichmentOutputDataDto {
    leadId;
    name;
    email;
    company;
    jobTitle;
    industry;
    companySize;
    emailVerified;
}
exports.EnrichmentOutputDataDto = EnrichmentOutputDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lead ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrichmentOutputDataDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrichmentOutputDataDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrichmentOutputDataDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Company name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrichmentOutputDataDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrichmentOutputDataDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Industry' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrichmentOutputDataDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Company size' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrichmentOutputDataDto.prototype, "companySize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email verification status' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EnrichmentOutputDataDto.prototype, "emailVerified", void 0);
class CompleteEnrichmentDto {
    workflow;
    leadId;
    companyId;
    status;
    outputData;
    clientId;
    errorMessage;
}
exports.CompleteEnrichmentDto = CompleteEnrichmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow name', example: 'Lead Enrichment and Verification' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteEnrichmentDto.prototype, "workflow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lead ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteEnrichmentDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Company ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteEnrichmentDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Completion status', example: 'completed' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteEnrichmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enrichment output data' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EnrichmentOutputDataDto),
    __metadata("design:type", EnrichmentOutputDataDto)
], CompleteEnrichmentDto.prototype, "outputData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Client ID (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteEnrichmentDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error message if failed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteEnrichmentDto.prototype, "errorMessage", void 0);
//# sourceMappingURL=complete-enrichment.dto.js.map