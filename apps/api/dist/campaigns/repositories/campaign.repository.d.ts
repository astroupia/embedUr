import { PrismaService } from '../../prisma/prisma.service';
import { CampaignEntity } from '../entities/campaign.entity';
import { QueryCampaignsCursorDto } from '../dto/query-campaigns-cursor.dto';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { CampaignStatus } from '../constants/campaign.constants';
export declare class CampaignRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCampaignDto, companyId: string): Promise<CampaignEntity>;
    findWithCursor(companyId: string, query: QueryCampaignsCursorDto): Promise<{
        data: CampaignEntity[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<CampaignEntity>;
    update(id: string, companyId: string, dto: UpdateCampaignDto): Promise<CampaignEntity>;
    archive(id: string, companyId: string): Promise<CampaignEntity>;
    remove(id: string, companyId: string): Promise<void>;
    findByStatus(status: CampaignStatus, companyId: string): Promise<CampaignEntity[]>;
    countByCompany(companyId: string): Promise<number>;
    countByStatus(status: CampaignStatus, companyId: string): Promise<number>;
    countActiveByCompany(companyId: string): Promise<number>;
    private validateAIPersonaOwnership;
    private validateWorkflowOwnership;
}
