import { Module } from '@nestjs/common';
import { EnrichmentController } from './controllers/enrichment.controller';
import { EnrichmentService } from './services/enrichment.service';
import { EnrichmentRepository } from './repositories/enrichment.repository';
import { EnrichmentEventsService } from './events/enrichment-events.service';
import { ApolloEnrichmentProvider } from './providers/apollo-enrichment-provider';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LeadsModule } from '../leads/leads.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [PrismaModule, AuthModule, LeadsModule, WorkflowsModule],
  controllers: [EnrichmentController],
  providers: [
    EnrichmentService,
    EnrichmentRepository,
    EnrichmentEventsService,
    ApolloEnrichmentProvider,
  ],
  exports: [
    EnrichmentService,
    EnrichmentRepository,
    EnrichmentEventsService,
  ],
})
export class EnrichmentModule {} 