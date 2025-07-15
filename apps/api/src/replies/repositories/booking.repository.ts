import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingEntity } from '../entities/booking.entity';
import { BookingMapper } from '../mappers/booking.mapper';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto } from '../dto/booking.dto';
import { $Enums } from '../../../generated/prisma';

@Injectable()
export class BookingRepository {
  private readonly logger = new Logger(BookingRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new booking
   */
  async create(dto: CreateBookingDto, companyId: string): Promise<BookingEntity> {
    this.logger.log(`Creating booking for company ${companyId}`);

    const data = BookingMapper.toCreateData(dto, companyId);
    
    const booking = await this.prisma.booking.create({
      data,
      include: {
        lead: true,
      },
    });

    this.logger.log(`Booking created: ${booking.id}`);
    return BookingMapper.toEntity(booking)!;
  }

  /**
   * Find booking by ID within company scope
   */
  async findOne(id: string, companyId: string): Promise<BookingEntity | null> {
    this.logger.log(`Finding booking ${id} in company ${companyId}`);

    const booking = await this.prisma.booking.findFirst({
      where: { id, companyId },
      include: {
        lead: true,
      },
    });

    return booking ? BookingMapper.toEntity(booking) : null;
  }

  /**
   * Find bookings with pagination and filtering
   */
  async findWithCursor(companyId: string, query: BookingQueryDto): Promise<{
    data: BookingEntity[];
    nextCursor: string | null;
  }> {
    this.logger.log(`Finding bookings for company ${companyId} with cursor: ${query.cursor}`);

    const where: any = { companyId };

    // Apply filters
    if (query.leadId) where.leadId = query.leadId;
    if (query.status) where.status = query.status;
    if (query.active) {
      where.status = {
        in: [$Enums.BookingStatus.BOOKED, $Enums.BookingStatus.RESCHEDULED],
      };
    }
    if (query.upcoming) {
      where.scheduledTime = { gt: new Date() };
    }
    if (query.today) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.scheduledTime = {
        gte: today,
        lt: tomorrow,
      };
    }
    if (query.overdue) {
      where.scheduledTime = { lt: new Date() };
      where.status = {
        in: [$Enums.BookingStatus.BOOKED, $Enums.BookingStatus.RESCHEDULED],
      };
    }

    // Apply cursor pagination
    if (query.cursor) {
      where.id = { gt: query.cursor };
    }

    const limit = query.limit || 10;
    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        lead: true,
      },
      orderBy: { scheduledTime: 'asc' },
      take: limit + 1, // Take one extra to check if there are more
    });

    const hasNext = bookings.length > limit;
    const data = bookings.slice(0, limit);
    const nextCursor = hasNext ? data[data.length - 1].id : null;

    return {
      data: BookingMapper.toEntityArray(data),
      nextCursor,
    };
  }

  /**
   * Update booking
   */
  async update(id: string, companyId: string, dto: UpdateBookingDto): Promise<BookingEntity> {
    this.logger.log(`Updating booking ${id} in company ${companyId}`);

    const data = BookingMapper.toUpdateData(dto);
    
    const booking = await this.prisma.booking.update({
      where: { id, companyId },
      data,
      include: {
        lead: true,
      },
    });

    this.logger.log(`Booking updated: ${booking.id}`);
    return BookingMapper.toEntity(booking)!;
  }

  /**
   * Update booking with workflow completion data
   */
  async updateWithWorkflowData(id: string, companyId: string, workflowData: any): Promise<BookingEntity> {
    this.logger.log(`Updating booking ${id} with workflow data in company ${companyId}`);

    const data = BookingMapper.toWorkflowUpdateData(workflowData);
    
    const booking = await this.prisma.booking.update({
      where: { id, companyId },
      data,
      include: {
        lead: true,
      },
    });

    this.logger.log(`Booking updated with workflow data: ${booking.id}`);
    return BookingMapper.toEntity(booking)!;
  }

  /**
   * Delete booking
   */
  async remove(id: string, companyId: string): Promise<void> {
    this.logger.log(`Removing booking ${id} from company ${companyId}`);

    await this.prisma.booking.delete({
      where: { id, companyId },
    });

    this.logger.log(`Booking removed: ${id}`);
  }

  /**
   * Find bookings by lead
   */
  async findByLead(leadId: string, companyId: string): Promise<BookingEntity[]> {
    this.logger.log(`Finding bookings for lead ${leadId} in company ${companyId}`);

    const bookings = await this.prisma.booking.findMany({
      where: { leadId, companyId },
      include: {
        lead: true,
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return BookingMapper.toEntityArray(bookings);
  }

  /**
   * Find bookings by reply
   */
  async findByReply(replyId: string, companyId: string): Promise<BookingEntity[]> {
    this.logger.log(`Finding bookings for reply ${replyId} in company ${companyId}`);

    // Since there's no direct relation between Booking and Reply in the schema,
    // we'll need to find bookings that might be related through other means
    // For now, we'll return an empty array as this relationship needs to be implemented
    // based on the actual business logic requirements
    
    this.logger.warn(`findByReply method called but no direct relation exists between Booking and Reply`);
    return [];
  }

  /**
   * Find bookings by status
   */
  async findByStatus(status: $Enums.BookingStatus, companyId: string): Promise<BookingEntity[]> {
    this.logger.log(`Finding bookings with status ${status} in company ${companyId}`);

    const bookings = await this.prisma.booking.findMany({
      where: { status, companyId },
      include: {
        lead: true,
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return BookingMapper.toEntityArray(bookings);
  }

  /**
   * Find upcoming bookings
   */
  async findUpcoming(companyId: string, limit: number = 10): Promise<BookingEntity[]> {
    this.logger.log(`Finding upcoming bookings for company ${companyId}`);

    const bookings = await this.prisma.booking.findMany({
      where: {
        companyId,
        scheduledTime: { gt: new Date() },
        status: {
          in: [$Enums.BookingStatus.BOOKED, $Enums.BookingStatus.RESCHEDULED],
        },
      },
      include: {
        lead: true,
      },
      orderBy: { scheduledTime: 'asc' },
      take: limit,
    });

    return BookingMapper.toEntityArray(bookings);
  }

  /**
   * Find today's bookings
   */
  async findToday(companyId: string): Promise<BookingEntity[]> {
    this.logger.log(`Finding today's bookings for company ${companyId}`);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        companyId,
        scheduledTime: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: [$Enums.BookingStatus.BOOKED, $Enums.BookingStatus.RESCHEDULED],
        },
      },
      include: {
        lead: true,
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return BookingMapper.toEntityArray(bookings);
  }

  /**
   * Find overdue bookings
   */
  async findOverdue(companyId: string): Promise<BookingEntity[]> {
    this.logger.log(`Finding overdue bookings for company ${companyId}`);

    const bookings = await this.prisma.booking.findMany({
      where: {
        companyId,
        scheduledTime: { lt: new Date() },
        status: {
          in: [$Enums.BookingStatus.BOOKED, $Enums.BookingStatus.RESCHEDULED],
        },
      },
      include: {
        lead: true,
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return BookingMapper.toEntityArray(bookings);
  }

  /**
   * Count bookings by company
   */
  async countByCompany(companyId: string): Promise<number> {
    return this.prisma.booking.count({
      where: { companyId },
    });
  }

  /**
   * Count bookings by status
   */
  async countByStatus(status: $Enums.BookingStatus, companyId: string): Promise<number> {
    this.logger.log(`Counting bookings with status ${status} in company ${companyId}`);

    return this.prisma.booking.count({
      where: { status, companyId },
    });
  }

  /**
   * Count upcoming bookings
   */
  async countUpcoming(companyId: string): Promise<number> {
    return this.prisma.booking.count({
      where: {
        companyId,
        scheduledTime: { gt: new Date() },
        status: {
          in: [$Enums.BookingStatus.BOOKED, $Enums.BookingStatus.RESCHEDULED],
        },
      },
    });
  }

  /**
   * Count today's bookings
   */
  async countToday(companyId: string): Promise<number> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.booking.count({
      where: {
        companyId,
        scheduledTime: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: [$Enums.BookingStatus.BOOKED, $Enums.BookingStatus.RESCHEDULED],
        },
      },
    });
  }

  /**
   * Count overdue bookings
   */
  async countOverdue(companyId: string): Promise<number> {
    return this.prisma.booking.count({
      where: {
        companyId,
        scheduledTime: { lt: new Date() },
        status: {
          in: [$Enums.BookingStatus.BOOKED, $Enums.BookingStatus.RESCHEDULED],
        },
      },
    });
  }

  /**
   * Get booking statistics
   */
  async getStats(companyId: string): Promise<any> {
    this.logger.log(`Getting booking stats for company ${companyId}`);

    const [
      total,
      upcoming,
      today,
      overdue,
      statusStats,
    ] = await Promise.all([
      this.countByCompany(companyId),
      this.countUpcoming(companyId),
      this.countToday(companyId),
      this.countOverdue(companyId),
      this.getStatusStats(companyId),
    ]);

    return {
      total,
      upcoming,
      today,
      overdue,
      byStatus: statusStats,
    };
  }

  /**
   * Get status statistics
   */
  private async getStatusStats(companyId: string): Promise<Record<$Enums.BookingStatus, number>> {
    const stats = await this.prisma.booking.groupBy({
      by: ['status'],
      where: { companyId },
      _count: {
        status: true,
      },
    });

    const result: Record<$Enums.BookingStatus, number> = {
      [$Enums.BookingStatus.BOOKED]: 0,
      [$Enums.BookingStatus.RESCHEDULED]: 0,
      [$Enums.BookingStatus.CANCELLED]: 0,
      [$Enums.BookingStatus.COMPLETED]: 0,
    };

    for (const stat of stats) {
      result[stat.status as $Enums.BookingStatus] = stat._count.status;
    }

    return result;
  }

  /**
   * Create booking from webhook data
   */
  async createFromWebhook(data: {
    leadId: string;
    companyId: string;
    calendlyLink: string;
    status: $Enums.BookingStatus;
    scheduledTime: Date;
  }): Promise<BookingEntity> {
    this.logger.log(`Creating booking from webhook for lead ${data.leadId}`);

    const booking = await this.prisma.booking.create({
      data: {
        leadId: data.leadId,
        companyId: data.companyId,
        calendlyLink: data.calendlyLink,
        status: data.status,
        scheduledTime: data.scheduledTime,
      },
      include: {
        lead: true,
      },
    });

    this.logger.log(`Booking created from webhook: ${booking.id}`);
    return BookingMapper.toEntity(booking)!;
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId: string, companyId: string, status: string): Promise<void> {
    this.logger.log(`Updating lead ${leadId} status to ${status}`);

    await this.prisma.lead.updateMany({
      where: { id: leadId, companyId },
      data: { status: status as any },
    });
  }

  /**
   * Create system notification
   */
  async createSystemNotification(
    companyId: string,
    message: string,
    level: string
  ): Promise<void> {
    this.logger.log(`Creating system notification for company ${companyId}`);

    await this.prisma.systemNotification.create({
      data: {
        companyId,
        message,
        level: level as any,
      },
    });
  }
} 