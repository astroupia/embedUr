import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { UsageMetricsModule } from '../usage-metrics/usage-metrics.module';

// Entities
import { LeadEntity } from './entities/lead.entity';

// DTOs
import {
  CreateLeadDto,
  UpdateLeadDto,
} from './dtos/lead.dto';
import { QueryLeadsCursorDto } from './dtos/query-leads-cursor.dto';

// Mappers
import { LeadMapper } from './mappers/lead.mapper';

// Repositories
import { LeadRepository } from './repositories/lead.repository';

// Services
import { LeadService } from './services/lead.service';
import { LeadEventsService } from './services/lead-events.service';

// Controllers
import { LeadController } from './controllers/lead.controller';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    forwardRef(() => WorkflowsModule), // For WorkflowExecutionService dependency
    CampaignsModule, // For campaign validation
    UsageMetricsModule, // For usage tracking
  ],
  controllers: [
    LeadController,
  ],
  providers: [
    // Entities
    LeadEntity,

    // DTOs
    CreateLeadDto,
    UpdateLeadDto,
    QueryLeadsCursorDto,

    // Mappers
    LeadMapper,

    // Repositories
    LeadRepository,

    // Services
    LeadService,
    LeadEventsService,
  ],
  exports: [
    // Export services for use in other modules
    LeadService,
    LeadEventsService,
    
    // Export repositories for direct access if needed
    LeadRepository,
    
    // Export mappers for data transformation
    LeadMapper,
    
    // Export entities for type safety
    LeadEntity,
  ],
})
export class LeadsModule {} 