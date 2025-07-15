import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadsModule } from '../leads/leads.module';

// Entities
import { ReplyEntity } from './entities/reply.entity';
import { BookingEntity } from './entities/booking.entity';

// DTOs
import {
  CreateReplyDto,
  UpdateReplyDto,
  ReplyQueryDto,
  ReplyResponseDto,
  ReplyStatsDto,
} from './dto/reply.dto';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingQueryDto,
  BookingResponseDto,
  BookingStatsDto,
  RescheduleBookingDto,
  CancelBookingDto,
} from './dto/booking.dto';

// Mappers
import { ReplyMapper } from './mappers/reply.mapper';
import { BookingMapper } from './mappers/booking.mapper';

// Repositories
import { ReplyRepository } from './repositories/reply.repository';
import { BookingRepository } from './repositories/booking.repository';

// Services
import { ReplyService } from './services/reply.service';
import { BookingService } from './services/booking.service';

// Controllers
import { ReplyController } from './controllers/reply.controller';
import { BookingController } from './controllers/booking.controller';
import { ReplyWebhookController } from './controllers/reply-webhook.controller';

@Module({
  imports: [
    PrismaModule,
    LeadsModule, // For LeadEventsService dependency
  ],
  controllers: [
    ReplyController,
    BookingController,
    ReplyWebhookController,
  ],
  providers: [
    // Entities
    ReplyEntity,
    BookingEntity,

    // DTOs
    CreateReplyDto,
    UpdateReplyDto,
    ReplyQueryDto,
    ReplyResponseDto,
    ReplyStatsDto,
    CreateBookingDto,
    UpdateBookingDto,
    BookingQueryDto,
    BookingResponseDto,
    BookingStatsDto,
    RescheduleBookingDto,
    CancelBookingDto,

    // Mappers
    ReplyMapper,
    BookingMapper,

    // Repositories
    ReplyRepository,
    BookingRepository,

    // Services
    ReplyService,
    BookingService,
  ],
  exports: [
    // Export services for use in other modules
    ReplyService,
    BookingService,
    
    // Export repositories for direct access if needed
    ReplyRepository,
    BookingRepository,
    
    // Export mappers for data transformation
    ReplyMapper,
    BookingMapper,
    
    // Export entities for type safety
    ReplyEntity,
    BookingEntity,
  ],
})
export class RepliesModule {} 