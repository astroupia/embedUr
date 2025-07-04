export declare class CompanyEntity {
    id: string;
    name: string;
    schemaName: string;
    status: string;
    planId?: string;
    industry: string;
    location?: string;
    website?: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    employees: number;
    revenue?: number;
    linkedinUsername?: string;
    twitterUsername?: string;
    facebookUsername?: string;
    instagramUsername?: string;
    createdAt: Date;
    updatedAt: Date;
}
