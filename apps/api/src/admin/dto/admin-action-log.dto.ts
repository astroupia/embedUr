import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { AdminActionType, AdminTargetType } from '../entities/admin-action-log.entity';

export class AdminActionLogResponseDto {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any> | null;
  performedBy: string;
  timestamp: Date;
  performedByUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export class AdminActionLogListResponseDto {
  logs: AdminActionLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminActionLogFilterDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsString()
  performedBy?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
} 