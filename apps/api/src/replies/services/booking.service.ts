import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { LeadEventsService } from '../../leads/services/lead-events.service';
import { BookingEntity } from '../entities/booking.entity';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto, BookingResponseDto, BookingStatsDto, RescheduleBookingDto, CancelBookingDto } from '../dto/booking.dto';
import { BookingMapper } from '../mappers/booking.mapper';
import { $Enums } from '../../../generated/prisma';
import { BookingStatus } from '../constants/reply.constants';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly leadEvents: LeadEventsService,
  ) {}

  /**
   * Create new booking
   */
  async create(createDto: CreateBookingDto, companyId: string): Promise<BookingResponseDto> {
    this.logger.log(`Creating booking for company ${companyId}`);

    const booking = await this.bookingRepository.create(createDto, companyId);

    // Log the creation
    await this.leadEvents.logExecution(booking, 'BOOKING_CREATED', {
      leadId: booking.leadId,
      replyId: booking.replyId,
      calendlyLink: booking.calendlyLink,
      scheduledTime: booking.scheduledTime.toISOString(),
    });

    this.logger.log(`Booking created successfully: ${booking.id}`);
    const responseDto = BookingMapper.toDto(booking);
    if (!responseDto) {
      throw new Error('Failed to create booking DTO');
    }
    return responseDto;
  }

  /**
   * Create booking from reply (automated)
   */
  async createFromReply(replyId: string, companyId: string, meetingLink: string, metadata?: Record<string, any>): Promise<BookingResponseDto> {
    this.logger.log(`Creating booking from reply ${replyId} in company ${companyId}`);

    // Get reply to extract lead information
    // In a real implementation, you would inject the reply service or repository
    // For now, we'll create a minimal booking
    const bookingData = {
      calendlyLink: meetingLink,
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow
      leadId: 'temp-lead-id', // This would come from the reply
      replyId,
      metadata: {
        ...metadata,
        createdFromReply: true,
        replyId,
      },
    };

    const booking = await this.bookingRepository.create(bookingData, companyId);

    // Log the creation
    await this.leadEvents.logExecution(booking, 'BOOKING_CREATED_FROM_REPLY', {
      replyId,
      calendlyLink: meetingLink,
      automated: true,
    });

    this.logger.log(`Booking created from reply successfully: ${booking.id}`);
    const responseDto = BookingMapper.toDto(booking);
    if (!responseDto) {
      throw new Error('Failed to create booking DTO');
    }
    return responseDto;
  }

  /**
   * Find bookings with pagination and filtering
   */
  async findAll(companyId: string, query: BookingQueryDto): Promise<{
    data: BookingResponseDto[];
    nextCursor: string | null;
  }> {
    this.logger.log(`Fetching bookings for company ${companyId} with cursor: ${query.cursor}`);
    
    const result = await this.bookingRepository.findWithCursor(companyId, query);
    
    this.logger.log(`Found ${result.data.length} bookings for company ${companyId}`);
    return {
      data: BookingMapper.toDtoArray(result.data),
      nextCursor: result.nextCursor,
    };
  }

  /**
   * Find booking by ID
   */
  async findOne(id: string, companyId: string): Promise<BookingResponseDto> {
    this.logger.log(`Fetching booking ${id} for company ${companyId}`);
    
    const booking = await this.bookingRepository.findOne(id, companyId);
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    this.logger.log(`Booking ${id} found successfully`);
    const dto = BookingMapper.toDto(booking);
    if (!dto) {
      throw new Error('Failed to create booking DTO');
    }
    return dto;
  }

  /**
   * Update booking
   */
  async update(id: string, companyId: string, dto: UpdateBookingDto): Promise<BookingResponseDto> {
    this.logger.log(`Updating booking ${id} for company ${companyId}`);

    // Get current booking to check if it can be updated
    const currentBooking = await this.bookingRepository.findOne(id, companyId);
    if (!currentBooking) {
      throw new NotFoundException('Booking not found');
    }

    if (!currentBooking.isActive) {
      throw new ConflictException('Cannot update inactive booking');
    }

    // Update the booking
    const updatedBooking = await this.bookingRepository.update(id, companyId, dto);

    // Log the update
    await this.leadEvents.logExecution(updatedBooking, 'BOOKING_UPDATED', {
      previousStatus: currentBooking.status,
      newStatus: updatedBooking.status,
      previousScheduledTime: currentBooking.scheduledTime.toISOString(),
      newScheduledTime: updatedBooking.scheduledTime.toISOString(),
    });

    this.logger.log(`Booking ${id} updated successfully`);
    const responseDto = BookingMapper.toDto(updatedBooking);
    if (!responseDto) {
      throw new Error('Failed to create booking DTO');
    }
    return responseDto;
  }

  /**
   * Remove booking
   */
  async remove(id: string, companyId: string): Promise<void> {
    this.logger.log(`Removing booking ${id} for company ${companyId}`);

    // Get booking before deletion for logging
    const booking = await this.bookingRepository.findOne(id, companyId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Remove the booking
    await this.bookingRepository.remove(id, companyId);

    // Log the deletion
    await this.leadEvents.logExecution(booking, 'BOOKING_DELETED', {
      leadId: booking.leadId,
      replyId: booking.replyId,
      status: booking.status,
      scheduledTime: booking.scheduledTime.toISOString(),
    });

    this.logger.log(`Booking ${id} removed successfully`);
  }

  /**
   * Find bookings by lead
   */
  async findByLead(leadId: string, companyId: string): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching bookings for lead ${leadId} in company ${companyId}`);
    
    const bookings = await this.bookingRepository.findByLead(leadId, companyId);
    
    this.logger.log(`Found ${bookings.length} bookings for lead ${leadId}`);
    return BookingMapper.toDtoArray(bookings);
  }

  /**
   * Find bookings by reply
   */
  async findByReply(replyId: string, companyId: string): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching bookings for reply ${replyId} in company ${companyId}`);
    
    const bookings = await this.bookingRepository.findByReply(replyId, companyId);
    
    this.logger.log(`Found ${bookings.length} bookings for reply ${replyId}`);
    return BookingMapper.toDtoArray(bookings);
  }

  /**
   * Find bookings by status
   */
  async findByStatus(status: $Enums.BookingStatus, companyId: string): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching bookings with status ${status} in company ${companyId}`);
    
    const bookings = await this.bookingRepository.findByStatus(status, companyId);
    
    this.logger.log(`Found ${bookings.length} bookings with status ${status}`);
    return BookingMapper.toDtoArray(bookings);
  }

  /**
   * Find upcoming bookings
   */
  async findUpcoming(companyId: string, limit: number = 10): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching upcoming bookings in company ${companyId}`);
    
    const bookings = await this.bookingRepository.findUpcoming(companyId, limit);
    
    this.logger.log(`Found ${bookings.length} upcoming bookings`);
    return BookingMapper.toDtoArray(bookings);
  }

  /**
   * Find today's bookings
   */
  async findToday(companyId: string): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching today's bookings in company ${companyId}`);
    
    const bookings = await this.bookingRepository.findToday(companyId);
    
    this.logger.log(`Found ${bookings.length} bookings for today`);
    return BookingMapper.toDtoArray(bookings);
  }

  /**
   * Find overdue bookings
   */
  async findOverdue(companyId: string): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching overdue bookings in company ${companyId}`);
    
    const bookings = await this.bookingRepository.findOverdue(companyId);
    
    this.logger.log(`Found ${bookings.length} overdue bookings`);
    return BookingMapper.toDtoArray(bookings);
  }

  /**
   * Get booking statistics
   */
  async getStats(companyId: string): Promise<BookingStatsDto> {
    this.logger.log(`Fetching booking stats for company ${companyId}`);

    const stats = await this.bookingRepository.getStats(companyId);

    this.logger.log(`Booking stats for company ${companyId}: total=${stats.total}`);
    return stats;
  }

  /**
   * Reschedule booking
   */
  async reschedule(id: string, companyId: string, dto: RescheduleBookingDto): Promise<BookingResponseDto> {
    this.logger.log(`Rescheduling booking ${id} for company ${companyId}`);

    const booking = await this.bookingRepository.findOne(id, companyId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.canBeRescheduled()) {
      throw new ConflictException('Booking cannot be rescheduled');
    }

    // Validate new scheduled time is in the future
    const newScheduledTime = new Date(dto.scheduledTime);
    if (newScheduledTime <= new Date()) {
      throw new BadRequestException('New scheduled time must be in the future');
    }

    const updatedBooking = await this.bookingRepository.update(id, companyId, {
      calendlyLink: dto.calendlyLink,
      scheduledTime: dto.scheduledTime,
      status: BookingStatus.RESCHEDULED,
      metadata: {
        ...booking.metadata,
        rescheduledAt: new Date().toISOString(),
        rescheduleReason: dto.reason,
        previousScheduledTime: booking.scheduledTime.toISOString(),
      },
    });

    // Log the rescheduling
    await this.leadEvents.logExecution(updatedBooking, 'BOOKING_RESCHEDULED', {
      previousScheduledTime: booking.scheduledTime.toISOString(),
      newScheduledTime: dto.scheduledTime,
      reason: dto.reason,
    });

    this.logger.log(`Booking ${id} rescheduled successfully`);
    const responseDto = BookingMapper.toDto(updatedBooking);
    if (!responseDto) {
      throw new Error('Failed to create booking DTO');
    }
    return responseDto;
  }

  /**
   * Cancel booking
   */
  async cancel(id: string, companyId: string, dto: CancelBookingDto): Promise<BookingResponseDto> {
    this.logger.log(`Cancelling booking ${id} for company ${companyId}`);

    const booking = await this.bookingRepository.findOne(id, companyId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.canBeCancelled()) {
      throw new ConflictException('Booking cannot be cancelled');
    }

    const updatedBooking = await this.bookingRepository.update(id, companyId, {
      status: BookingStatus.CANCELLED,
      metadata: {
        ...booking.metadata,
        cancelledAt: new Date().toISOString(),
        cancellationReason: dto.reason,
      },
    });

    // Log the cancellation
    await this.leadEvents.logExecution(updatedBooking, 'BOOKING_CANCELLED', {
      reason: dto.reason,
      scheduledTime: booking.scheduledTime.toISOString(),
    });

    this.logger.log(`Booking ${id} cancelled successfully`);
    const responseDto = BookingMapper.toDto(updatedBooking);
    if (!responseDto) {
      throw new Error('Failed to create booking DTO');
    }
    return responseDto;
  }

  /**
   * Mark booking as completed
   */
  async markAsCompleted(id: string, companyId: string): Promise<BookingResponseDto> {
    this.logger.log(`Marking booking ${id} as completed for company ${companyId}`);

    const booking = await this.bookingRepository.findOne(id, companyId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.canBeCompleted()) {
      throw new ConflictException('Booking cannot be marked as completed');
    }

    const updatedBooking = await this.bookingRepository.update(id, companyId, {
      status: BookingStatus.COMPLETED,
      metadata: {
        ...booking.metadata,
        completedAt: new Date().toISOString(),
      },
    });

    // Log the completion
    await this.leadEvents.logExecution(updatedBooking, 'BOOKING_COMPLETED', {
      scheduledTime: booking.scheduledTime.toISOString(),
      actualCompletionTime: new Date().toISOString(),
    });

    this.logger.log(`Booking ${id} marked as completed`);
    const responseDto = BookingMapper.toDto(updatedBooking);
    if (!responseDto) {
      throw new Error('Failed to create booking DTO');
    }
    return responseDto;
  }

  /**
   * Handle workflow completion for booking creation
   */
  async handleWorkflowCompletion(workflowData: {
    replyId: string;
    companyId: string;
    meetingLink: string;
    scheduledTime?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    this.logger.log(`Handling workflow completion for booking creation from reply ${workflowData.replyId}`);

    const { replyId, companyId, meetingLink, scheduledTime, metadata } = workflowData;

    // Create booking from workflow data
    await this.createFromReply(replyId, companyId, meetingLink, {
      ...metadata,
      workflowCompletedAt: new Date().toISOString(),
      scheduledTime: scheduledTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    this.logger.log(`Workflow completion handled for booking creation from reply ${replyId}`);
  }

  /**
   * Get booking priority
   */
  async getBookingPriority(bookingId: string, companyId: string): Promise<'high' | 'medium' | 'low'> {
    const booking = await this.bookingRepository.findOne(bookingId, companyId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking.priority;
  }

  /**
   * Get bookings dashboard data
   */
  async getDashboardData(companyId: string): Promise<{
    upcoming: BookingResponseDto[];
    today: BookingResponseDto[];
    overdue: BookingResponseDto[];
    stats: BookingStatsDto;
  }> {
    this.logger.log(`Fetching booking dashboard data for company ${companyId}`);

    const [upcoming, today, overdue, stats] = await Promise.all([
      this.findUpcoming(companyId, 5),
      this.findToday(companyId),
      this.findOverdue(companyId),
      this.getStats(companyId),
    ]);

    return {
      upcoming,
      today,
      overdue,
      stats,
    };
  }
} 