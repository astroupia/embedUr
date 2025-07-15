import { CampaignStatus } from '../constants/campaign.constants';
export declare class CreateCampaignDto {
    name: string;
    description?: string;
    aiPersonaId?: string;
    workflowId?: string;
}
export declare class UpdateCampaignDto {
    name?: string;
    description?: string;
    status?: CampaignStatus;
    aiPersonaId?: string;
    workflowId?: string;
}
export declare class CampaignStatusDto {
    status: CampaignStatus;
}
