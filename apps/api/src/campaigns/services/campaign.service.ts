import { Injectable, Logger, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignRepository } from '../repositories/campaign.repository';
import { CampaignEventsService } from './campaign-events.service';
import { CampaignEntity } from '../entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { QueryCampaignsCursorDto } from '../dto/query-campaigns-cursor.dto';
import { CampaignStatus } from '../constants/campaign.constants';
import { AIPersonaService } from '../../ai-persona/ai-persona.service';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly campaignEvents: CampaignEventsService,
    private readonly aiPersonaService: AIPersonaService,
  ) {}

  async create(dto: CreateCampaignDto, companyId: string): Promise<CampaignEntity> {
    this.logger.log(`Creating campaign for company ${companyId}: ${dto.name}`);

    // Validate AI persona if provided
    if (dto.aiPersonaId) {
      try {
        await this.aiPersonaService.findById(dto.aiPersonaId, companyId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException('Invalid AI persona ID');
        }
        throw error;
      }
    }

    // TODO: Add plan validation to check maxWorkflows limit
    // const currentCampaignCount = await this.campaignRepository.countByCompany(companyId);
    // const plan = await this.getCompanyPlan(companyId);
    // if (currentCampaignCount >= plan.maxWorkflows) {
    //   throw new BadRequestException('Campaign limit reached for your plan');
    // }

    // Create the campaign
    const campaign = await this.campaignRepository.create(dto, companyId);

    // Log the creation
    await this.campaignEvents.logExecution(campaign, 'CAMPAIGN_CREATED', {
      name: campaign.name,
      description: campaign.description,
      aiPersonaId: campaign.aiPersonaId,
      workflowId: campaign.workflowId,
    });

    this.logger.log(`Campaign created successfully: ${campaign.id}`);
    return campaign;
  }

  async findAll(companyId: string, query: QueryCampaignsCursorDto): Promise<{
    data: CampaignEntity[];
    nextCursor: string | null;
  }> {
    this.logger.log(`Fetching campaigns for company ${companyId} with cursor: ${query.cursor}`);
    
    const result = await this.campaignRepository.findWithCursor(companyId, query);
    
    this.logger.log(`Found ${result.data.length} campaigns for company ${companyId}`);
    return result;
  }

  async findOne(id: string, companyId: string): Promise<CampaignEntity> {
    this.logger.log(`Fetching campaign ${id} for company ${companyId}`);
    
    const campaign = await this.campaignRepository.findOne(id, companyId);
    
    this.logger.log(`Campaign ${id} found successfully`);
    return campaign;
  }

  async update(id: string, companyId: string, dto: UpdateCampaignDto): Promise<CampaignEntity> {
    this.logger.log(`Updating campaign ${id} for company ${companyId}`);

    // Validate AI persona if provided
    if (dto.aiPersonaId) {
      try {
        await this.aiPersonaService.findById(dto.aiPersonaId, companyId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException('Invalid AI persona ID');
        }
        throw error;
      }
    }

    // Get current campaign to check status changes
    const currentCampaign = await this.campaignRepository.findOne(id, companyId);
    const previousStatus = currentCampaign.status;

    // Update the campaign
    const updatedCampaign = await this.campaignRepository.update(id, companyId, dto);

    // Log the update
    await this.campaignEvents.logExecution(updatedCampaign, 'CAMPAIGN_UPDATED', {
      previousData: {
        name: currentCampaign.name,
        status: previousStatus,
        aiPersonaId: currentCampaign.aiPersonaId,
        workflowId: currentCampaign.workflowId,
      },
      newData: {
        name: updatedCampaign.name,
        status: updatedCampaign.status,
        aiPersonaId: updatedCampaign.aiPersonaId,
        workflowId: updatedCampaign.workflowId,
      },
    });

    // Trigger specific workflows based on status changes
    if (dto.status && dto.status !== previousStatus) {
      await this.handleStatusChange(updatedCampaign, previousStatus);
    }

    this.logger.log(`Campaign ${id} updated successfully`);
    return updatedCampaign;
  }

  async archive(id: string, companyId: string): Promise<CampaignEntity> {
    this.logger.log(`Archiving campaign ${id} for company ${companyId}`);

    // Get campaign before archiving for logging
    const campaign = await this.campaignRepository.findOne(id, companyId);
    const previousStatus = campaign.status;

    // Archive the campaign
    const archivedCampaign = await this.campaignRepository.archive(id, companyId);

    // Log the archiving
    await this.campaignEvents.logExecution(archivedCampaign, 'CAMPAIGN_ARCHIVED', {
      previousStatus,
      name: archivedCampaign.name,
    });

    this.logger.log(`Campaign ${id} archived successfully`);
    return archivedCampaign;
  }

  async remove(id: string, companyId: string): Promise<void> {
    this.logger.log(`Removing campaign ${id} for company ${companyId}`);

    // Get campaign before deletion for logging
    const campaign = await this.campaignRepository.findOne(id, companyId);

    // Remove the campaign
    await this.campaignRepository.remove(id, companyId);

    // Log the deletion
    await this.campaignEvents.logExecution(campaign, 'CAMPAIGN_DELETED', {
      name: campaign.name,
      status: campaign.status,
    });

    this.logger.log(`Campaign ${id} removed successfully`);
  }

  async findByStatus(status: CampaignStatus, companyId: string): Promise<CampaignEntity[]> {
    this.logger.log(`Fetching campaigns with status ${status} for company ${companyId}`);
    
    const campaigns = await this.campaignRepository.findByStatus(status, companyId);
    
    this.logger.log(`Found ${campaigns.length} campaigns with status ${status}`);
    return campaigns;
  }

  async getStats(companyId: string): Promise<{
    total: number;
    byStatus: Record<CampaignStatus, number>;
    active: number;
  }> {
    this.logger.log(`Fetching campaign stats for company ${companyId}`);

    const total = await this.campaignRepository.countByCompany(companyId);
    const active = await this.campaignRepository.countActiveByCompany(companyId);
    const byStatus: Record<CampaignStatus, number> = {
      [CampaignStatus.DRAFT]: await this.campaignRepository.countByStatus(CampaignStatus.DRAFT, companyId),
      [CampaignStatus.ACTIVE]: await this.campaignRepository.countByStatus(CampaignStatus.ACTIVE, companyId),
      [CampaignStatus.PAUSED]: await this.campaignRepository.countByStatus(CampaignStatus.PAUSED, companyId),
      [CampaignStatus.COMPLETED]: await this.campaignRepository.countByStatus(CampaignStatus.COMPLETED, companyId),
      [CampaignStatus.ARCHIVED]: await this.campaignRepository.countByStatus(CampaignStatus.ARCHIVED, companyId),
    };

    this.logger.log(`Campaign stats for company ${companyId}: total=${total}, active=${active}`);
    return { total, byStatus, active };
  }

  async activate(id: string, companyId: string): Promise<CampaignEntity> {
    this.logger.log(`Activating campaign ${id} for company ${companyId}`);

    const campaign = await this.campaignRepository.findOne(id, companyId);
    
    if (!campaign.canActivate()) {
      throw new BadRequestException(`Campaign cannot be activated from status ${campaign.status}`);
    }

    const updatedCampaign = await this.campaignRepository.update(id, companyId, { status: CampaignStatus.ACTIVE });
    
    // Trigger activation workflow
    await this.campaignEvents.triggerCampaignActivation(updatedCampaign);

    this.logger.log(`Campaign ${id} activated successfully`);
    return updatedCampaign;
  }

  async pause(id: string, companyId: string): Promise<CampaignEntity> {
    this.logger.log(`Pausing campaign ${id} for company ${companyId}`);

    const campaign = await this.campaignRepository.findOne(id, companyId);
    
    if (!campaign.canPause()) {
      throw new BadRequestException(`Campaign cannot be paused from status ${campaign.status}`);
    }

    const updatedCampaign = await this.campaignRepository.update(id, companyId, { status: CampaignStatus.PAUSED });
    
    // Trigger pause workflow
    await this.campaignEvents.triggerCampaignPause(updatedCampaign);

    this.logger.log(`Campaign ${id} paused successfully`);
    return updatedCampaign;
  }

  async complete(id: string, companyId: string): Promise<CampaignEntity> {
    this.logger.log(`Completing campaign ${id} for company ${companyId}`);

    const campaign = await this.campaignRepository.findOne(id, companyId);
    
    if (!campaign.canComplete()) {
      throw new BadRequestException(`Campaign cannot be completed from status ${campaign.status}`);
    }

    const updatedCampaign = await this.campaignRepository.update(id, companyId, { status: CampaignStatus.COMPLETED });
    
    // Trigger completion workflow
    await this.campaignEvents.triggerCampaignCompletion(updatedCampaign);

    this.logger.log(`Campaign ${id} completed successfully`);
    return updatedCampaign;
  }

  private async handleStatusChange(campaign: CampaignEntity, previousStatus: CampaignStatus): Promise<void> {
    // Trigger general status change workflow
    await this.campaignEvents.triggerStatusChangeWorkflow(campaign, previousStatus);

    // Trigger specific workflows based on new status
    switch (campaign.status) {
      case CampaignStatus.ACTIVE:
        await this.campaignEvents.triggerCampaignActivation(campaign);
        break;
      case CampaignStatus.PAUSED:
        await this.campaignEvents.triggerCampaignPause(campaign);
        break;
      case CampaignStatus.COMPLETED:
        await this.campaignEvents.triggerCampaignCompletion(campaign);
        break;
    }
  }
} 