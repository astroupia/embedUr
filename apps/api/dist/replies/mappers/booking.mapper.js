"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingMapper = void 0;
const booking_entity_1 = require("../entities/booking.entity");
const reply_constants_1 = require("../constants/reply.constants");
class BookingMapper {
    static toEntity(model) {
        if (!model)
            return null;
        return new booking_entity_1.BookingEntity(model.id, model.calendlyLink, model.scheduledTime, model.status, model.leadId, model.companyId, null, model.metadata, model.createdAt, model.updatedAt);
    }
    static toDto(entity) {
        if (!entity)
            return null;
        return {
            id: entity.id,
            calendlyLink: entity.calendlyLink,
            scheduledTime: entity.scheduledTime,
            status: entity.status,
            leadId: entity.leadId,
            companyId: entity.companyId,
            replyId: entity.replyId,
            metadata: entity.metadata,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            isActive: entity.isActive,
            isConfirmed: entity.isConfirmed,
            isCancelled: entity.isCancelled,
            isCompleted: entity.isCompleted,
            isUpcoming: entity.isUpcoming,
            isToday: entity.isToday,
            timeUntilBooking: entity.timeUntilBooking,
            statusLabel: entity.statusLabel,
            priority: entity.priority,
            summary: entity.summary,
            relativeTime: entity.relativeTime,
            calendlyEventId: entity.calendlyEventId,
            isOverdue: entity.isOverdue,
            durationMinutes: entity.durationMinutes,
            meetingType: entity.meetingType,
        };
    }
    static toEntityArray(models) {
        if (!models || !Array.isArray(models))
            return [];
        return models.map(model => this.toEntity(model)).filter((entity) => entity !== null);
    }
    static toDtoArray(entities) {
        if (!entities || !Array.isArray(entities))
            return [];
        return entities.map(entity => this.toDto(entity)).filter((dto) => dto !== null);
    }
    static toEntityWithRelations(model) {
        if (!model)
            return null;
        const entity = this.toEntity(model);
        if (!entity)
            return null;
        if (model.lead) {
        }
        if (model.reply) {
        }
        return entity;
    }
    static toCreateData(dto, companyId) {
        return {
            calendlyLink: dto.calendlyLink,
            scheduledTime: new Date(dto.scheduledTime),
            leadId: dto.leadId,
            companyId,
            status: dto.status || reply_constants_1.BookingStatus.BOOKED,
            metadata: dto.metadata || null,
        };
    }
    static toUpdateData(dto) {
        const updateData = {};
        if (dto.calendlyLink !== undefined)
            updateData.calendlyLink = dto.calendlyLink;
        if (dto.scheduledTime !== undefined)
            updateData.scheduledTime = new Date(dto.scheduledTime);
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.metadata !== undefined)
            updateData.metadata = dto.metadata;
        return updateData;
    }
    static toWorkflowUpdateData(workflowData) {
        const updateData = {};
        if (workflowData.meetingLink) {
            updateData.calendlyLink = workflowData.meetingLink;
        }
        if (workflowData.scheduledTime) {
            updateData.scheduledTime = new Date(workflowData.scheduledTime);
        }
        if (workflowData.metadata) {
            updateData.metadata = {
                ...updateData.metadata,
                ...workflowData.metadata,
                workflowCompletedAt: new Date().toISOString(),
            };
        }
        return updateData;
    }
    static createStatsSummary(bookings) {
        const total = bookings.length;
        const byStatus = {
            [reply_constants_1.BookingStatus.BOOKED]: 0,
            [reply_constants_1.BookingStatus.RESCHEDULED]: 0,
            [reply_constants_1.BookingStatus.CANCELLED]: 0,
            [reply_constants_1.BookingStatus.COMPLETED]: 0,
            [reply_constants_1.BookingStatus.PENDING]: 0,
        };
        let upcomingCount = 0;
        let todayCount = 0;
        let overdueCount = 0;
        let completedCount = 0;
        bookings.forEach(booking => {
            byStatus[booking.status]++;
            if (booking.isUpcoming)
                upcomingCount++;
            if (booking.isToday)
                todayCount++;
            if (booking.isOverdue)
                overdueCount++;
            if (booking.isCompleted)
                completedCount++;
        });
        const completionRate = total > 0 ? (completedCount / total) * 100 : 0;
        let totalBookingTime = 0;
        let validBookings = 0;
        bookings.forEach(booking => {
            if (booking.scheduledTime > booking.createdAt) {
                totalBookingTime += booking.scheduledTime.getTime() - booking.createdAt.getTime();
                validBookings++;
            }
        });
        const averageBookingTime = validBookings > 0 ? totalBookingTime / validBookings : 0;
        return {
            total,
            byStatus,
            upcomingCount,
            todayCount,
            overdueCount,
            completionRate,
            averageBookingTime,
        };
    }
}
exports.BookingMapper = BookingMapper;
//# sourceMappingURL=booking.mapper.js.map