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
exports.CampaignStatusDto = exports.UpdateCampaignDto = exports.CreateCampaignDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const campaign_constants_1 = require("../constants/campaign.constants");
class CreateCampaignDto {
    name;
    description;
    aiPersonaId;
    workflowId;
}
exports.CreateCampaignDto = CreateCampaignDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign name', minLength: 1, maxLength: 100 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Campaign description', maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AI Persona ID for personalization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "aiPersonaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Workflow ID for automation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "workflowId", void 0);
class UpdateCampaignDto {
    name;
    description;
    status;
    aiPersonaId;
    workflowId;
}
exports.UpdateCampaignDto = UpdateCampaignDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Campaign name', minLength: 1, maxLength: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Campaign description', maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Campaign status', enum: campaign_constants_1.CampaignStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(campaign_constants_1.CampaignStatus),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AI Persona ID for personalization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "aiPersonaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Workflow ID for automation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "workflowId", void 0);
class CampaignStatusDto {
    status;
}
exports.CampaignStatusDto = CampaignStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New campaign status', enum: campaign_constants_1.CampaignStatus }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(campaign_constants_1.CampaignStatus),
    __metadata("design:type", String)
], CampaignStatusDto.prototype, "status", void 0);
//# sourceMappingURL=campaign.dto.js.map