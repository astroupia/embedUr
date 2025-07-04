import { $Enums } from '../../../generated/prisma';
type CompanyStatus = $Enums.CompanyStatus;
export declare class CreateCompanyDto {
    name: string;
    industry: string;
    schemaName?: string;
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
}
export declare class UpdateCompanyDto {
    name?: string;
    industry?: string;
    location?: string;
    website?: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    employees?: number;
    revenue?: number;
    linkedinUsername?: string;
    twitterUsername?: string;
    facebookUsername?: string;
    instagramUsername?: string;
}
export declare class CompanyResponseDto {
    id: string;
    name: string;
    schemaName: string;
    status: CompanyStatus;
    planId?: string | null;
    industry: string;
    location?: string | null;
    website?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    employees: number;
    revenue?: number | null;
    linkedinUsername?: string | null;
    twitterUsername?: string | null;
    facebookUsername?: string | null;
    instagramUsername?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export {};
