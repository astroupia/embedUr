import { BookingEntity } from '../entities/booking.entity';
import { BookingStatus } from '../constants/reply.constants';
import { BookingResponseDto } from '../dto/booking.dto';

export class BookingMapper {
  /**
   * Map Prisma model to BookingEntity
   */
  static toEntity(model: any): BookingEntity | null {
    if (!model) return null;

    return new BookingEntity(
      model.id,
      model.calendlyLink,
      model.scheduledTime,
      model.status as BookingStatus,
      model.leadId,
      model.companyId,
      null, // replyId is not in the Booking model
      model.metadata,
      model.createdAt,
      model.updatedAt,
    );
  }

  /**
   * Map BookingEntity to DTO
   */
  static toDto(entity: BookingEntity): BookingResponseDto | null {
    if (!entity) return null;

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
      // Computed properties
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

  /**
   * Map array of Prisma models to BookingEntity array
   */
  static toEntityArray(models: any[]): BookingEntity[] {
    if (!models || !Array.isArray(models)) return [];
    return models.map(model => this.toEntity(model)).filter((entity): entity is BookingEntity => entity !== null);
  }

  /**
   * Map array of BookingEntity to DTO array
   */
  static toDtoArray(entities: BookingEntity[]): BookingResponseDto[] {
    if (!entities || !Array.isArray(entities)) return [];
    return entities.map(entity => this.toDto(entity)).filter((dto): dto is BookingResponseDto => dto !== null);
  }

  /**
   * Map Prisma model with relations to BookingEntity
   */
  static toEntityWithRelations(model: any): BookingEntity | null {
    if (!model) return null;

    const entity = this.toEntity(model);
    if (!entity) return null;

    // Add any additional logic for handling relations
    if (model.lead) {
      // You could add lead information to metadata
    }

    if (model.reply) {
      // You could add reply information to metadata
    }

    return entity;
  }

  /**
   * Map DTO to Prisma create data
   */
  static toCreateData(dto: any, companyId: string): any {
    return {
      calendlyLink: dto.calendlyLink,
      scheduledTime: new Date(dto.scheduledTime),
      leadId: dto.leadId,
      companyId,
      status: dto.status || BookingStatus.BOOKED,
      metadata: dto.metadata || null,
    };
  }

  /**
   * Map DTO to Prisma update data
   */
  static toUpdateData(dto: any): any {
    const updateData: any = {};

    if (dto.calendlyLink !== undefined) updateData.calendlyLink = dto.calendlyLink;
    if (dto.scheduledTime !== undefined) updateData.scheduledTime = new Date(dto.scheduledTime);
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    return updateData;
  }

  /**
   * Map workflow completion data to update data
   */
  static toWorkflowUpdateData(workflowData: any): any {
    const updateData: any = {};

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

  /**
   * Create a summary for booking statistics
   */
  static createStatsSummary(bookings: BookingEntity[]): any {
    const total = bookings.length;
    const byStatus = {
      [BookingStatus.BOOKED]: 0,
      [BookingStatus.RESCHEDULED]: 0,
      [BookingStatus.CANCELLED]: 0,
      [BookingStatus.COMPLETED]: 0,
      [BookingStatus.PENDING]: 0,
    };

    let upcomingCount = 0;
    let todayCount = 0;
    let overdueCount = 0;
    let completedCount = 0;

    bookings.forEach(booking => {
      byStatus[booking.status]++;
      
      if (booking.isUpcoming) upcomingCount++;
      if (booking.isToday) todayCount++;
      if (booking.isOverdue) overdueCount++;
      if (booking.isCompleted) completedCount++;
    });

    const completionRate = total > 0 ? (completedCount / total) * 100 : 0;
    
    // Calculate average booking time (time from creation to scheduled time)
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