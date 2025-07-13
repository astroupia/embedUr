import type { Campaign as PrismaCampaign, AIPersona as PrismaAIPersona, Workflow as PrismaWorkflow } from '../../../generated/prisma';
import { CampaignEntity, AIPersonaPreview, WorkflowPreview } from '../entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
export declare class CampaignMapper {
    static toEntity(prisma: PrismaCampaign, aiPersona?: PrismaAIPersona, workflow?: PrismaWorkflow, leadCount?: number): CampaignEntity;
    static toPrismaCreate(dto: CreateCampaignDto, companyId: string): any;
    static toPrismaUpdate(dto: UpdateCampaignDto): any;
    static toAIPersonaPreview(prisma: PrismaAIPersona): AIPersonaPreview;
    static toWorkflowPreview(prisma: PrismaWorkflow): WorkflowPreview;
}
