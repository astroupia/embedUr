import { PrismaService } from '../../prisma/prisma.service';
import { BookingEntity } from '../entities/booking.entity';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto } from '../dto/booking.dto';
import { $Enums } from '../../../generated/prisma';
export declare class BookingRepository {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateBookingDto, companyId: string): Promise<BookingEntity>;
    findOne(id: string, companyId: string): Promise<BookingEntity | null>;
    findWithCursor(companyId: string, query: BookingQueryDto): Promise<{
        data: BookingEntity[];
        nextCursor: string | null;
    }>;
    update(id: string, companyId: string, dto: UpdateBookingDto): Promise<BookingEntity>;
    updateWithWorkflowData(id: string, companyId: string, workflowData: any): Promise<BookingEntity>;
    remove(id: string, companyId: string): Promise<void>;
    findByLead(leadId: string, companyId: string): Promise<BookingEntity[]>;
    findByReply(replyId: string, companyId: string): Promise<BookingEntity[]>;
    findByStatus(status: $Enums.BookingStatus, companyId: string): Promise<BookingEntity[]>;
    findUpcoming(companyId: string, limit?: number): Promise<BookingEntity[]>;
    findToday(companyId: string): Promise<BookingEntity[]>;
    findOverdue(companyId: string): Promise<BookingEntity[]>;
    countByCompany(companyId: string): Promise<number>;
    countByStatus(status: $Enums.BookingStatus, companyId: string): Promise<number>;
    countUpcoming(companyId: string): Promise<number>;
    countToday(companyId: string): Promise<number>;
    countOverdue(companyId: string): Promise<number>;
    getStats(companyId: string): Promise<any>;
    private getStatusStats;
    createFromWebhook(data: {
        leadId: string;
        companyId: string;
        calendlyLink: string;
        status: $Enums.BookingStatus;
        scheduledTime: Date;
    }): Promise<BookingEntity>;
    updateLeadStatus(leadId: string, companyId: string, status: string): Promise<void>;
    createSystemNotification(companyId: string, message: string, level: string): Promise<void>;
}
