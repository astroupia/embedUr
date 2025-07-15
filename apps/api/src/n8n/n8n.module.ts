import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { N8nController } from './n8n.controller';
import { N8nService } from './services/n8n.service';
import { N8nRepository } from './repositories/n8n.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadsModule } from '../leads/leads.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { RepliesModule } from '../replies/replies.module';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    LeadsModule,
    WorkflowsModule, // Required for AuditTrailService
    RepliesModule,
  ],
  controllers: [N8nController],
  providers: [N8nService, N8nRepository],
  exports: [
    N8nService, 
    N8nRepository, 
    LeadsModule,
  ],
})
export class N8nModule {} 