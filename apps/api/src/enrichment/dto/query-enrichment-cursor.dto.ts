import { IsOptional, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EnrichmentSortField, EnrichmentSortOrder, ENRICHMENT_DEFAULT_PAGE_SIZE, ENRICHMENT_MAX_PAGE_SIZE } from '../constants/enrichment.constants';

export class QueryEnrichmentCursorDto {
  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ 
    description: 'Number of items per page',
    minimum: 1,
    maximum: ENRICHMENT_MAX_PAGE_SIZE,
    default: ENRICHMENT_DEFAULT_PAGE_SIZE
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(ENRICHMENT_MAX_PAGE_SIZE)
  limit?: number = ENRICHMENT_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({ 
    description: 'Field to sort by',
    enum: EnrichmentSortField,
    default: EnrichmentSortField.CREATED_AT
  })
  @IsOptional()
  @IsEnum(EnrichmentSortField)
  sortBy?: EnrichmentSortField = EnrichmentSortField.CREATED_AT;

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: EnrichmentSortOrder,
    default: EnrichmentSortOrder.DESC
  })
  @IsOptional()
  @IsEnum(EnrichmentSortOrder)
  sortOrder?: EnrichmentSortOrder = EnrichmentSortOrder.DESC;

  @ApiPropertyOptional({ description: 'Filter by lead ID' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ description: 'Filter by provider' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;
} 