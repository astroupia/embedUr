import { LeadStatus } from '../constants/lead.constants';
export declare class QueryLeadsCursorDto {
    cursor?: string;
    take?: number;
    status?: LeadStatus;
    search?: string;
    campaignId?: string;
}
