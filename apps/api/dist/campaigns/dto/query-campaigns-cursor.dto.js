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
exports.QueryCampaignsCursorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const campaign_constants_1 = require("../constants/campaign.constants");
class QueryCampaignsCursorDto {
    cursor;
    take = 20;
    status;
    search;
}
exports.QueryCampaignsCursorDto = QueryCampaignsCursorDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID of last seen campaign' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCampaignsCursorDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, minimum: 1, maximum: 100 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryCampaignsCursorDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by campaign status', enum: campaign_constants_1.CampaignStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(campaign_constants_1.CampaignStatus),
    __metadata("design:type", String)
], QueryCampaignsCursorDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search campaigns by name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCampaignsCursorDto.prototype, "search", void 0);
//# sourceMappingURL=query-campaigns-cursor.dto.js.map