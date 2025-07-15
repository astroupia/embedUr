import { CampaignStatus } from '../constants/campaign.constants';
export declare class QueryCampaignsCursorDto {
    cursor?: string;
    take?: number;
    status?: CampaignStatus;
    search?: string;
}
