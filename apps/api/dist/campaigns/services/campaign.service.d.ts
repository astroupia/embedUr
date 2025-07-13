import { CampaignRepository } from '../repositories/campaign.repository';
import { CampaignEventsService } from './campaign-events.service';
import { CampaignEntity } from '../entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { QueryCampaignsCursorDto } from '../dto/query-campaigns-cursor.dto';
import { CampaignStatus } from '../constants/campaign.constants';
import { AIPersonaService } from '../../ai-persona/ai-persona.service';
export declare class CampaignService {
    private readonly campaignRepository;
    private readonly campaignEvents;
    private readonly aiPersonaService;
    private readonly logger;
    constructor(campaignRepository: CampaignRepository, campaignEvents: CampaignEventsService, aiPersonaService: AIPersonaService);
    create(dto: CreateCampaignDto, companyId: string): Promise<CampaignEntity>;
    findAll(companyId: string, query: QueryCampaignsCursorDto): Promise<{
        data: CampaignEntity[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<CampaignEntity>;
    update(id: string, companyId: string, dto: UpdateCampaignDto): Promise<CampaignEntity>;
    archive(id: string, companyId: string): Promise<CampaignEntity>;
    remove(id: string, companyId: string): Promise<void>;
    findByStatus(status: CampaignStatus, companyId: string): Promise<CampaignEntity[]>;
    getStats(companyId: string): Promise<{
        total: number;
        byStatus: Record<CampaignStatus, number>;
        active: number;
    }>;
    activate(id: string, companyId: string): Promise<CampaignEntity>;
    pause(id: string, companyId: string): Promise<CampaignEntity>;
    complete(id: string, companyId: string): Promise<CampaignEntity>;
    private handleStatusChange;
}
