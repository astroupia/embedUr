import { ApiProperty } from '@nestjs/swagger';
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

export class LeadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  linkedinUrl: string | null;

  @ApiProperty({ nullable: true })
  enrichmentData: EnrichmentData | null;

  @ApiProperty()
  verified: boolean;

  @ApiProperty({ enum: LeadStatus })
  status: LeadStatus;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  campaignId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  campaign?: CampaignWithAiPersona | null;

  // Business logic properties
  @ApiProperty()
  score: number;

  @ApiProperty()
  isQualified: boolean;

  @ApiProperty()
  hasEnrichmentData: boolean;

  @ApiProperty({ nullable: true })
  companyName: string | null;

  @ApiProperty({ nullable: true })
  jobTitle: string | null;

  @ApiProperty({ nullable: true })
  location: string | null;
} 