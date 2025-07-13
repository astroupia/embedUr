import { BookingRepository } from '../repositories/booking.repository';
import { LeadEventsService } from '../../leads/services/lead-events.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto, BookingResponseDto, BookingStatsDto, RescheduleBookingDto, CancelBookingDto } from '../dto/booking.dto';
import { $Enums } from '../../../generated/prisma';
export declare class BookingService {
    private readonly bookingRepository;
    private readonly leadEvents;
    private readonly logger;
    constructor(bookingRepository: BookingRepository, leadEvents: LeadEventsService);
    create(createDto: CreateBookingDto, companyId: string): Promise<BookingResponseDto>;
    createFromReply(replyId: string, companyId: string, meetingLink: string, metadata?: Record<string, any>): Promise<BookingResponseDto>;
    findAll(companyId: string, query: BookingQueryDto): Promise<{
        data: BookingResponseDto[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<BookingResponseDto>;
    update(id: string, companyId: string, dto: UpdateBookingDto): Promise<BookingResponseDto>;
    remove(id: string, companyId: string): Promise<void>;
    findByLead(leadId: string, companyId: string): Promise<BookingResponseDto[]>;
    findByReply(replyId: string, companyId: string): Promise<BookingResponseDto[]>;
    findByStatus(status: $Enums.BookingStatus, companyId: string): Promise<BookingResponseDto[]>;
    findUpcoming(companyId: string, limit?: number): Promise<BookingResponseDto[]>;
    findToday(companyId: string): Promise<BookingResponseDto[]>;
    findOverdue(companyId: string): Promise<BookingResponseDto[]>;
    getStats(companyId: string): Promise<BookingStatsDto>;
    reschedule(id: string, companyId: string, dto: RescheduleBookingDto): Promise<BookingResponseDto>;
    cancel(id: string, companyId: string, dto: CancelBookingDto): Promise<BookingResponseDto>;
    markAsCompleted(id: string, companyId: string): Promise<BookingResponseDto>;
    handleWorkflowCompletion(workflowData: {
        replyId: string;
        companyId: string;
        meetingLink: string;
        scheduledTime?: string;
        metadata?: Record<string, any>;
    }): Promise<void>;
    getBookingPriority(bookingId: string, companyId: string): Promise<'high' | 'medium' | 'low'>;
    getDashboardData(companyId: string): Promise<{
        upcoming: BookingResponseDto[];
        today: BookingResponseDto[];
        overdue: BookingResponseDto[];
        stats: BookingStatsDto;
    }>;
}
