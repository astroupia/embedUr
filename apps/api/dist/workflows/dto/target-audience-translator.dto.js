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
exports.QueryTargetAudienceTranslatorCursorDto = exports.TargetAudienceTranslatorResponseDto = exports.CreateTargetAudienceTranslatorDto = exports.InterpretedCriteria = exports.GeneratedLead = exports.StructuredTargetingData = exports.EnrichmentSchema = exports.EnrichmentField = exports.EnrichmentFieldType = exports.InputFormat = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var InputFormat;
(function (InputFormat) {
    InputFormat["FREE_TEXT"] = "FREE_TEXT";
    InputFormat["STRUCTURED_JSON"] = "STRUCTURED_JSON";
    InputFormat["CSV_UPLOAD"] = "CSV_UPLOAD";
    InputFormat["FORM_INPUT"] = "FORM_INPUT";
})(InputFormat || (exports.InputFormat = InputFormat = {}));
var EnrichmentFieldType;
(function (EnrichmentFieldType) {
    EnrichmentFieldType["REQUIRED"] = "REQUIRED";
    EnrichmentFieldType["OPTIONAL"] = "OPTIONAL";
    EnrichmentFieldType["CONDITIONAL"] = "CONDITIONAL";
})(EnrichmentFieldType || (exports.EnrichmentFieldType = EnrichmentFieldType = {}));
class EnrichmentField {
    name;
    type;
    description;
    example;
}
exports.EnrichmentField = EnrichmentField;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field name', example: 'fullName' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnrichmentField.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field type', enum: EnrichmentFieldType }),
    (0, class_validator_1.IsEnum)(EnrichmentFieldType),
    __metadata("design:type", String)
], EnrichmentField.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Field description', example: 'Full name of the person' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrichmentField.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Example value', example: 'John Doe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrichmentField.prototype, "example", void 0);
class EnrichmentSchema {
    requiredFields;
    optionalFields;
    conditionalFields;
}
exports.EnrichmentSchema = EnrichmentSchema;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Required fields for enrichment', type: [EnrichmentField] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EnrichmentField),
    __metadata("design:type", Array)
], EnrichmentSchema.prototype, "requiredFields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Optional fields for enrichment', type: [EnrichmentField] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EnrichmentField),
    __metadata("design:type", Array)
], EnrichmentSchema.prototype, "optionalFields", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Conditional fields for enrichment', type: [EnrichmentField] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EnrichmentField),
    __metadata("design:type", Array)
], EnrichmentSchema.prototype, "conditionalFields", void 0);
class StructuredTargetingData {
    jobTitles;
    industries;
    location;
    companySize;
    fundingStatus;
    additionalCriteria;
}
exports.StructuredTargetingData = StructuredTargetingData;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Job titles to target', example: ['CTO', 'VP Engineering'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StructuredTargetingData.prototype, "jobTitles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Industries to target', example: ['B2B SaaS', 'E-commerce'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StructuredTargetingData.prototype, "industries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Geographic location', example: 'Europe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StructuredTargetingData.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Company size range', example: '50-200 employees' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StructuredTargetingData.prototype, "companySize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Funding status', example: 'VC-backed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StructuredTargetingData.prototype, "fundingStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional targeting criteria' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], StructuredTargetingData.prototype, "additionalCriteria", void 0);
class GeneratedLead {
    fullName;
    jobTitle;
    companyName;
    location;
    linkedinUrl;
    email;
    additionalData;
}
exports.GeneratedLead = GeneratedLead;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full name', example: 'John Doe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratedLead.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Job title', example: 'CTO' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratedLead.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Company name', example: 'TechCorp Inc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratedLead.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location', example: 'London, UK' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratedLead.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'LinkedIn URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratedLead.prototype, "linkedinUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratedLead.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional lead data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeneratedLead.prototype, "additionalData", void 0);
class InterpretedCriteria {
    jobTitles;
    industries;
    location;
    companySize;
    fundingStatus;
    additionalCriteria;
}
exports.InterpretedCriteria = InterpretedCriteria;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Job titles to target', example: ['CTO', 'VP Engineering'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], InterpretedCriteria.prototype, "jobTitles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Industries to target', example: ['B2B SaaS', 'E-commerce'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], InterpretedCriteria.prototype, "industries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Geographic location', example: 'Europe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InterpretedCriteria.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Company size range', example: '50-200 employees' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InterpretedCriteria.prototype, "companySize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Funding status', example: 'VC-backed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InterpretedCriteria.prototype, "fundingStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional targeting criteria' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], InterpretedCriteria.prototype, "additionalCriteria", void 0);
class CreateTargetAudienceTranslatorDto {
    inputFormat;
    targetAudienceData;
    structuredData;
    config;
}
exports.CreateTargetAudienceTranslatorDto = CreateTargetAudienceTranslatorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Input format', enum: InputFormat }),
    (0, class_validator_1.IsEnum)(InputFormat),
    __metadata("design:type", String)
], CreateTargetAudienceTranslatorDto.prototype, "inputFormat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target audience description or data' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTargetAudienceTranslatorDto.prototype, "targetAudienceData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Structured targeting data (for JSON format)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StructuredTargetingData),
    __metadata("design:type", StructuredTargetingData)
], CreateTargetAudienceTranslatorDto.prototype, "structuredData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional configuration' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTargetAudienceTranslatorDto.prototype, "config", void 0);
class TargetAudienceTranslatorResponseDto {
    leads;
    enrichmentSchema;
    interpretedCriteria;
    reasoning;
    confidence;
}
exports.TargetAudienceTranslatorResponseDto = TargetAudienceTranslatorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Generated leads', type: [GeneratedLead] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GeneratedLead),
    __metadata("design:type", Array)
], TargetAudienceTranslatorResponseDto.prototype, "leads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enrichment schema', type: EnrichmentSchema }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EnrichmentSchema),
    __metadata("design:type", EnrichmentSchema)
], TargetAudienceTranslatorResponseDto.prototype, "enrichmentSchema", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interpreted targeting criteria' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TargetAudienceTranslatorResponseDto.prototype, "interpretedCriteria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AI reasoning for the interpretation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TargetAudienceTranslatorResponseDto.prototype, "reasoning", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Confidence score (0-1)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TargetAudienceTranslatorResponseDto.prototype, "confidence", void 0);
class QueryTargetAudienceTranslatorCursorDto {
    cursor;
    take;
    search;
    inputFormat;
}
exports.QueryTargetAudienceTranslatorCursorDto = QueryTargetAudienceTranslatorCursorDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cursor for pagination' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTargetAudienceTranslatorCursorDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items to take', example: 20 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryTargetAudienceTranslatorCursorDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search term' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTargetAudienceTranslatorCursorDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by input format', enum: InputFormat }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(InputFormat),
    __metadata("design:type", String)
], QueryTargetAudienceTranslatorCursorDto.prototype, "inputFormat", void 0);
//# sourceMappingURL=target-audience-translator.dto.js.map