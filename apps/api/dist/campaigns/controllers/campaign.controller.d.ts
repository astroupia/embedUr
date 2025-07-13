import { CampaignService } from '../services/campaign.service';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { QueryCampaignsCursorDto } from '../dto/query-campaigns-cursor.dto';
import { CampaignEntity } from '../entities/campaign.entity';
import { CampaignStatus } from '../constants/campaign.constants';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
export declare class CampaignController {
    private readonly campaignService;
    constructor(campaignService: CampaignService);
    create(createCampaignDto: CreateCampaignDto, user: CurrentUser): Promise<CampaignEntity>;
    findAll(query: QueryCampaignsCursorDto, user: CurrentUser): Promise<{
        data: CampaignEntity[];
        nextCursor: string | null;
    }>;
    getStats(user: CurrentUser): Promise<{
        total: number;
        byStatus: Record<CampaignStatus, number>;
        active: number;
    }>;
    findByStatus(status: CampaignStatus, user: CurrentUser): Promise<CampaignEntity[]>;
    findOne(id: string, user: CurrentUser): Promise<CampaignEntity>;
    update(id: string, updateCampaignDto: UpdateCampaignDto, user: CurrentUser): Promise<CampaignEntity>;
    activate(id: string, user: CurrentUser): Promise<CampaignEntity>;
    pause(id: string, user: CurrentUser): Promise<CampaignEntity>;
    complete(id: string, user: CurrentUser): Promise<CampaignEntity>;
    archive(id: string, user: CurrentUser): Promise<CampaignEntity>;
    remove(id: string, user: CurrentUser): Promise<void>;
}
