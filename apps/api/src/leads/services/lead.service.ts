import { Injectable, Logger, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { LeadRepository } from '../repositories/lead.repository';
import { LeadEventsService } from './lead-events.service';
import { LeadEntity } from '../entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto } from '../dtos/lead.dto';
import { QueryLeadsCursorDto } from '../dtos/query-leads-cursor.dto';
import { LeadStatus } from '../constants/lead.constants';
import { CampaignService } from '../../campaigns/services/campaign.service';
import { UsageMetricsService } from '../../usage-metrics/usage-metrics.service';
import { MetricName } from '../../usage-metrics/entities/usage-metric.entity';

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly leadEvents: LeadEventsService,
    private readonly campaignService: CampaignService,
    private readonly usageMetricsService: UsageMetricsService,
  ) {}

  async create(dto: CreateLeadDto, companyId: string): Promise<LeadEntity> {
    this.logger.log(`Creating lead for company ${companyId}: ${dto.email}`);

    // Validate campaign if provided
    if (dto.campaignId) {
      try {
        await this.campaignService.findOne(dto.campaignId, companyId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException('Invalid campaign ID');
        }
        throw error;
      }
    }

    // Check for existing lead with same email
    const existingLead = await this.leadRepository.findByEmail(dto.email, companyId);
    if (existingLead) {
      throw new ConflictException('Lead with this email already exists');
    }

    // Create the lead
    const lead = await this.leadRepository.create(dto, companyId);

    // Track usage metric
    await this.usageMetricsService.incrementMetric(companyId, MetricName.LEADS_CREATED);

    // Log the creation
    await this.leadEvents.logExecution(lead, 'LEAD_CREATED', {
      fullName: lead.fullName,
      email: lead.email,
      linkedinUrl: lead.linkedinUrl,
    });

    // Trigger enrichment workflow if LinkedIn URL is provided
    if (lead.linkedinUrl) {
      await this.leadEvents.triggerEnrichment(lead);
    }

    this.logger.log(`Lead created successfully: ${lead.id}`);
    return lead;
  }

  async findAll(companyId: string, query: QueryLeadsCursorDto): Promise<{
    data: LeadEntity[];
    nextCursor: string | null;
  }> {
    this.logger.log(`Fetching leads for company ${companyId} with cursor: ${query.cursor}`);
    
    const result = await this.leadRepository.findWithCursor(companyId, query);
    
    this.logger.log(`Found ${result.data.length} leads for company ${companyId}`);
    return result;
  }

  async findOne(id: string, companyId: string): Promise<LeadEntity> {
    this.logger.log(`Fetching lead ${id} for company ${companyId}`);
    
    const lead = await this.leadRepository.findOne(id, companyId);
    
    this.logger.log(`Lead ${id} found successfully`);
    return lead;
  }

  async update(id: string, companyId: string, dto: UpdateLeadDto): Promise<LeadEntity> {
    this.logger.log(`Updating lead ${id} for company ${companyId}`);

    // Get current lead to check status changes
    const currentLead = await this.leadRepository.findOne(id, companyId);
    const previousStatus = currentLead.status;

    // Validate status transition if status is being updated
    if (dto.status && dto.status !== previousStatus) {
      if (!currentLead.canTransitionTo(dto.status)) {
        throw new BadRequestException(`Invalid status transition from ${previousStatus} to ${dto.status}`);
      }
    }

    // Update the lead
    const updatedLead = await this.leadRepository.update(id, companyId, dto);

    // Log the update
    await this.leadEvents.logExecution(updatedLead, 'LEAD_UPDATED', {
      previousData: {
        fullName: currentLead.fullName,
        status: previousStatus,
        verified: currentLead.verified,
      },
      newData: {
        fullName: updatedLead.fullName,
        status: updatedLead.status,
        verified: updatedLead.verified,
      },
    });

    // Trigger status change workflow if status changed
    if (dto.status && dto.status !== previousStatus) {
      await this.leadEvents.triggerStatusChangeWorkflow(updatedLead, previousStatus);
    }

    // Trigger enrichment if LinkedIn URL was added
    if (dto.linkedinUrl && !currentLead.linkedinUrl) {
      await this.leadEvents.triggerEnrichment(updatedLead);
    }

    this.logger.log(`Lead ${id} updated successfully`);
    return updatedLead;
  }

  async remove(id: string, companyId: string): Promise<void> {
    this.logger.log(`Removing lead ${id} for company ${companyId}`);

    // Get lead before deletion for logging
    const lead = await this.leadRepository.findOne(id, companyId);

    // Remove the lead
    await this.leadRepository.remove(id, companyId);

    // Log the deletion
    await this.leadEvents.logExecution(lead, 'LEAD_DELETED', {
      fullName: lead.fullName,
      email: lead.email,
      status: lead.status,
    });

    this.logger.log(`Lead ${id} removed successfully`);
  }

  async findByStatus(status: LeadStatus, companyId: string): Promise<LeadEntity[]> {
    this.logger.log(`Fetching leads with status ${status} for company ${companyId}`);
    
    const leads = await this.leadRepository.findByStatus(status, companyId);
    
    this.logger.log(`Found ${leads.length} leads with status ${status}`);
    return leads;
  }

  async getStats(companyId: string): Promise<{
    total: number;
    byStatus: Record<LeadStatus, number>;
  }> {
    this.logger.log(`Fetching lead stats for company ${companyId}`);

    const total = await this.leadRepository.countByCompany(companyId);
    const byStatus: Record<LeadStatus, number> = {
      [LeadStatus.NEW]: await this.leadRepository.countByStatus(LeadStatus.NEW, companyId),
      [LeadStatus.CONTACTED]: await this.leadRepository.countByStatus(LeadStatus.CONTACTED, companyId),
      [LeadStatus.INTERESTED]: await this.leadRepository.countByStatus(LeadStatus.INTERESTED, companyId),
      [LeadStatus.NOT_INTERESTED]: await this.leadRepository.countByStatus(LeadStatus.NOT_INTERESTED, companyId),
      [LeadStatus.BOOKED]: await this.leadRepository.countByStatus(LeadStatus.BOOKED, companyId),
      [LeadStatus.DO_NOT_CONTACT]: await this.leadRepository.countByStatus(LeadStatus.DO_NOT_CONTACT, companyId),
    };

    this.logger.log(`Lead stats for company ${companyId}: total=${total}`);
    return { total, byStatus };
  }

  async triggerEnrichment(id: string, companyId: string): Promise<void> {
    this.logger.log(`Manually triggering enrichment for lead ${id}`);

    const lead = await this.leadRepository.findOne(id, companyId);
    await this.leadEvents.triggerEnrichment(lead);

    this.logger.log(`Enrichment triggered successfully for lead ${id}`);
  }
} 