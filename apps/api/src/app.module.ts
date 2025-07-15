// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { EnrichmentModule } from './enrichment/enrichment.module';
import { N8nModule } from './n8n/n8n.module';
import { RepliesModule } from './replies/replies.module';
import { AIPersonaModule } from './ai-persona/ai-persona.module';
import { UsageMetricsModule } from './usage-metrics/usage-metrics.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule, 
    AuthModule, 
    LeadsModule, 
    CampaignsModule, 
    WorkflowsModule, 
    EnrichmentModule,
    N8nModule,
    RepliesModule,
    AIPersonaModule,
    UsageMetricsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
