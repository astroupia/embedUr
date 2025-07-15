import { CompanyStatus } from '../../constants/enums';
export declare class UpdateCompanyStatusDto {
    status: CompanyStatus;
    reason?: string;
}
export declare class UpdateCompanyPlanDto {
    planId: string;
    reason?: string;
}
export declare class CompanyAdminResponseDto {
    id: string;
    name: string;
    schemaName: string;
    status: CompanyStatus;
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
    plan?: {
        id: string;
        name: string;
        description?: string;
        maxLeads: number;
        maxWorkflows: number;
        priceCents: number;
    };
    userCount: number;
    activeUserCount: number;
    lastActivityAt?: Date;
}
export declare class CompanyListResponseDto {
    companies: CompanyAdminResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class CompanyUsersResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    linkedinUrl?: string;
    profileUrl?: string;
    twitterUsername?: string;
    facebookUsername?: string;
    instagramUsername?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
}
