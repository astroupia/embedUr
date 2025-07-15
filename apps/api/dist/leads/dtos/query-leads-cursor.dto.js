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
exports.QueryLeadsCursorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const lead_constants_1 = require("../constants/lead.constants");
class QueryLeadsCursorDto {
    cursor;
    take = 20;
    status;
    search;
    campaignId;
}
exports.QueryLeadsCursorDto = QueryLeadsCursorDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID of last seen lead' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLeadsCursorDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, minimum: 1, maximum: 100 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryLeadsCursorDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by lead status', enum: lead_constants_1.LeadStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(lead_constants_1.LeadStatus),
    __metadata("design:type", String)
], QueryLeadsCursorDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search in full name and email' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLeadsCursorDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by campaign ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLeadsCursorDto.prototype, "campaignId", void 0);
//# sourceMappingURL=query-leads-cursor.dto.js.map