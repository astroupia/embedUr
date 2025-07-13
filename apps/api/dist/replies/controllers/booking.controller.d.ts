import { BookingService } from '../services/booking.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto, BookingResponseDto, BookingStatsDto, RescheduleBookingDto, CancelBookingDto } from '../dto/booking.dto';
import { $Enums } from '../../../generated/prisma';
export declare class BookingController {
    private readonly bookingService;
    private readonly logger;
    constructor(bookingService: BookingService);
    create(dto: CreateBookingDto, user: any): Promise<BookingResponseDto>;
    findAll(query: BookingQueryDto, user: any): Promise<{
        data: BookingResponseDto[];
        nextCursor: string | null;
    }>;
    findByLead(leadId: string, user: any): Promise<BookingResponseDto[]>;
    findByReply(replyId: string, user: any): Promise<BookingResponseDto[]>;
    findByStatus(status: $Enums.BookingStatus, req: any): Promise<BookingResponseDto[]>;
    findUpcoming(limit: number | undefined, user: any): Promise<BookingResponseDto[]>;
    findToday(user: any): Promise<BookingResponseDto[]>;
    findOverdue(user: any): Promise<BookingResponseDto[]>;
    getStats(user: any): Promise<BookingStatsDto>;
    getDashboardData(user: any): Promise<{
        upcoming: BookingResponseDto[];
        today: BookingResponseDto[];
        overdue: BookingResponseDto[];
        stats: BookingStatsDto;
    }>;
    findOne(id: string, user: any): Promise<BookingResponseDto>;
    update(id: string, dto: UpdateBookingDto, user: any): Promise<BookingResponseDto>;
    remove(id: string, user: any): Promise<void>;
    reschedule(id: string, dto: RescheduleBookingDto, user: any): Promise<BookingResponseDto>;
    cancel(id: string, dto: CancelBookingDto, user: any): Promise<BookingResponseDto>;
    markAsCompleted(id: string, user: any): Promise<BookingResponseDto>;
    getBookingPriority(id: string, user: any): Promise<{
        priority: 'high' | 'medium' | 'low';
    }>;
}
