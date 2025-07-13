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
export declare class LeadEntity {
    readonly id: string;
    readonly fullName: string;
    readonly email: string;
    readonly linkedinUrl: string | null;
    readonly enrichmentData: EnrichmentData | null;
    readonly verified: boolean;
    readonly status: LeadStatus;
    readonly companyId: string;
    readonly campaignId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly campaign?: (CampaignWithAiPersona | null) | undefined;
    constructor(id: string, fullName: string, email: string, linkedinUrl: string | null, enrichmentData: EnrichmentData | null, verified: boolean, status: LeadStatus, companyId: string, campaignId: string, createdAt: Date, updatedAt: Date, campaign?: (CampaignWithAiPersona | null) | undefined);
    get score(): number;
    get isQualified(): boolean;
    get hasEnrichmentData(): boolean;
    get companyName(): string | null;
    get jobTitle(): string | null;
    get location(): string | null;
    canTransitionTo(newStatus: LeadStatus): boolean;
    static create(fullName: string, email: string, companyId: string, campaignId: string, linkedinUrl?: string): LeadEntity;
}
