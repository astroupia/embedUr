import { LeadStatus } from '../constants/lead.constants';
export interface EnrichmentData {
    company?: string;
    title?: string;
    location?: string;
    industry?: string;
    linkedinProfile?: string;
    phone?: string;
    website?: string;
    [key: string]: any;
}
export interface CampaignWithAiPersona {
    id: string;
    name: string;
    aiPersona?: {
        id: string;
        name: string;
        description: string | null;
        prompt: string;
        parameters: any;
    } | null;
}
export declare class LeadResponseDto {
    id: string;
    fullName: string;
    email: string;
    linkedinUrl: string | null;
    enrichmentData: EnrichmentData | null;
    verified: boolean;
    status: LeadStatus;
    companyId: string;
    campaignId: string;
    createdAt: Date;
    updatedAt: Date;
    campaign?: CampaignWithAiPersona | null;
    score: number;
    isQualified: boolean;
    hasEnrichmentData: boolean;
    companyName: string | null;
    jobTitle: string | null;
    location: string | null;
}
