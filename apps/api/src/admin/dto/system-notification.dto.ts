import { IsString, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { SystemNotificationLevel } from '../../constants/enums';

export class CreateSystemNotificationDto {
  @IsString()
  message: string;

  @IsEnum(SystemNotificationLevel)
  level: SystemNotificationLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCompanyIds?: string[];
}

export class SystemNotificationResponseDto {
  id: string;
  message: string;
  level: SystemNotificationLevel;
  read: boolean;
  companyId: string;
  createdAt: Date;
}

export class SystemNotificationListResponseDto {
  notifications: SystemNotificationResponseDto[];
  total: number;
  unreadCount: number;
} 