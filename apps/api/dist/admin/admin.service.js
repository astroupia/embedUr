"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const admin_repository_1 = require("./admin.repository");
const admin_mapper_1 = require("./admin.mapper");
const admin_action_log_entity_1 = require("./entities/admin-action-log.entity");
const enums_1 = require("../constants/enums");
let AdminService = AdminService_1 = class AdminService {
    repository;
    mapper;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async getAllCompanies(page = 1, limit = 20, status, search) {
        try {
            const { companies, total } = await this.repository.findAllCompanies(page, limit, status, search);
            const mappedCompanies = admin_mapper_1.AdminMapper.toCompanyAdminResponseDtos(companies);
            return {
                companies: mappedCompanies,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            this.logger.error('Error fetching companies', error);
            throw new common_1.BadRequestException('Failed to fetch companies');
        }
    }
    async getCompanyById(id) {
        try {
            const company = await this.repository.findCompanyById(id);
            if (!company) {
                throw new common_1.BadRequestException('Company not found');
            }
            return admin_mapper_1.AdminMapper.toCompanyAdminResponseDto(company);
        }
        catch (error) {
            this.logger.error(`Error fetching company ${id}`, error);
            throw new common_1.BadRequestException('Failed to fetch company details');
        }
    }
    async updateCompanyStatus(id, dto, adminUserId) {
        try {
            this.validateStatusTransition(id, dto.status);
            const company = await this.repository.updateCompanyStatus(id, dto.status, dto.reason);
            await this.logAdminAction({
                action: admin_action_log_entity_1.AdminActionType.COMPANY_STATUS_UPDATE,
                targetType: admin_action_log_entity_1.AdminTargetType.COMPANY,
                targetId: id,
                performedBy: adminUserId,
                details: {
                    previousStatus: company.status,
                    newStatus: dto.status,
                    reason: dto.reason,
                },
            });
            return admin_mapper_1.AdminMapper.toCompanyAdminResponseDto(company);
        }
        catch (error) {
            this.logger.error(`Error updating company status ${id}`, error);
            throw new common_1.BadRequestException('Failed to update company status');
        }
    }
    async updateCompanyPlan(id, dto, adminUserId) {
        try {
            const company = await this.repository.updateCompanyPlan(id, dto.planId);
            await this.logAdminAction({
                action: admin_action_log_entity_1.AdminActionType.COMPANY_PLAN_CHANGE,
                targetType: admin_action_log_entity_1.AdminTargetType.COMPANY,
                targetId: id,
                performedBy: adminUserId,
                details: {
                    newPlanId: dto.planId,
                    reason: dto.reason,
                },
            });
            return admin_mapper_1.AdminMapper.toCompanyAdminResponseDto(company);
        }
        catch (error) {
            this.logger.error(`Error updating company plan ${id}`, error);
            throw new common_1.BadRequestException('Failed to update company plan');
        }
    }
    async getCompanyUsers(companyId) {
        try {
            const users = await this.repository.findCompanyUsers(companyId);
            return admin_mapper_1.AdminMapper.toCompanyUsersResponseDtos(users);
        }
        catch (error) {
            this.logger.error(`Error fetching users for company ${companyId}`, error);
            throw new common_1.BadRequestException('Failed to fetch company users');
        }
    }
    async getGlobalMetricsSummary() {
        try {
            const metrics = await this.repository.getGlobalUsageMetrics();
            const topPerformingCompanies = await this.repository.getTopPerformingCompanies(5);
            return admin_mapper_1.AdminMapper.toGlobalMetricsSummaryDto({
                ...metrics,
                topPerformingCompanies,
                recentActivity: [],
            });
        }
        catch (error) {
            this.logger.error('Error fetching global metrics', error);
            throw new common_1.BadRequestException('Failed to fetch global metrics');
        }
    }
    async getPlatformHealth() {
        try {
            const health = await this.repository.getPlatformHealth();
            return admin_mapper_1.AdminMapper.toPlatformHealthDto(health);
        }
        catch (error) {
            this.logger.error('Error fetching platform health', error);
            throw new common_1.BadRequestException('Failed to fetch platform health');
        }
    }
    async createSystemNotification(dto, adminUserId) {
        try {
            const notifications = await this.repository.createSystemNotification({
                message: dto.message,
                level: dto.level,
                companyIds: dto.targetCompanyIds,
            });
            await this.logAdminAction({
                action: admin_action_log_entity_1.AdminActionType.SYSTEM_NOTIFICATION,
                targetType: admin_action_log_entity_1.AdminTargetType.SYSTEM,
                targetId: 'SYSTEM',
                performedBy: adminUserId,
                details: {
                    message: dto.message,
                    level: dto.level,
                    targetCompanyIds: dto.targetCompanyIds,
                    notificationCount: notifications.length,
                },
            });
            return admin_mapper_1.AdminMapper.toSystemNotificationResponseDtos(notifications);
        }
        catch (error) {
            this.logger.error('Error creating system notification', error);
            throw new common_1.BadRequestException('Failed to create system notification');
        }
    }
    async getSystemNotifications(page = 1, limit = 20) {
        try {
            const { notifications, total } = await this.repository.findSystemNotifications(page, limit);
            const mappedNotifications = admin_mapper_1.AdminMapper.toSystemNotificationResponseDtos(notifications);
            return {
                notifications: mappedNotifications,
                total,
                unreadCount: mappedNotifications.filter(n => !n.read).length,
            };
        }
        catch (error) {
            this.logger.error('Error fetching system notifications', error);
            throw new common_1.BadRequestException('Failed to fetch system notifications');
        }
    }
    async getActionLogs(filters, page = 1, limit = 20) {
        try {
            const { logs, total } = await this.repository.findActionLogs({
                action: filters.action,
                targetType: filters.targetType,
                targetId: filters.targetId,
                performedBy: filters.performedBy,
                startDate: filters.startDate ? new Date(filters.startDate) : undefined,
                endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            }, page, limit);
            return {
                logs: admin_mapper_1.AdminMapper.toAdminActionLogResponseDtos(logs),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            this.logger.error('Error fetching action logs', error);
            throw new common_1.BadRequestException('Failed to fetch action logs');
        }
    }
    async logAdminAction(data) {
        try {
            await this.repository.createActionLog(data);
        }
        catch (error) {
            this.logger.error('Error logging admin action', error);
        }
    }
    validateStatusTransition(companyId, newStatus) {
        if (newStatus === enums_1.CompanyStatus.PENDING_DELETION) {
            this.logger.warn(`Company ${companyId} marked for deletion`);
        }
    }
    validateAdminAccess(userRole) {
        if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Insufficient privileges for admin operations');
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_repository_1.AdminRepository,
        admin_mapper_1.AdminMapper])
], AdminService);
//# sourceMappingURL=admin.service.js.map