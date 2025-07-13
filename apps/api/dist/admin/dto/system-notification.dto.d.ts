import { SystemNotificationLevel } from '../../constants/enums';
export declare class CreateSystemNotificationDto {
    message: string;
    level: SystemNotificationLevel;
    targetCompanyIds?: string[];
}
export declare class SystemNotificationResponseDto {
    id: string;
    message: string;
    level: SystemNotificationLevel;
    read: boolean;
    companyId: string;
    createdAt: Date;
}
export declare class SystemNotificationListResponseDto {
    notifications: SystemNotificationResponseDto[];
    total: number;
    unreadCount: number;
}
