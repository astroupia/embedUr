import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingService } from '../services/booking.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingQueryDto,
  BookingResponseDto,
  BookingStatsDto,
  RescheduleBookingDto,
  CancelBookingDto,
} from '../dto/booking.dto';
import { $Enums } from '../../../generated/prisma';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  /**
   * Create a new booking
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: any,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Creating booking for user ${user.id} in company ${user.companyId}`);
    return this.bookingService.create(dto, user.companyId);
  }

  /**
   * Get all bookings with pagination and filtering
   */
  @Get()
  @ApiOperation({ summary: 'Get all bookings with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: BookingQueryDto,
    @CurrentUser() user: any,
  ): Promise<{ data: BookingResponseDto[]; nextCursor: string | null }> {
    this.logger.log(`Fetching bookings for user ${user.id} in company ${user.companyId}`);
    return this.bookingService.findAll(user.companyId, query);
  }

  /**
   * Get bookings by lead
   */
  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get bookings by lead ID' })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully', type: [BookingResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByLead(
    @Param('leadId') leadId: string,
    @CurrentUser() user: any,
  ): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching bookings for lead ${leadId} in company ${user.companyId}`);
    return this.bookingService.findByLead(leadId, user.companyId);
  }

  /**
   * Get bookings by reply
   */
  @Get('reply/:replyId')
  @ApiOperation({ summary: 'Get bookings by reply ID' })
  @ApiParam({ name: 'replyId', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully', type: [BookingResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByReply(
    @Param('replyId') replyId: string,
    @CurrentUser() user: any,
  ): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching bookings for reply ${replyId} in company ${user.companyId}`);
    return this.bookingService.findByReply(replyId, user.companyId);
  }

  /**
   * Get bookings by status
   */
  @Get('status/:status')
  @ApiOperation({ summary: 'Get bookings by status' })
  @ApiParam({ name: 'status', description: 'Booking status', enum: $Enums.BookingStatus })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully', type: [BookingResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByStatus(
    @Param('status') status: $Enums.BookingStatus,
    @Req() req,
  ): Promise<BookingResponseDto[]> {
    const user = req.user;
    this.logger.log(`Fetching bookings with status ${status} in company ${user.companyId}`);
    return this.bookingService.findByStatus(status, user.companyId);
  }

  /**
   * Get upcoming bookings
   */
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming bookings' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of bookings to return', type: Number })
  @ApiResponse({ status: 200, description: 'Upcoming bookings retrieved successfully', type: [BookingResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findUpcoming(
    @Query('limit') limit: number = 10,
    @CurrentUser() user: any,
  ): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching upcoming bookings in company ${user.companyId}`);
    return this.bookingService.findUpcoming(user.companyId, limit);
  }

  /**
   * Get today's bookings
   */
  @Get('today')
  @ApiOperation({ summary: 'Get today\'s bookings' })
  @ApiResponse({ status: 200, description: 'Today\'s bookings retrieved successfully', type: [BookingResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findToday(@CurrentUser() user: any): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching today's bookings in company ${user.companyId}`);
    return this.bookingService.findToday(user.companyId);
  }

  /**
   * Get overdue bookings
   */
  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue bookings' })
  @ApiResponse({ status: 200, description: 'Overdue bookings retrieved successfully', type: [BookingResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOverdue(@CurrentUser() user: any): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching overdue bookings in company ${user.companyId}`);
    return this.bookingService.findOverdue(user.companyId);
  }

  /**
   * Get booking statistics
   */
  @Get('stats/overview')
  @ApiOperation({ summary: 'Get booking statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: BookingStatsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@CurrentUser() user: any): Promise<BookingStatsDto> {
    this.logger.log(`Fetching booking stats for company ${user.companyId}`);
    return this.bookingService.getStats(user.companyId);
  }

  /**
   * Get dashboard data
   */
  @Get('dashboard/data')
  @ApiOperation({ summary: 'Get booking dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboardData(@CurrentUser() user: any): Promise<{
    upcoming: BookingResponseDto[];
    today: BookingResponseDto[];
    overdue: BookingResponseDto[];
    stats: BookingStatsDto;
  }> {
    this.logger.log(`Fetching booking dashboard data for company ${user.companyId}`);
    return this.bookingService.getDashboardData(user.companyId);
  }

  /**
   * Get booking by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Fetching booking ${id} for user ${user.id} in company ${user.companyId}`);
    return this.bookingService.findOne(id, user.companyId);
  }

  /**
   * Update booking
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Booking cannot be updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() user: any,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Updating booking ${id} for user ${user.id} in company ${user.companyId}`);
    return this.bookingService.update(id, user.companyId, dto);
  }

  /**
   * Delete booking
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 204, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    this.logger.log(`Removing booking ${id} for user ${user.id} in company ${user.companyId}`);
    return this.bookingService.remove(id, user.companyId);
  }

  /**
   * Reschedule booking
   */
  @Put(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking rescheduled successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Booking cannot be rescheduled' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
    @CurrentUser() user: any,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Rescheduling booking ${id} for user ${user.id} in company ${user.companyId}`);
    return this.bookingService.reschedule(id, user.companyId, dto);
  }

  /**
   * Cancel booking
   */
  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Booking cannot be cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: any,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Cancelling booking ${id} for user ${user.id} in company ${user.companyId}`);
    return this.bookingService.cancel(id, user.companyId, dto);
  }

  /**
   * Mark booking as completed
   */
  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark booking as completed' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking marked as completed', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Booking cannot be completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAsCompleted(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Marking booking ${id} as completed by user ${user.id}`);
    return this.bookingService.markAsCompleted(id, user.companyId);
  }

  /**
   * Get booking priority
   */
  @Get(':id/priority')
  @ApiOperation({ summary: 'Get booking priority' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Priority retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBookingPriority(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ priority: 'high' | 'medium' | 'low' }> {
    this.logger.log(`Getting priority for booking ${id} in company ${user.companyId}`);
    const priority = await this.bookingService.getBookingPriority(id, user.companyId);
    return { priority };
  }
} 