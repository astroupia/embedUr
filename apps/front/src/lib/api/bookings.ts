import { apiClient } from './client';
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  RescheduleBookingRequest,
  CancelBookingRequest,
  QueryBookingsRequest,
  PaginatedResponse,
} from './client';

// Bookings API class that uses the base client
export class BookingsAPI {
  private client = apiClient;

  /**
   * Create a new booking
   */
  async create(data: CreateBookingRequest): Promise<Booking> {
    return this.client.createBooking(data);
  }

  /**
   * Get all bookings with pagination and filtering
   */
  async getAll(params?: QueryBookingsRequest): Promise<PaginatedResponse<Booking>> {
    return this.client.getBookings(params);
  }

  /**
   * Get a specific booking by ID
   */
  async getById(id: string): Promise<Booking> {
    return this.client.getBooking(id);
  }

  /**
   * Update a booking
   */
  async update(id: string, data: UpdateBookingRequest): Promise<Booking> {
    return this.client.updateBooking(id, data);
  }

  /**
   * Delete a booking
   */
  async delete(id: string): Promise<void> {
    return this.client.deleteBooking(id);
  }

  /**
   * Reschedule a booking
   */
  async reschedule(id: string, data: RescheduleBookingRequest): Promise<Booking> {
    return this.client.rescheduleBooking(id, data);
  }

  /**
   * Cancel a booking
   */
  async cancel(id: string, data: CancelBookingRequest): Promise<Booking> {
    return this.client.cancelBooking(id, data);
  }
}

// Export types for convenience
export type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  RescheduleBookingRequest,
  CancelBookingRequest,
  QueryBookingsRequest,
  PaginatedResponse,
}; 