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
var BookingRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const booking_mapper_1 = require("../mappers/booking.mapper");
const prisma_1 = require("../../../generated/prisma");
let BookingRepository = BookingRepository_1 = class BookingRepository {
    prisma;
    logger = new common_1.Logger(BookingRepository_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, companyId) {
        this.logger.log(`Creating booking for company ${companyId}`);
        const data = booking_mapper_1.BookingMapper.toCreateData(dto, companyId);
        const booking = await this.prisma.booking.create({
            data,
            include: {
                lead: true,
            },
        });
        this.logger.log(`Booking created: ${booking.id}`);
        return booking_mapper_1.BookingMapper.toEntity(booking);
    }
    async findOne(id, companyId) {
        this.logger.log(`Finding booking ${id} in company ${companyId}`);
        const booking = await this.prisma.booking.findFirst({
            where: { id, companyId },
            include: {
                lead: true,
            },
        });
        return booking ? booking_mapper_1.BookingMapper.toEntity(booking) : null;
    }
    async findWithCursor(companyId, query) {
        this.logger.log(`Finding bookings for company ${companyId} with cursor: ${query.cursor}`);
        const where = { companyId };
        if (query.leadId)
            where.leadId = query.leadId;
        if (query.status)
            where.status = query.status;
        if (query.active) {
            where.status = {
                in: [prisma_1.$Enums.BookingStatus.BOOKED, prisma_1.$Enums.BookingStatus.RESCHEDULED],
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
                in: [prisma_1.$Enums.BookingStatus.BOOKED, prisma_1.$Enums.BookingStatus.RESCHEDULED],
            };
        }
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
            take: limit + 1,
        });
        const hasNext = bookings.length > limit;
        const data = bookings.slice(0, limit);
        const nextCursor = hasNext ? data[data.length - 1].id : null;
        return {
            data: booking_mapper_1.BookingMapper.toEntityArray(data),
            nextCursor,
        };
    }
    async update(id, companyId, dto) {
        this.logger.log(`Updating booking ${id} in company ${companyId}`);
        const data = booking_mapper_1.BookingMapper.toUpdateData(dto);
        const booking = await this.prisma.booking.update({
            where: { id, companyId },
            data,
            include: {
                lead: true,
            },
        });
        this.logger.log(`Booking updated: ${booking.id}`);
        return booking_mapper_1.BookingMapper.toEntity(booking);
    }
    async updateWithWorkflowData(id, companyId, workflowData) {
        this.logger.log(`Updating booking ${id} with workflow data in company ${companyId}`);
        const data = booking_mapper_1.BookingMapper.toWorkflowUpdateData(workflowData);
        const booking = await this.prisma.booking.update({
            where: { id, companyId },
            data,
            include: {
                lead: true,
            },
        });
        this.logger.log(`Booking updated with workflow data: ${booking.id}`);
        return booking_mapper_1.BookingMapper.toEntity(booking);
    }
    async remove(id, companyId) {
        this.logger.log(`Removing booking ${id} from company ${companyId}`);
        await this.prisma.booking.delete({
            where: { id, companyId },
        });
        this.logger.log(`Booking removed: ${id}`);
    }
    async findByLead(leadId, companyId) {
        this.logger.log(`Finding bookings for lead ${leadId} in company ${companyId}`);
        const bookings = await this.prisma.booking.findMany({
            where: { leadId, companyId },
            include: {
                lead: true,
            },
            orderBy: { scheduledTime: 'asc' },
        });
        return booking_mapper_1.BookingMapper.toEntityArray(bookings);
    }
    async findByReply(replyId, companyId) {
        this.logger.log(`Finding bookings for reply ${replyId} in company ${companyId}`);
        this.logger.warn(`findByReply method called but no direct relation exists between Booking and Reply`);
        return [];
    }
    async findByStatus(status, companyId) {
        this.logger.log(`Finding bookings with status ${status} in company ${companyId}`);
        const bookings = await this.prisma.booking.findMany({
            where: { status, companyId },
            include: {
                lead: true,
            },
            orderBy: { scheduledTime: 'asc' },
        });
        return booking_mapper_1.BookingMapper.toEntityArray(bookings);
    }
    async findUpcoming(companyId, limit = 10) {
        this.logger.log(`Finding upcoming bookings for company ${companyId}`);
        const bookings = await this.prisma.booking.findMany({
            where: {
                companyId,
                scheduledTime: { gt: new Date() },
                status: {
                    in: [prisma_1.$Enums.BookingStatus.BOOKED, prisma_1.$Enums.BookingStatus.RESCHEDULED],
                },
            },
            include: {
                lead: true,
            },
            orderBy: { scheduledTime: 'asc' },
            take: limit,
        });
        return booking_mapper_1.BookingMapper.toEntityArray(bookings);
    }
    async findToday(companyId) {
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
                    in: [prisma_1.$Enums.BookingStatus.BOOKED, prisma_1.$Enums.BookingStatus.RESCHEDULED],
                },
            },
            include: {
                lead: true,
            },
            orderBy: { scheduledTime: 'asc' },
        });
        return booking_mapper_1.BookingMapper.toEntityArray(bookings);
    }
    async findOverdue(companyId) {
        this.logger.log(`Finding overdue bookings for company ${companyId}`);
        const bookings = await this.prisma.booking.findMany({
            where: {
                companyId,
                scheduledTime: { lt: new Date() },
                status: {
                    in: [prisma_1.$Enums.BookingStatus.BOOKED, prisma_1.$Enums.BookingStatus.RESCHEDULED],
                },
            },
            include: {
                lead: true,
            },
            orderBy: { scheduledTime: 'asc' },
        });
        return booking_mapper_1.BookingMapper.toEntityArray(bookings);
    }
    async countByCompany(companyId) {
        return this.prisma.booking.count({
            where: { companyId },
        });
    }
    async countByStatus(status, companyId) {
        this.logger.log(`Counting bookings with status ${status} in company ${companyId}`);
        return this.prisma.booking.count({
            where: { status, companyId },
        });
    }
    async countUpcoming(companyId) {
        return this.prisma.booking.count({
            where: {
                companyId,
                scheduledTime: { gt: new Date() },
                status: {
                    in: [prisma_1.$Enums.BookingStatus.BOOKED, prisma_1.$Enums.BookingStatus.RESCHEDULED],
                },
            },
        });
    }
    async countToday(companyId) {
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
                    in: [prisma_1.$Enums.BookingStatus.BOOKED, prisma_1.$Enums.BookingStatus.RESCHEDULED],
                },
            },
        });
    }
    async countOverdue(companyId) {
        return this.prisma.booking.count({
            where: {
                companyId,
                scheduledTime: { lt: new Date() },
                status: {
                    in: [prisma_1.$Enums.BookingStatus.BOOKED, prisma_1.$Enums.BookingStatus.RESCHEDULED],
                },
            },
        });
    }
    async getStats(companyId) {
        this.logger.log(`Getting booking stats for company ${companyId}`);
        const [total, upcoming, today, overdue, statusStats,] = await Promise.all([
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
    async getStatusStats(companyId) {
        const stats = await this.prisma.booking.groupBy({
            by: ['status'],
            where: { companyId },
            _count: {
                status: true,
            },
        });
        const result = {
            [prisma_1.$Enums.BookingStatus.BOOKED]: 0,
            [prisma_1.$Enums.BookingStatus.RESCHEDULED]: 0,
            [prisma_1.$Enums.BookingStatus.CANCELLED]: 0,
            [prisma_1.$Enums.BookingStatus.COMPLETED]: 0,
        };
        for (const stat of stats) {
            result[stat.status] = stat._count.status;
        }
        return result;
    }
    async createFromWebhook(data) {
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
        return booking_mapper_1.BookingMapper.toEntity(booking);
    }
    async updateLeadStatus(leadId, companyId, status) {
        this.logger.log(`Updating lead ${leadId} status to ${status}`);
        await this.prisma.lead.updateMany({
            where: { id: leadId, companyId },
            data: { status: status },
        });
    }
    async createSystemNotification(companyId, message, level) {
        this.logger.log(`Creating system notification for company ${companyId}`);
        await this.prisma.systemNotification.create({
            data: {
                companyId,
                message,
                level: level,
            },
        });
    }
};
exports.BookingRepository = BookingRepository;
exports.BookingRepository = BookingRepository = BookingRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingRepository);
//# sourceMappingURL=booking.repository.js.map