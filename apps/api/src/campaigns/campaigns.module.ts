import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CampaignController } from './controllers/campaign.controller';
import { CampaignService } from './services/campaign.service';
import { CampaignRepository } from './repositories/campaign.repository';
import { CampaignEventsService } from './services/campaign-events.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AIPersonaModule } from '../ai-persona/ai-persona.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [
    PrismaModule, 
    AIPersonaModule, 
    HttpModule, 
    forwardRef(() => WorkflowsModule),
    forwardRef(() => LeadsModule),
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepository, CampaignEventsService],
  exports: [CampaignService, CampaignRepository],
})
export class CampaignsModule {} 