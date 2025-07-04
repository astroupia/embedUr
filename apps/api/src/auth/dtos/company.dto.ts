import { IsString, IsOptional, IsEnum, IsNumber, IsUrl } from 'class-validator';
import { $Enums } from '../../../generated/prisma';

type CompanyStatus = $Enums.CompanyStatus;

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  industry: string;

  @IsOptional()
  @IsString()
  schemaName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @IsNumber()
  employees: number;

  @IsOptional()
  @IsNumber()
  revenue?: number;

  @IsOptional()
  @IsString()
  linkedinUsername?: string;

  @IsOptional()
  @IsString()
  twitterUsername?: string;

  @IsOptional()
  @IsString()
  facebookUsername?: string;

  @IsOptional()
  @IsString()
  instagramUsername?: string;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @IsOptional()
  @IsNumber()
  employees?: number;

  @IsOptional()
  @IsNumber()
  revenue?: number;

  @IsOptional()
  @IsString()
  linkedinUsername?: string;

  @IsOptional()
  @IsString()
  twitterUsername?: string;

  @IsOptional()
  @IsString()
  facebookUsername?: string;

  @IsOptional()
  @IsString()
  instagramUsername?: string;
}

export class CompanyResponseDto {
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
