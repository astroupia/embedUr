import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowService } from './services/workflow.service';
import { WorkflowRepository } from './repositories/workflow.repository';
import { WorkflowEventsService } from './services/workflow-events.service';
import { WorkflowExecutionService } from './services/workflow-execution.service';
import { WorkflowExecutionRepository } from './repositories/workflow-execution.repository';
import { WorkflowOrchestratorService } from './services/workflow-orchestrator.service';
import { WorkflowProgressService } from './services/workflow-progress.service';
import { WorkflowErrorHandlerService } from './services/workflow-error-handler.service';
import { WorkflowAnalyticsService } from './services/workflow-analytics.service';
import { AuditTrailService } from './services/audit-trail.service';
import { TargetAudienceTranslatorController } from './controllers/target-audience-translator.controller';
import { TargetAudienceTranslatorService } from './services/target-audience-translator.service';
import { TargetAudienceTranslatorRepository } from './repositories/target-audience-translator.repository';
import { TargetAudienceTranslatorAiService } from './services/target-audience-translator-ai.service';
import { TargetAudienceTranslatorEventsService } from './services/target-audience-translator-events.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadsModule } from '../leads/leads.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    PrismaModule, 
    HttpModule, 
    forwardRef(() => LeadsModule), 
    forwardRef(() => CampaignsModule),
    AuthModule,
    AdminModule
  ],
  controllers: [
    WorkflowController,
    TargetAudienceTranslatorController,
  ],
  providers: [
    WorkflowService, 
    WorkflowRepository, 
    WorkflowEventsService,
    WorkflowExecutionService,
    WorkflowExecutionRepository,
    WorkflowOrchestratorService,
    WorkflowProgressService,
    WorkflowErrorHandlerService,
    WorkflowAnalyticsService,
    AuditTrailService,
    TargetAudienceTranslatorService,
    TargetAudienceTranslatorRepository,
    TargetAudienceTranslatorAiService,
    TargetAudienceTranslatorEventsService,
  ],
  exports: [
    WorkflowService, 
    WorkflowRepository,
    WorkflowEventsService,
    WorkflowExecutionService,
    WorkflowExecutionRepository,
    WorkflowOrchestratorService,
    WorkflowProgressService,
    WorkflowErrorHandlerService,
    WorkflowAnalyticsService,
    AuditTrailService,
    TargetAudienceTranslatorService,
    TargetAudienceTranslatorRepository,
  ],
})
export class WorkflowsModule {} 