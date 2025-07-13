import { IsString, IsOptional, IsArray, IsObject, IsEnum, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InputFormat {
  FREE_TEXT = 'FREE_TEXT',
  STRUCTURED_JSON = 'STRUCTURED_JSON',
  CSV_UPLOAD = 'CSV_UPLOAD',
  FORM_INPUT = 'FORM_INPUT',
}

export enum EnrichmentFieldType {
  REQUIRED = 'REQUIRED',
  OPTIONAL = 'OPTIONAL',
  CONDITIONAL = 'CONDITIONAL',
}

export class EnrichmentField {
  @ApiProperty({ description: 'Field name', example: 'fullName' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Field type', enum: EnrichmentFieldType })
  @IsEnum(EnrichmentFieldType)
  type: EnrichmentFieldType;

  @ApiPropertyOptional({ description: 'Field description', example: 'Full name of the person' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Example value', example: 'John Doe' })
  @IsOptional()
  @IsString()
  example?: string;
}

export class EnrichmentSchema {
  @ApiProperty({ description: 'Required fields for enrichment', type: [EnrichmentField] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnrichmentField)
  requiredFields: EnrichmentField[];

  @ApiProperty({ description: 'Optional fields for enrichment', type: [EnrichmentField] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnrichmentField)
  optionalFields: EnrichmentField[];

  @ApiPropertyOptional({ description: 'Conditional fields for enrichment', type: [EnrichmentField] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnrichmentField)
  conditionalFields?: EnrichmentField[];
}

export class StructuredTargetingData {
  @ApiPropertyOptional({ description: 'Job titles to target', example: ['CTO', 'VP Engineering'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobTitles?: string[];

  @ApiPropertyOptional({ description: 'Industries to target', example: ['B2B SaaS', 'E-commerce'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @ApiPropertyOptional({ description: 'Geographic location', example: 'Europe' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Company size range', example: '50-200 employees' })
  @IsOptional()
  @IsString()
  companySize?: string;

  @ApiPropertyOptional({ description: 'Funding status', example: 'VC-backed' })
  @IsOptional()
  @IsString()
  fundingStatus?: string;

  @ApiPropertyOptional({ description: 'Additional targeting criteria' })
  @IsOptional()
  @IsObject()
  additionalCriteria?: Record<string, any>;
}

export class GeneratedLead {
  @ApiPropertyOptional({ description: 'Full name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Job title', example: 'CTO' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Company name', example: 'TechCorp Inc' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Location', example: 'London, UK' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'LinkedIn URL' })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Additional lead data' })
  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>;
}

export class InterpretedCriteria {
  @ApiPropertyOptional({ description: 'Job titles to target', example: ['CTO', 'VP Engineering'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobTitles?: string[];

  @ApiPropertyOptional({ description: 'Industries to target', example: ['B2B SaaS', 'E-commerce'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @ApiPropertyOptional({ description: 'Geographic location', example: 'Europe' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Company size range', example: '50-200 employees' })
  @IsOptional()
  @IsString()
  companySize?: string;

  @ApiPropertyOptional({ description: 'Funding status', example: 'VC-backed' })
  @IsOptional()
  @IsString()
  fundingStatus?: string;

  @ApiPropertyOptional({ description: 'Additional targeting criteria' })
  @IsOptional()
  @IsObject()
  additionalCriteria?: Record<string, any>;
}

export class CreateTargetAudienceTranslatorDto {
  @ApiProperty({ description: 'Input format', enum: InputFormat })
  @IsEnum(InputFormat)
  inputFormat: InputFormat;

  @ApiProperty({ description: 'Target audience description or data' })
  @IsString()
  @IsNotEmpty()
  targetAudienceData: string;

  @ApiPropertyOptional({ description: 'Structured targeting data (for JSON format)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => StructuredTargetingData)
  structuredData?: StructuredTargetingData;

  @ApiPropertyOptional({ description: 'Additional configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class TargetAudienceTranslatorResponseDto {
  @ApiProperty({ description: 'Generated leads', type: [GeneratedLead] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeneratedLead)
  leads: GeneratedLead[];

  @ApiProperty({ description: 'Enrichment schema', type: EnrichmentSchema })
  @ValidateNested()
  @Type(() => EnrichmentSchema)
  enrichmentSchema: EnrichmentSchema;

  @ApiProperty({ description: 'Interpreted targeting criteria' })
  @IsObject()
  interpretedCriteria: Record<string, any>;

  @ApiPropertyOptional({ description: 'AI reasoning for the interpretation' })
  @IsOptional()
  @IsString()
  reasoning?: string;

  @ApiPropertyOptional({ description: 'Confidence score (0-1)' })
  @IsOptional()
  confidence?: number;
}

export class QueryTargetAudienceTranslatorCursorDto {
  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of items to take', example: 20 })
  @IsOptional()
  take?: number;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by input format', enum: InputFormat })
  @IsOptional()
  @IsEnum(InputFormat)
  inputFormat?: InputFormat;
} 