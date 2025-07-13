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
exports.CancelBookingDto = exports.RescheduleBookingDto = exports.BookingQueryDto = exports.BookingStatsDto = exports.BookingResponseDto = exports.UpdateBookingDto = exports.CreateBookingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const reply_constants_1 = require("../constants/reply.constants");
const prisma_1 = require("../../../generated/prisma");
class CreateBookingDto {
    calendlyLink;
    scheduledTime;
    leadId;
    replyId;
    status;
    metadata;
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calendly link for the meeting' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.MaxLength)(reply_constants_1.BOOKING_VALIDATION_RULES.MAX_CALENDLY_LINK_LENGTH),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "calendlyLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Scheduled meeting time' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "scheduledTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lead ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reply ID (if booking is from a reply)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "replyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Booking status', enum: reply_constants_1.BookingStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(reply_constants_1.BookingStatus),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateBookingDto.prototype, "metadata", void 0);
class UpdateBookingDto {
    calendlyLink;
    scheduledTime;
    status;
    metadata;
}
exports.UpdateBookingDto = UpdateBookingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Calendly link for the meeting' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.MaxLength)(reply_constants_1.BOOKING_VALIDATION_RULES.MAX_CALENDLY_LINK_LENGTH),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "calendlyLink", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled meeting time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "scheduledTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Booking status', enum: reply_constants_1.BookingStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(prisma_1.$Enums.BookingStatus),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateBookingDto.prototype, "metadata", void 0);
class BookingResponseDto {
    id;
    calendlyLink;
    scheduledTime;
    status;
    leadId;
    companyId;
    replyId;
    metadata;
    createdAt;
    updatedAt;
    isActive;
    isConfirmed;
    isCancelled;
    isCompleted;
    isUpcoming;
    isToday;
    timeUntilBooking;
    statusLabel;
    priority;
    summary;
    relativeTime;
    calendlyEventId;
    isOverdue;
    durationMinutes;
    meetingType;
}
exports.BookingResponseDto = BookingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "calendlyLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BookingResponseDto.prototype, "scheduledTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: reply_constants_1.BookingStatus }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "replyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BookingResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BookingResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BookingResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BookingResponseDto.prototype, "isConfirmed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BookingResponseDto.prototype, "isCancelled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BookingResponseDto.prototype, "isCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BookingResponseDto.prototype, "isUpcoming", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BookingResponseDto.prototype, "isToday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingResponseDto.prototype, "timeUntilBooking", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "statusLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "relativeTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "calendlyEventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BookingResponseDto.prototype, "isOverdue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "meetingType", void 0);
class BookingStatsDto {
    total;
    byStatus;
    upcomingCount;
    todayCount;
    overdueCount;
    completionRate;
    averageBookingTime;
}
exports.BookingStatsDto = BookingStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], BookingStatsDto.prototype, "byStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingStatsDto.prototype, "upcomingCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingStatsDto.prototype, "todayCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingStatsDto.prototype, "overdueCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingStatsDto.prototype, "completionRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingStatsDto.prototype, "averageBookingTime", void 0);
class BookingQueryDto {
    leadId;
    replyId;
    status;
    active;
    upcoming;
    today;
    overdue;
    cursor;
    limit = 20;
}
exports.BookingQueryDto = BookingQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lead ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookingQueryDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reply ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookingQueryDto.prototype, "replyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status filter', enum: reply_constants_1.BookingStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(reply_constants_1.BookingStatus),
    __metadata("design:type", String)
], BookingQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active bookings only' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BookingQueryDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Upcoming bookings only' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BookingQueryDto.prototype, "upcoming", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Today\'s bookings only' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BookingQueryDto.prototype, "today", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Overdue bookings only' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BookingQueryDto.prototype, "overdue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cursor for pagination' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookingQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items to return', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BookingQueryDto.prototype, "limit", void 0);
class RescheduleBookingDto {
    calendlyLink;
    scheduledTime;
    reason;
}
exports.RescheduleBookingDto = RescheduleBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New Calendly link' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.MaxLength)(reply_constants_1.BOOKING_VALIDATION_RULES.MAX_CALENDLY_LINK_LENGTH),
    __metadata("design:type", String)
], RescheduleBookingDto.prototype, "calendlyLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New scheduled time' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RescheduleBookingDto.prototype, "scheduledTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for rescheduling' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RescheduleBookingDto.prototype, "reason", void 0);
class CancelBookingDto {
    reason;
}
exports.CancelBookingDto = CancelBookingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for cancellation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelBookingDto.prototype, "reason", void 0);
//# sourceMappingURL=booking.dto.js.map