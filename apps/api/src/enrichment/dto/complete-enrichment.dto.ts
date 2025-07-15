import { IsString, IsObject, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrichmentOutputDataDto {
  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  company: string;

  @ApiProperty({ description: 'Job title' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ description: 'Industry' })
  @IsString()
  industry: string;

  @ApiProperty({ description: 'Company size' })
  @IsString()
  companySize: string;

  @ApiProperty({ description: 'Email verification status' })
  @IsBoolean()
  emailVerified: boolean;
}

export class CompleteEnrichmentDto {
  @ApiProperty({ description: 'Workflow name', example: 'Lead Enrichment and Verification' })
  @IsString()
  workflow: string;

  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Completion status', example: 'completed' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Enrichment output data' })
  @ValidateNested()
  @Type(() => EnrichmentOutputDataDto)
  outputData: EnrichmentOutputDataDto;

  @ApiPropertyOptional({ description: 'Client ID (optional)' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;
} 