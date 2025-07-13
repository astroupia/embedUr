import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { LeadStatus } from '../constants/lead.constants';

export class QueryLeadsCursorDto {
  @ApiPropertyOptional({ description: 'ID of last seen lead' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  take?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by lead status', enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Search in full name and email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by campaign ID' })
  @IsOptional()
  @IsString()
  campaignId?: string;
} 