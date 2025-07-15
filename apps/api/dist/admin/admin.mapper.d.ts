import { AdminActionLogEntity } from './entities/admin-action-log.entity';
import { CompanyAdminResponseDto, CompanyUsersResponseDto } from './dto/company-admin.dto';
import { SystemNotificationResponseDto } from './dto/system-notification.dto';
import { AdminActionLogResponseDto } from './dto/admin-action-log.dto';
import { GlobalMetricsSummaryDto, PlatformHealthDto } from './dto/global-metrics.dto';
export declare class AdminMapper {
    static toCompanyAdminResponseDto(data: any): CompanyAdminResponseDto;
    static toCompanyUsersResponseDto(data: any): CompanyUsersResponseDto;
    static toSystemNotificationResponseDto(data: any): SystemNotificationResponseDto;
    static toAdminActionLogResponseDto(entity: AdminActionLogEntity, userData?: any): AdminActionLogResponseDto;
    static toGlobalMetricsSummaryDto(data: any): GlobalMetricsSummaryDto;
    static toPlatformHealthDto(data: any): PlatformHealthDto;
    static toCompanyAdminResponseDtos(data: any[]): CompanyAdminResponseDto[];
    static toCompanyUsersResponseDtos(data: any[]): CompanyUsersResponseDto[];
    static toSystemNotificationResponseDtos(data: any[]): SystemNotificationResponseDto[];
    static toAdminActionLogResponseDtos(entities: AdminActionLogEntity[], userDataMap?: Record<string, any>): AdminActionLogResponseDto[];
}
