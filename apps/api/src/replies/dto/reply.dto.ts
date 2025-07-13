import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReplyClassification, ReplySource, REPLY_VALIDATION_RULES } from '../constants/reply.constants';
import { $Enums } from '../../../generated/prisma';

export class CreateReplyDto {
  @ApiProperty({ description: 'Reply content' })
  @IsString()
  @IsNotEmpty()
  @MinLength(REPLY_VALIDATION_RULES.MIN_CONTENT_LENGTH)
  @MaxLength(REPLY_VALIDATION_RULES.MAX_CONTENT_LENGTH)
  content: string;

  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]{25}$/, { message: 'leadId must be a valid CUID' })
  leadId: string;

  @ApiProperty({ description: 'Email log ID' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]{25}$/, { message: 'emailLogId must be a valid CUID' })
  emailLogId: string;

  @ApiPropertyOptional({ description: 'Reply source', enum: ReplySource })
  @IsOptional()
  @IsEnum(ReplySource)
  source?: ReplySource;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateReplyDto {
  @ApiPropertyOptional({ description: 'Reply content' })
  @IsOptional()
  @IsString()
  @MinLength(REPLY_VALIDATION_RULES.MIN_CONTENT_LENGTH)
  @MaxLength(REPLY_VALIDATION_RULES.MAX_CONTENT_LENGTH)
  content?: string;

  @ApiPropertyOptional({ description: 'Reply classification', enum: ReplyClassification })
  @IsOptional()
  @IsEnum($Enums.ReplyClassification)
  classification?: $Enums.ReplyClassification;

  @ApiPropertyOptional({ description: 'User who handled the reply' })
  @IsOptional()
  @IsString()
  handledBy?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ReplyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ReplyClassification })
  classification: ReplyClassification;

  @ApiProperty()
  leadId: string;

  @ApiProperty()
  emailLogId: string;

  @ApiProperty()
  companyId: string;

  @ApiPropertyOptional()
  handledBy: string | null;

  @ApiProperty({ enum: ReplySource })
  source: ReplySource;

  @ApiPropertyOptional()
  metadata: Record<string, any> | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Computed properties
  @ApiProperty()
  isInterested: boolean;

  @ApiProperty()
  isNegative: boolean;

  @ApiProperty()
  isNeutral: boolean;

  @ApiProperty()
  isAutoReply: boolean;

  @ApiProperty()
  sentimentScore: number;

  @ApiProperty()
  requiresAttention: boolean;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  priority: 'high' | 'medium' | 'low';

  @ApiProperty()
  isRecent: boolean;
}

export class ReplyStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  byClassification: Record<ReplyClassification, number>;

  @ApiProperty()
  bySource: Record<ReplySource, number>;

  @ApiProperty()
  recentCount: number;

  @ApiProperty()
  averageResponseTime: number;

  @ApiProperty()
  positiveRate: number;
}

export class ReplyQueryDto {
  @ApiPropertyOptional({ description: 'Lead ID filter' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]{25}$/, { message: 'leadId must be a valid CUID' })
  leadId?: string;

  @ApiPropertyOptional({ description: 'Email log ID filter' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]{25}$/, { message: 'emailLogId must be a valid CUID' })
  emailLogId?: string;

  @ApiPropertyOptional({ description: 'Classification filter', enum: ReplyClassification })
  @IsOptional()
  @IsEnum(ReplyClassification)
  classification?: ReplyClassification;

  @ApiPropertyOptional({ description: 'Source filter', enum: ReplySource })
  @IsOptional()
  @IsEnum(ReplySource)
  source?: ReplySource;

  @ApiPropertyOptional({ description: 'Requires attention filter' })
  @IsOptional()
  requiresAttention?: boolean;

  @ApiPropertyOptional({ description: 'Recent replies only (last 24 hours)' })
  @IsOptional()
  recent?: boolean;

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of items to return', default: 20 })
  @IsOptional()
  limit?: number = 20;
} 