"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingEntity = void 0;
const reply_constants_1 = require("../constants/reply.constants");
class BookingEntity {
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
    constructor(id, calendlyLink, scheduledTime, status, leadId, companyId, replyId, metadata, createdAt, updatedAt) {
        this.id = id;
        this.calendlyLink = calendlyLink;
        this.scheduledTime = scheduledTime;
        this.status = status;
        this.leadId = leadId;
        this.companyId = companyId;
        this.replyId = replyId;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    get isActive() {
        return this.status === reply_constants_1.BookingStatus.BOOKED ||
            this.status === reply_constants_1.BookingStatus.PENDING ||
            this.status === reply_constants_1.BookingStatus.RESCHEDULED;
    }
    get isConfirmed() {
        return this.status === reply_constants_1.BookingStatus.BOOKED ||
            this.status === reply_constants_1.BookingStatus.RESCHEDULED;
    }
    get isCancelled() {
        return this.status === reply_constants_1.BookingStatus.CANCELLED;
    }
    get isCompleted() {
        return this.status === reply_constants_1.BookingStatus.COMPLETED;
    }
    get isUpcoming() {
        return this.scheduledTime > new Date();
    }
    get isToday() {
        const today = new Date();
        const bookingDate = new Date(this.scheduledTime);
        return bookingDate.toDateString() === today.toDateString();
    }
    get timeUntilBooking() {
        const now = new Date();
        const diffMs = this.scheduledTime.getTime() - now.getTime();
        return Math.floor(diffMs / (1000 * 60));
    }
    get statusLabel() {
        const labels = {
            [reply_constants_1.BookingStatus.BOOKED]: 'Booked',
            [reply_constants_1.BookingStatus.RESCHEDULED]: 'Rescheduled',
            [reply_constants_1.BookingStatus.CANCELLED]: 'Cancelled',
            [reply_constants_1.BookingStatus.COMPLETED]: 'Completed',
            [reply_constants_1.BookingStatus.PENDING]: 'Pending',
        };
        return labels[this.status] || 'Unknown';
    }
    get priority() {
        if (this.isToday)
            return 'high';
        if (this.timeUntilBooking < 24 * 60)
            return 'medium';
        return 'low';
    }
    canBeRescheduled() {
        return this.isActive && this.timeUntilBooking > 60;
    }
    canBeCancelled() {
        return this.isActive && this.timeUntilBooking > 0;
    }
    canBeCompleted() {
        return this.isConfirmed && this.timeUntilBooking < -60;
    }
    get summary() {
        const date = this.scheduledTime.toLocaleDateString();
        const time = this.scheduledTime.toLocaleTimeString();
        return `${this.statusLabel} - ${date} at ${time}`;
    }
    get relativeTime() {
        const minutes = this.timeUntilBooking;
        if (minutes < 0) {
            const hours = Math.floor(Math.abs(minutes) / 60);
            const days = Math.floor(hours / 24);
            if (days > 0) {
                return `${days} day${days > 1 ? 's' : ''} ago`;
            }
            if (hours > 0) {
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }
            return `${Math.abs(minutes)} minute${Math.abs(minutes) > 1 ? 's' : ''} ago`;
        }
        if (minutes < 60) {
            return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `in ${days} day${days > 1 ? 's' : ''}`;
        }
        return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    get calendlyEventId() {
        try {
            const url = new URL(this.calendlyLink);
            const pathParts = url.pathname.split('/');
            return pathParts[pathParts.length - 1] || null;
        }
        catch {
            return null;
        }
    }
    get isOverdue() {
        return this.isConfirmed && this.timeUntilBooking < -30;
    }
    get durationMinutes() {
        return this.metadata?.durationMinutes || null;
    }
    get meetingType() {
        return this.metadata?.meetingType || null;
    }
}
exports.BookingEntity = BookingEntity;
//# sourceMappingURL=booking.entity.js.map