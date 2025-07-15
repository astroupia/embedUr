import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { CompanyStatus } from '../../constants/enums';

export class UpdateCompanyStatusDto {
  @IsEnum(CompanyStatus)
  status: CompanyStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateCompanyPlanDto {
  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CompanyAdminResponseDto {
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

export class CompanyListResponseDto {
  companies: CompanyAdminResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CompanyUsersResponseDto {
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