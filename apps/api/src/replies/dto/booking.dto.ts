import { IsString, IsOptional, IsEnum, IsNotEmpty, IsDateString, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, BOOKING_VALIDATION_RULES } from '../constants/reply.constants';
import { $Enums } from '../../../generated/prisma';

export class CreateBookingDto {
  @ApiProperty({ description: 'Calendly link for the meeting' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(BOOKING_VALIDATION_RULES.MAX_CALENDLY_LINK_LENGTH)
  calendlyLink: string;

  @ApiProperty({ description: 'Scheduled meeting time' })
  @IsDateString()
  @IsNotEmpty()
  scheduledTime: string;

  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiPropertyOptional({ description: 'Reply ID (if booking is from a reply)' })
  @IsOptional()
  @IsString()
  replyId?: string;

  @ApiPropertyOptional({ description: 'Booking status', enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: 'Calendly link for the meeting' })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(BOOKING_VALIDATION_RULES.MAX_CALENDLY_LINK_LENGTH)
  calendlyLink?: string;

  @ApiPropertyOptional({ description: 'Scheduled meeting time' })
  @IsOptional()
  @IsDateString()
  scheduledTime?: string;

  @ApiPropertyOptional({ description: 'Booking status', enum: BookingStatus })
  @IsOptional()
  @IsEnum($Enums.BookingStatus)
  status?: $Enums.BookingStatus;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  calendlyLink: string;

  @ApiProperty()
  scheduledTime: Date;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty()
  leadId: string;

  @ApiProperty()
  companyId: string;

  @ApiPropertyOptional()
  replyId: string | null;

  @ApiPropertyOptional()
  metadata: Record<string, any> | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Computed properties
  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isConfirmed: boolean;

  @ApiProperty()
  isCancelled: boolean;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  isUpcoming: boolean;

  @ApiProperty()
  isToday: boolean;

  @ApiProperty()
  timeUntilBooking: number;

  @ApiProperty()
  statusLabel: string;

  @ApiProperty()
  priority: 'high' | 'medium' | 'low';

  @ApiProperty()
  summary: string;

  @ApiProperty()
  relativeTime: string;

  @ApiPropertyOptional()
  calendlyEventId: string | null;

  @ApiProperty()
  isOverdue: boolean;

  @ApiPropertyOptional()
  durationMinutes: number | null;

  @ApiPropertyOptional()
  meetingType: string | null;
}

export class BookingStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  byStatus: Record<BookingStatus, number>;

  @ApiProperty()
  upcomingCount: number;

  @ApiProperty()
  todayCount: number;

  @ApiProperty()
  overdueCount: number;

  @ApiProperty()
  completionRate: number;

  @ApiProperty()
  averageBookingTime: number;
}

export class BookingQueryDto {
  @ApiPropertyOptional({ description: 'Lead ID filter' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ description: 'Reply ID filter' })
  @IsOptional()
  @IsString()
  replyId?: string;

  @ApiPropertyOptional({ description: 'Status filter', enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Active bookings only' })
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Upcoming bookings only' })
  @IsOptional()
  upcoming?: boolean;

  @ApiPropertyOptional({ description: 'Today\'s bookings only' })
  @IsOptional()
  today?: boolean;

  @ApiPropertyOptional({ description: 'Overdue bookings only' })
  @IsOptional()
  overdue?: boolean;

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of items to return', default: 20 })
  @IsOptional()
  limit?: number = 20;
}

export class RescheduleBookingDto {
  @ApiProperty({ description: 'New Calendly link' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(BOOKING_VALIDATION_RULES.MAX_CALENDLY_LINK_LENGTH)
  calendlyLink: string;

  @ApiProperty({ description: 'New scheduled time' })
  @IsDateString()
  @IsNotEmpty()
  scheduledTime: string;

  @ApiPropertyOptional({ description: 'Reason for rescheduling' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CancelBookingDto {
  @ApiPropertyOptional({ description: 'Reason for cancellation' })
  @IsOptional()
  @IsString()
  reason?: string;
} 