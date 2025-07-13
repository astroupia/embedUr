import { LeadRepository } from '../repositories/lead.repository';
import { LeadEventsService } from './lead-events.service';
import { LeadEntity } from '../entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto } from '../dtos/lead.dto';
import { QueryLeadsCursorDto } from '../dtos/query-leads-cursor.dto';
import { LeadStatus } from '../constants/lead.constants';
import { CampaignService } from '../../campaigns/services/campaign.service';
import { UsageMetricsService } from '../../usage-metrics/usage-metrics.service';
export declare class LeadService {
    private readonly leadRepository;
    private readonly leadEvents;
    private readonly campaignService;
    private readonly usageMetricsService;
    private readonly logger;
    constructor(leadRepository: LeadRepository, leadEvents: LeadEventsService, campaignService: CampaignService, usageMetricsService: UsageMetricsService);
    create(dto: CreateLeadDto, companyId: string): Promise<LeadEntity>;
    findAll(companyId: string, query: QueryLeadsCursorDto): Promise<{
        data: LeadEntity[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<LeadEntity>;
    update(id: string, companyId: string, dto: UpdateLeadDto): Promise<LeadEntity>;
    remove(id: string, companyId: string): Promise<void>;
    findByStatus(status: LeadStatus, companyId: string): Promise<LeadEntity[]>;
    getStats(companyId: string): Promise<{
        total: number;
        byStatus: Record<LeadStatus, number>;
    }>;
    triggerEnrichment(id: string, companyId: string): Promise<void>;
}
