"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BookingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const booking_repository_1 = require("../repositories/booking.repository");
const lead_events_service_1 = require("../../leads/services/lead-events.service");
const booking_mapper_1 = require("../mappers/booking.mapper");
const reply_constants_1 = require("../constants/reply.constants");
let BookingService = BookingService_1 = class BookingService {
    bookingRepository;
    leadEvents;
    logger = new common_1.Logger(BookingService_1.name);
    constructor(bookingRepository, leadEvents) {
        this.bookingRepository = bookingRepository;
        this.leadEvents = leadEvents;
    }
    async create(createDto, companyId) {
        this.logger.log(`Creating booking for company ${companyId}`);
        const booking = await this.bookingRepository.create(createDto, companyId);
        await this.leadEvents.logExecution(booking, 'BOOKING_CREATED', {
            leadId: booking.leadId,
            replyId: booking.replyId,
            calendlyLink: booking.calendlyLink,
            scheduledTime: booking.scheduledTime.toISOString(),
        });
        this.logger.log(`Booking created successfully: ${booking.id}`);
        const responseDto = booking_mapper_1.BookingMapper.toDto(booking);
        if (!responseDto) {
            throw new Error('Failed to create booking DTO');
        }
        return responseDto;
    }
    async createFromReply(replyId, companyId, meetingLink, metadata) {
        this.logger.log(`Creating booking from reply ${replyId} in company ${companyId}`);
        const bookingData = {
            calendlyLink: meetingLink,
            scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            leadId: 'temp-lead-id',
            replyId,
            metadata: {
                ...metadata,
                createdFromReply: true,
                replyId,
            },
        };
        const booking = await this.bookingRepository.create(bookingData, companyId);
        await this.leadEvents.logExecution(booking, 'BOOKING_CREATED_FROM_REPLY', {
            replyId,
            calendlyLink: meetingLink,
            automated: true,
        });
        this.logger.log(`Booking created from reply successfully: ${booking.id}`);
        const responseDto = booking_mapper_1.BookingMapper.toDto(booking);
        if (!responseDto) {
            throw new Error('Failed to create booking DTO');
        }
        return responseDto;
    }
    async findAll(companyId, query) {
        this.logger.log(`Fetching bookings for company ${companyId} with cursor: ${query.cursor}`);
        const result = await this.bookingRepository.findWithCursor(companyId, query);
        this.logger.log(`Found ${result.data.length} bookings for company ${companyId}`);
        return {
            data: booking_mapper_1.BookingMapper.toDtoArray(result.data),
            nextCursor: result.nextCursor,
        };
    }
    async findOne(id, companyId) {
        this.logger.log(`Fetching booking ${id} for company ${companyId}`);
        const booking = await this.bookingRepository.findOne(id, companyId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        this.logger.log(`Booking ${id} found successfully`);
        const dto = booking_mapper_1.BookingMapper.toDto(booking);
        if (!dto) {
            throw new Error('Failed to create booking DTO');
        }
        return dto;
    }
    async update(id, companyId, dto) {
        this.logger.log(`Updating booking ${id} for company ${companyId}`);
        const currentBooking = await this.bookingRepository.findOne(id, companyId);
        if (!currentBooking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (!currentBooking.isActive) {
            throw new common_1.ConflictException('Cannot update inactive booking');
        }
        const updatedBooking = await this.bookingRepository.update(id, companyId, dto);
        await this.leadEvents.logExecution(updatedBooking, 'BOOKING_UPDATED', {
            previousStatus: currentBooking.status,
            newStatus: updatedBooking.status,
            previousScheduledTime: currentBooking.scheduledTime.toISOString(),
            newScheduledTime: updatedBooking.scheduledTime.toISOString(),
        });
        this.logger.log(`Booking ${id} updated successfully`);
        const responseDto = booking_mapper_1.BookingMapper.toDto(updatedBooking);
        if (!responseDto) {
            throw new Error('Failed to create booking DTO');
        }
        return responseDto;
    }
    async remove(id, companyId) {
        this.logger.log(`Removing booking ${id} for company ${companyId}`);
        const booking = await this.bookingRepository.findOne(id, companyId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        await this.bookingRepository.remove(id, companyId);
        await this.leadEvents.logExecution(booking, 'BOOKING_DELETED', {
            leadId: booking.leadId,
            replyId: booking.replyId,
            status: booking.status,
            scheduledTime: booking.scheduledTime.toISOString(),
        });
        this.logger.log(`Booking ${id} removed successfully`);
    }
    async findByLead(leadId, companyId) {
        this.logger.log(`Fetching bookings for lead ${leadId} in company ${companyId}`);
        const bookings = await this.bookingRepository.findByLead(leadId, companyId);
        this.logger.log(`Found ${bookings.length} bookings for lead ${leadId}`);
        return booking_mapper_1.BookingMapper.toDtoArray(bookings);
    }
    async findByReply(replyId, companyId) {
        this.logger.log(`Fetching bookings for reply ${replyId} in company ${companyId}`);
        const bookings = await this.bookingRepository.findByReply(replyId, companyId);
        this.logger.log(`Found ${bookings.length} bookings for reply ${replyId}`);
        return booking_mapper_1.BookingMapper.toDtoArray(bookings);
    }
    async findByStatus(status, companyId) {
        this.logger.log(`Fetching bookings with status ${status} in company ${companyId}`);
        const bookings = await this.bookingRepository.findByStatus(status, companyId);
        this.logger.log(`Found ${bookings.length} bookings with status ${status}`);
        return booking_mapper_1.BookingMapper.toDtoArray(bookings);
    }
    async findUpcoming(companyId, limit = 10) {
        this.logger.log(`Fetching upcoming bookings in company ${companyId}`);
        const bookings = await this.bookingRepository.findUpcoming(companyId, limit);
        this.logger.log(`Found ${bookings.length} upcoming bookings`);
        return booking_mapper_1.BookingMapper.toDtoArray(bookings);
    }
    async findToday(companyId) {
        this.logger.log(`Fetching today's bookings in company ${companyId}`);
        const bookings = await this.bookingRepository.findToday(companyId);
        this.logger.log(`Found ${bookings.length} bookings for today`);
        return booking_mapper_1.BookingMapper.toDtoArray(bookings);
    }
    async findOverdue(companyId) {
        this.logger.log(`Fetching overdue bookings in company ${companyId}`);
        const bookings = await this.bookingRepository.findOverdue(companyId);
        this.logger.log(`Found ${bookings.length} overdue bookings`);
        return booking_mapper_1.BookingMapper.toDtoArray(bookings);
    }
    async getStats(companyId) {
        this.logger.log(`Fetching booking stats for company ${companyId}`);
        const stats = await this.bookingRepository.getStats(companyId);
        this.logger.log(`Booking stats for company ${companyId}: total=${stats.total}`);
        return stats;
    }
    async reschedule(id, companyId, dto) {
        this.logger.log(`Rescheduling booking ${id} for company ${companyId}`);
        const booking = await this.bookingRepository.findOne(id, companyId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (!booking.canBeRescheduled()) {
            throw new common_1.ConflictException('Booking cannot be rescheduled');
        }
        const newScheduledTime = new Date(dto.scheduledTime);
        if (newScheduledTime <= new Date()) {
            throw new common_1.BadRequestException('New scheduled time must be in the future');
        }
        const updatedBooking = await this.bookingRepository.update(id, companyId, {
            calendlyLink: dto.calendlyLink,
            scheduledTime: dto.scheduledTime,
            status: reply_constants_1.BookingStatus.RESCHEDULED,
            metadata: {
                ...booking.metadata,
                rescheduledAt: new Date().toISOString(),
                rescheduleReason: dto.reason,
                previousScheduledTime: booking.scheduledTime.toISOString(),
            },
        });
        await this.leadEvents.logExecution(updatedBooking, 'BOOKING_RESCHEDULED', {
            previousScheduledTime: booking.scheduledTime.toISOString(),
            newScheduledTime: dto.scheduledTime,
            reason: dto.reason,
        });
        this.logger.log(`Booking ${id} rescheduled successfully`);
        const responseDto = booking_mapper_1.BookingMapper.toDto(updatedBooking);
        if (!responseDto) {
            throw new Error('Failed to create booking DTO');
        }
        return responseDto;
    }
    async cancel(id, companyId, dto) {
        this.logger.log(`Cancelling booking ${id} for company ${companyId}`);
        const booking = await this.bookingRepository.findOne(id, companyId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (!booking.canBeCancelled()) {
            throw new common_1.ConflictException('Booking cannot be cancelled');
        }
        const updatedBooking = await this.bookingRepository.update(id, companyId, {
            status: reply_constants_1.BookingStatus.CANCELLED,
            metadata: {
                ...booking.metadata,
                cancelledAt: new Date().toISOString(),
                cancellationReason: dto.reason,
            },
        });
        await this.leadEvents.logExecution(updatedBooking, 'BOOKING_CANCELLED', {
            reason: dto.reason,
            scheduledTime: booking.scheduledTime.toISOString(),
        });
        this.logger.log(`Booking ${id} cancelled successfully`);
        const responseDto = booking_mapper_1.BookingMapper.toDto(updatedBooking);
        if (!responseDto) {
            throw new Error('Failed to create booking DTO');
        }
        return responseDto;
    }
    async markAsCompleted(id, companyId) {
        this.logger.log(`Marking booking ${id} as completed for company ${companyId}`);
        const booking = await this.bookingRepository.findOne(id, companyId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (!booking.canBeCompleted()) {
            throw new common_1.ConflictException('Booking cannot be marked as completed');
        }
        const updatedBooking = await this.bookingRepository.update(id, companyId, {
            status: reply_constants_1.BookingStatus.COMPLETED,
            metadata: {
                ...booking.metadata,
                completedAt: new Date().toISOString(),
            },
        });
        await this.leadEvents.logExecution(updatedBooking, 'BOOKING_COMPLETED', {
            scheduledTime: booking.scheduledTime.toISOString(),
            actualCompletionTime: new Date().toISOString(),
        });
        this.logger.log(`Booking ${id} marked as completed`);
        const responseDto = booking_mapper_1.BookingMapper.toDto(updatedBooking);
        if (!responseDto) {
            throw new Error('Failed to create booking DTO');
        }
        return responseDto;
    }
    async handleWorkflowCompletion(workflowData) {
        this.logger.log(`Handling workflow completion for booking creation from reply ${workflowData.replyId}`);
        const { replyId, companyId, meetingLink, scheduledTime, metadata } = workflowData;
        await this.createFromReply(replyId, companyId, meetingLink, {
            ...metadata,
            workflowCompletedAt: new Date().toISOString(),
            scheduledTime: scheduledTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        this.logger.log(`Workflow completion handled for booking creation from reply ${replyId}`);
    }
    async getBookingPriority(bookingId, companyId) {
        const booking = await this.bookingRepository.findOne(bookingId, companyId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking.priority;
    }
    async getDashboardData(companyId) {
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
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = BookingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [booking_repository_1.BookingRepository,
        lead_events_service_1.LeadEventsService])
], BookingService);
//# sourceMappingURL=booking.service.js.map