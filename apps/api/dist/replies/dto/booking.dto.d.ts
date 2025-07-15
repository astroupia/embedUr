import { BookingStatus } from '../constants/reply.constants';
import { $Enums } from '../../../generated/prisma';
export declare class CreateBookingDto {
    calendlyLink: string;
    scheduledTime: string;
    leadId: string;
    replyId?: string;
    status?: BookingStatus;
    metadata?: Record<string, any>;
}
export declare class UpdateBookingDto {
    calendlyLink?: string;
    scheduledTime?: string;
    status?: $Enums.BookingStatus;
    metadata?: Record<string, any>;
}
export declare class BookingResponseDto {
    id: string;
    calendlyLink: string;
    scheduledTime: Date;
    status: BookingStatus;
    leadId: string;
    companyId: string;
    replyId: string | null;
    metadata: Record<string, any> | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isConfirmed: boolean;
    isCancelled: boolean;
    isCompleted: boolean;
    isUpcoming: boolean;
    isToday: boolean;
    timeUntilBooking: number;
    statusLabel: string;
    priority: 'high' | 'medium' | 'low';
    summary: string;
    relativeTime: string;
    calendlyEventId: string | null;
    isOverdue: boolean;
    durationMinutes: number | null;
    meetingType: string | null;
}
export declare class BookingStatsDto {
    total: number;
    byStatus: Record<BookingStatus, number>;
    upcomingCount: number;
    todayCount: number;
    overdueCount: number;
    completionRate: number;
    averageBookingTime: number;
}
export declare class BookingQueryDto {
    leadId?: string;
    replyId?: string;
    status?: BookingStatus;
    active?: boolean;
    upcoming?: boolean;
    today?: boolean;
    overdue?: boolean;
    cursor?: string;
    limit?: number;
}
export declare class RescheduleBookingDto {
    calendlyLink: string;
    scheduledTime: string;
    reason?: string;
}
export declare class CancelBookingDto {
    reason?: string;
}
