import { IsString, IsOptional, IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrichmentProvider } from '../constants/enrichment.constants';

export class TriggerEnrichmentDto {
  @ApiProperty({ description: 'Lead ID to enrich', example: 'lead_123' })
  @IsNotEmpty()
  @IsString()
  leadId: string;

  @ApiPropertyOptional({ 
    description: 'Enrichment provider to use', 
    enum: EnrichmentProvider,
    example: EnrichmentProvider.APOLLO
  })
  @IsOptional()
  @IsEnum(EnrichmentProvider)
  provider?: EnrichmentProvider;

  @ApiPropertyOptional({ 
    description: 'Additional request data for the provider',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  requestData?: Record<string, any>;
}

export class RetryEnrichmentDto {
  @ApiPropertyOptional({ 
    description: 'Updated request data for retry',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  requestData?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Alternative provider to use for retry',
    enum: EnrichmentProvider
  })
  @IsOptional()
  @IsEnum(EnrichmentProvider)
  provider?: EnrichmentProvider;
}

export class EnrichmentStatsDto {
  @ApiProperty({ description: 'Total enrichment requests' })
  total: number;

  @ApiProperty({ description: 'Successful enrichments' })
  successful: number;

  @ApiProperty({ description: 'Failed enrichments' })
  failed: number;

  @ApiProperty({ description: 'Pending enrichments' })
  pending: number;

  @ApiProperty({ description: 'Statistics by provider' })
  byProvider: Record<EnrichmentProvider, {
    total: number;
    successful: number;
    failed: number;
  }>;

  @ApiProperty({ description: 'Average enrichment duration in seconds' })
  averageDurationSeconds: number;
} 