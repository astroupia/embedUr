import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus } from '../constants/campaign.constants';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name', minLength: 1, maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'AI Persona ID for personalization' })
  @IsOptional()
  @IsString()
  aiPersonaId?: string;

  @ApiPropertyOptional({ description: 'Workflow ID for automation' })
  @IsOptional()
  @IsString()
  workflowId?: string;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ description: 'Campaign name', minLength: 1, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Campaign description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Campaign status', enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'AI Persona ID for personalization' })
  @IsOptional()
  @IsString()
  aiPersonaId?: string;

  @ApiPropertyOptional({ description: 'Workflow ID for automation' })
  @IsOptional()
  @IsString()
  workflowId?: string;
}

export class CampaignStatusDto {
  @ApiProperty({ description: 'New campaign status', enum: CampaignStatus })
  @IsNotEmpty()
  @IsEnum(CampaignStatus)
  status: CampaignStatus;
} 