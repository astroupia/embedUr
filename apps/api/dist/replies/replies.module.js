"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepliesModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const leads_module_1 = require("../leads/leads.module");
const reply_entity_1 = require("./entities/reply.entity");
const booking_entity_1 = require("./entities/booking.entity");
const reply_dto_1 = require("./dto/reply.dto");
const booking_dto_1 = require("./dto/booking.dto");
const reply_mapper_1 = require("./mappers/reply.mapper");
const booking_mapper_1 = require("./mappers/booking.mapper");
const reply_repository_1 = require("./repositories/reply.repository");
const booking_repository_1 = require("./repositories/booking.repository");
const reply_service_1 = require("./services/reply.service");
const booking_service_1 = require("./services/booking.service");
const reply_controller_1 = require("./controllers/reply.controller");
const booking_controller_1 = require("./controllers/booking.controller");
const reply_webhook_controller_1 = require("./controllers/reply-webhook.controller");
let RepliesModule = class RepliesModule {
};
exports.RepliesModule = RepliesModule;
exports.RepliesModule = RepliesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            leads_module_1.LeadsModule,
        ],
        controllers: [
            reply_controller_1.ReplyController,
            booking_controller_1.BookingController,
            reply_webhook_controller_1.ReplyWebhookController,
        ],
        providers: [
            reply_entity_1.ReplyEntity,
            booking_entity_1.BookingEntity,
            reply_dto_1.CreateReplyDto,
            reply_dto_1.UpdateReplyDto,
            reply_dto_1.ReplyQueryDto,
            reply_dto_1.ReplyResponseDto,
            reply_dto_1.ReplyStatsDto,
            booking_dto_1.CreateBookingDto,
            booking_dto_1.UpdateBookingDto,
            booking_dto_1.BookingQueryDto,
            booking_dto_1.BookingResponseDto,
            booking_dto_1.BookingStatsDto,
            booking_dto_1.RescheduleBookingDto,
            booking_dto_1.CancelBookingDto,
            reply_mapper_1.ReplyMapper,
            booking_mapper_1.BookingMapper,
            reply_repository_1.ReplyRepository,
            booking_repository_1.BookingRepository,
            reply_service_1.ReplyService,
            booking_service_1.BookingService,
        ],
        exports: [
            reply_service_1.ReplyService,
            booking_service_1.BookingService,
            reply_repository_1.ReplyRepository,
            booking_repository_1.BookingRepository,
            reply_mapper_1.ReplyMapper,
            booking_mapper_1.BookingMapper,
            reply_entity_1.ReplyEntity,
            booking_entity_1.BookingEntity,
        ],
    })
], RepliesModule);
//# sourceMappingURL=replies.module.js.map