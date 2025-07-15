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
exports.ReplyQueryDto = exports.ReplyStatsDto = exports.ReplyResponseDto = exports.UpdateReplyDto = exports.CreateReplyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const reply_constants_1 = require("../constants/reply.constants");
const prisma_1 = require("../../../generated/prisma");
class CreateReplyDto {
    content;
    leadId;
    emailLogId;
    source;
    metadata;
}
exports.CreateReplyDto = CreateReplyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reply content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(reply_constants_1.REPLY_VALIDATION_RULES.MIN_CONTENT_LENGTH),
    (0, class_validator_1.MaxLength)(reply_constants_1.REPLY_VALIDATION_RULES.MAX_CONTENT_LENGTH),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lead ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-z0-9]{25}$/, { message: 'leadId must be a valid CUID' }),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email log ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-z0-9]{25}$/, { message: 'emailLogId must be a valid CUID' }),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "emailLogId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reply source', enum: reply_constants_1.ReplySource }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(reply_constants_1.ReplySource),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateReplyDto.prototype, "metadata", void 0);
class UpdateReplyDto {
    content;
    classification;
    handledBy;
    metadata;
}
exports.UpdateReplyDto = UpdateReplyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reply content' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(reply_constants_1.REPLY_VALIDATION_RULES.MIN_CONTENT_LENGTH),
    (0, class_validator_1.MaxLength)(reply_constants_1.REPLY_VALIDATION_RULES.MAX_CONTENT_LENGTH),
    __metadata("design:type", String)
], UpdateReplyDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reply classification', enum: reply_constants_1.ReplyClassification }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(prisma_1.$Enums.ReplyClassification),
    __metadata("design:type", String)
], UpdateReplyDto.prototype, "classification", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User who handled the reply' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReplyDto.prototype, "handledBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateReplyDto.prototype, "metadata", void 0);
class ReplyResponseDto {
    id;
    content;
    classification;
    leadId;
    emailLogId;
    companyId;
    handledBy;
    source;
    metadata;
    createdAt;
    updatedAt;
    isInterested;
    isNegative;
    isNeutral;
    isAutoReply;
    sentimentScore;
    requiresAttention;
    summary;
    priority;
    isRecent;
}
exports.ReplyResponseDto = ReplyResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReplyResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReplyResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: reply_constants_1.ReplyClassification }),
    __metadata("design:type", String)
], ReplyResponseDto.prototype, "classification", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReplyResponseDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReplyResponseDto.prototype, "emailLogId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReplyResponseDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ReplyResponseDto.prototype, "handledBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: reply_constants_1.ReplySource }),
    __metadata("design:type", String)
], ReplyResponseDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ReplyResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReplyResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReplyResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ReplyResponseDto.prototype, "isInterested", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ReplyResponseDto.prototype, "isNegative", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ReplyResponseDto.prototype, "isNeutral", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ReplyResponseDto.prototype, "isAutoReply", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReplyResponseDto.prototype, "sentimentScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ReplyResponseDto.prototype, "requiresAttention", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReplyResponseDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReplyResponseDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ReplyResponseDto.prototype, "isRecent", void 0);
class ReplyStatsDto {
    total;
    byClassification;
    bySource;
    recentCount;
    averageResponseTime;
    positiveRate;
}
exports.ReplyStatsDto = ReplyStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReplyStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ReplyStatsDto.prototype, "byClassification", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ReplyStatsDto.prototype, "bySource", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReplyStatsDto.prototype, "recentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReplyStatsDto.prototype, "averageResponseTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReplyStatsDto.prototype, "positiveRate", void 0);
class ReplyQueryDto {
    leadId;
    emailLogId;
    classification;
    source;
    requiresAttention;
    recent;
    cursor;
    limit = 20;
}
exports.ReplyQueryDto = ReplyQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lead ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9]{25}$/, { message: 'leadId must be a valid CUID' }),
    __metadata("design:type", String)
], ReplyQueryDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email log ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9]{25}$/, { message: 'emailLogId must be a valid CUID' }),
    __metadata("design:type", String)
], ReplyQueryDto.prototype, "emailLogId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Classification filter', enum: reply_constants_1.ReplyClassification }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(reply_constants_1.ReplyClassification),
    __metadata("design:type", String)
], ReplyQueryDto.prototype, "classification", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Source filter', enum: reply_constants_1.ReplySource }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(reply_constants_1.ReplySource),
    __metadata("design:type", String)
], ReplyQueryDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Requires attention filter' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ReplyQueryDto.prototype, "requiresAttention", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Recent replies only (last 24 hours)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ReplyQueryDto.prototype, "recent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cursor for pagination' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items to return', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ReplyQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=reply.dto.js.map