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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BookingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const booking_service_1 = require("../services/booking.service");
const booking_dto_1 = require("../dto/booking.dto");
const prisma_1 = require("../../../generated/prisma");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
let BookingController = BookingController_1 = class BookingController {
    bookingService;
    logger = new common_1.Logger(BookingController_1.name);
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async create(dto, user) {
        this.logger.log(`Creating booking for user ${user.id} in company ${user.companyId}`);
        return this.bookingService.create(dto, user.companyId);
    }
    async findAll(query, user) {
        this.logger.log(`Fetching bookings for user ${user.id} in company ${user.companyId}`);
        return this.bookingService.findAll(user.companyId, query);
    }
    async findByLead(leadId, user) {
        this.logger.log(`Fetching bookings for lead ${leadId} in company ${user.companyId}`);
        return this.bookingService.findByLead(leadId, user.companyId);
    }
    async findByReply(replyId, user) {
        this.logger.log(`Fetching bookings for reply ${replyId} in company ${user.companyId}`);
        return this.bookingService.findByReply(replyId, user.companyId);
    }
    async findByStatus(status, req) {
        const user = req.user;
        this.logger.log(`Fetching bookings with status ${status} in company ${user.companyId}`);
        return this.bookingService.findByStatus(status, user.companyId);
    }
    async findUpcoming(limit = 10, user) {
        this.logger.log(`Fetching upcoming bookings in company ${user.companyId}`);
        return this.bookingService.findUpcoming(user.companyId, limit);
    }
    async findToday(user) {
        this.logger.log(`Fetching today's bookings in company ${user.companyId}`);
        return this.bookingService.findToday(user.companyId);
    }
    async findOverdue(user) {
        this.logger.log(`Fetching overdue bookings in company ${user.companyId}`);
        return this.bookingService.findOverdue(user.companyId);
    }
    async getStats(user) {
        this.logger.log(`Fetching booking stats for company ${user.companyId}`);
        return this.bookingService.getStats(user.companyId);
    }
    async getDashboardData(user) {
        this.logger.log(`Fetching booking dashboard data for company ${user.companyId}`);
        return this.bookingService.getDashboardData(user.companyId);
    }
    async findOne(id, user) {
        this.logger.log(`Fetching booking ${id} for user ${user.id} in company ${user.companyId}`);
        return this.bookingService.findOne(id, user.companyId);
    }
    async update(id, dto, user) {
        this.logger.log(`Updating booking ${id} for user ${user.id} in company ${user.companyId}`);
        return this.bookingService.update(id, user.companyId, dto);
    }
    async remove(id, user) {
        this.logger.log(`Removing booking ${id} for user ${user.id} in company ${user.companyId}`);
        return this.bookingService.remove(id, user.companyId);
    }
    async reschedule(id, dto, user) {
        this.logger.log(`Rescheduling booking ${id} for user ${user.id} in company ${user.companyId}`);
        return this.bookingService.reschedule(id, user.companyId, dto);
    }
    async cancel(id, dto, user) {
        this.logger.log(`Cancelling booking ${id} for user ${user.id} in company ${user.companyId}`);
        return this.bookingService.cancel(id, user.companyId, dto);
    }
    async markAsCompleted(id, user) {
        this.logger.log(`Marking booking ${id} as completed by user ${user.id}`);
        return this.bookingService.markAsCompleted(id, user.companyId);
    }
    async getBookingPriority(id, user) {
        this.logger.log(`Getting priority for booking ${id} in company ${user.companyId}`);
        const priority = await this.bookingService.getBookingPriority(id, user.companyId);
        return { priority };
    }
};
exports.BookingController = BookingController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new booking' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Booking created successfully', type: booking_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookings with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookings retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_dto_1.BookingQueryDto, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('lead/:leadId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bookings by lead ID' }),
    (0, swagger_1.ApiParam)({ name: 'leadId', description: 'Lead ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookings retrieved successfully', type: [booking_dto_1.BookingResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findByLead", null);
__decorate([
    (0, common_1.Get)('reply/:replyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bookings by reply ID' }),
    (0, swagger_1.ApiParam)({ name: 'replyId', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookings retrieved successfully', type: [booking_dto_1.BookingResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('replyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findByReply", null);
__decorate([
    (0, common_1.Get)('status/:status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bookings by status' }),
    (0, swagger_1.ApiParam)({ name: 'status', description: 'Booking status', enum: prisma_1.$Enums.BookingStatus }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookings retrieved successfully', type: [booking_dto_1.BookingResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('status')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming bookings' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of bookings to return', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upcoming bookings retrieved successfully', type: [booking_dto_1.BookingResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findUpcoming", null);
__decorate([
    (0, common_1.Get)('today'),
    (0, swagger_1.ApiOperation)({ summary: 'Get today\'s bookings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Today\'s bookings retrieved successfully', type: [booking_dto_1.BookingResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findToday", null);
__decorate([
    (0, common_1.Get)('overdue'),
    (0, swagger_1.ApiOperation)({ summary: 'Get overdue bookings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Overdue bookings retrieved successfully', type: [booking_dto_1.BookingResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findOverdue", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully', type: booking_dto_1.BookingStatsDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('dashboard/data'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking dashboard data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking retrieved successfully', type: booking_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update booking' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking updated successfully', type: booking_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Booking cannot be updated' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, booking_dto_1.UpdateBookingDto, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete booking' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Booking deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/reschedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Reschedule booking' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking rescheduled successfully', type: booking_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Booking cannot be rescheduled' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, booking_dto_1.RescheduleBookingDto, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "reschedule", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel booking' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking cancelled successfully', type: booking_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Booking cannot be cancelled' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, booking_dto_1.CancelBookingDto, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "cancel", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark booking as completed' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking marked as completed', type: booking_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Booking cannot be completed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "markAsCompleted", null);
__decorate([
    (0, common_1.Get)(':id/priority'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking priority' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Priority retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getBookingPriority", null);
exports.BookingController = BookingController = BookingController_1 = __decorate([
    (0, swagger_1.ApiTags)('bookings'),
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingController);
//# sourceMappingURL=booking.controller.js.map