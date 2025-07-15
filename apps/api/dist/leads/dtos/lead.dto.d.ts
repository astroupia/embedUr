import { LeadStatus } from '../constants/lead.constants';
export declare class CreateLeadDto {
    fullName: string;
    email: string;
    linkedinUrl?: string;
    enrichmentData?: Record<string, any>;
    verified?: boolean;
    status?: LeadStatus;
    companyId?: string;
    campaignId: string;
}
export declare class UpdateLeadDto {
    fullName?: string;
    email?: string;
    linkedinUrl?: string;
    enrichmentData?: Record<string, any>;
    verified?: boolean;
    status?: LeadStatus;
}
