import { BookingStatus } from '../constants/reply.constants';

export class BookingEntity {
  constructor(
    public readonly id: string,
    public readonly calendlyLink: string,
    public readonly scheduledTime: Date,
    public readonly status: BookingStatus,
    public readonly leadId: string,
    public readonly companyId: string,
    public readonly replyId: string | null,
    public readonly metadata: Record<string, any> | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Check if booking is active (not cancelled or completed)
   */
  get isActive(): boolean {
    return this.status === BookingStatus.BOOKED || 
           this.status === BookingStatus.PENDING ||
           this.status === BookingStatus.RESCHEDULED;
  }

  /**
   * Check if booking is confirmed
   */
  get isConfirmed(): boolean {
    return this.status === BookingStatus.BOOKED || 
           this.status === BookingStatus.RESCHEDULED;
  }

  /**
   * Check if booking is cancelled
   */
  get isCancelled(): boolean {
    return this.status === BookingStatus.CANCELLED;
  }

  /**
   * Check if booking is completed
   */
  get isCompleted(): boolean {
    return this.status === BookingStatus.COMPLETED;
  }

  /**
   * Check if booking is in the future
   */
  get isUpcoming(): boolean {
    return this.scheduledTime > new Date();
  }

  /**
   * Check if booking is today
   */
  get isToday(): boolean {
    const today = new Date();
    const bookingDate = new Date(this.scheduledTime);
    return bookingDate.toDateString() === today.toDateString();
  }

  /**
   * Get time until booking in minutes
   */
  get timeUntilBooking(): number {
    const now = new Date();
    const diffMs = this.scheduledTime.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Get booking status label
   */
  get statusLabel(): string {
    const labels = {
      [BookingStatus.BOOKED]: 'Booked',
      [BookingStatus.RESCHEDULED]: 'Rescheduled',
      [BookingStatus.CANCELLED]: 'Cancelled',
      [BookingStatus.COMPLETED]: 'Completed',
      [BookingStatus.PENDING]: 'Pending',
    };
    return labels[this.status] || 'Unknown';
  }

  /**
   * Get booking priority
   */
  get priority(): 'high' | 'medium' | 'low' {
    if (this.isToday) return 'high';
    if (this.timeUntilBooking < 24 * 60) return 'medium'; // Within 24 hours
    return 'low';
  }

  /**
   * Check if booking can be rescheduled
   */
  canBeRescheduled(): boolean {
    return this.isActive && this.timeUntilBooking > 60; // More than 1 hour away
  }

  /**
   * Check if booking can be cancelled
   */
  canBeCancelled(): boolean {
    return this.isActive && this.timeUntilBooking > 0;
  }

  /**
   * Check if booking can be marked as completed
   */
  canBeCompleted(): boolean {
    return this.isConfirmed && this.timeUntilBooking < -60; // More than 1 hour past
  }

  /**
   * Get booking summary for display
   */
  get summary(): string {
    const date = this.scheduledTime.toLocaleDateString();
    const time = this.scheduledTime.toLocaleTimeString();
    return `${this.statusLabel} - ${date} at ${time}`;
  }

  /**
   * Get relative time description
   */
  get relativeTime(): string {
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

  /**
   * Get Calendly event ID from link
   */
  get calendlyEventId(): string | null {
    try {
      const url = new URL(this.calendlyLink);
      const pathParts = url.pathname.split('/');
      return pathParts[pathParts.length - 1] || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if booking is overdue (past scheduled time but not completed)
   */
  get isOverdue(): boolean {
    return this.isConfirmed && this.timeUntilBooking < -30; // More than 30 minutes past
  }

  /**
   * Get booking duration in minutes (if available in metadata)
   */
  get durationMinutes(): number | null {
    return this.metadata?.durationMinutes || null;
  }

  /**
   * Get meeting type (if available in metadata)
   */
  get meetingType(): string | null {
    return this.metadata?.meetingType || null;
  }
} 