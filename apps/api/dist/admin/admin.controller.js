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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const company_admin_dto_1 = require("./dto/company-admin.dto");
const system_notification_dto_1 = require("./dto/system-notification.dto");
const admin_action_log_dto_1 = require("./dto/admin-action-log.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const enums_1 = require("../constants/enums");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getAllCompanies(page, limit, status, search) {
        return this.adminService.getAllCompanies(page, limit, status, search);
    }
    async getCompanyById(id) {
        return this.adminService.getCompanyById(id);
    }
    async updateCompanyStatus(id, dto, req) {
        return this.adminService.updateCompanyStatus(id, dto, req.user.id);
    }
    async updateCompanyPlan(id, dto, req) {
        return this.adminService.updateCompanyPlan(id, dto, req.user.id);
    }
    async getCompanyUsers(id) {
        return this.adminService.getCompanyUsers(id);
    }
    async getGlobalUsageMetrics() {
        return this.adminService.getGlobalMetricsSummary();
    }
    async getPlatformHealth() {
        return this.adminService.getPlatformHealth();
    }
    async createSystemNotification(dto, req) {
        return this.adminService.createSystemNotification(dto, req.user.id);
    }
    async getSystemNotifications(page, limit) {
        return this.adminService.getSystemNotifications(page, limit);
    }
    async getActionLogs(filters, page, limit) {
        return this.adminService.getActionLogs(filters, page, limit);
    }
    async getAdminDashboard() {
        const [metrics, health] = await Promise.all([
            this.adminService.getGlobalMetricsSummary(),
            this.adminService.getPlatformHealth(),
        ]);
        return {
            metrics,
            health,
            lastUpdated: new Date(),
        };
    }
    async getRecentActivities(limit) {
        const filters = {};
        return this.adminService.getActionLogs(filters, 1, limit);
    }
    async getSystemStatistics() {
        const metrics = await this.adminService.getGlobalMetricsSummary();
        return {
            totalCompanies: metrics.totalCompanies,
            activeCompanies: metrics.activeCompanies,
            totalUsers: metrics.totalUsers,
            totalLeads: metrics.totalLeads,
            totalWorkflows: metrics.totalWorkflows,
            totalAiInteractions: metrics.totalAiInteractions,
            totalEmails: metrics.totalEmails,
            totalEnrichments: metrics.totalEnrichments,
            averageLeadsPerCompany: metrics.averageLeadsPerCompany,
            averageWorkflowsPerCompany: metrics.averageWorkflowsPerCompany,
            topPerformingCompanies: metrics.topPerformingCompanies,
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('companies'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllCompanies", null);
__decorate([
    (0, common_1.Get)('companies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyById", null);
__decorate([
    (0, common_1.Put)('companies/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, company_admin_dto_1.UpdateCompanyStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCompanyStatus", null);
__decorate([
    (0, common_1.Put)('companies/:id/plan'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, company_admin_dto_1.UpdateCompanyPlanDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCompanyPlan", null);
__decorate([
    (0, common_1.Get)('companies/:id/users'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyUsers", null);
__decorate([
    (0, common_1.Get)('usage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGlobalUsageMetrics", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPlatformHealth", null);
__decorate([
    (0, common_1.Post)('system-notifications'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_notification_dto_1.CreateSystemNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSystemNotification", null);
__decorate([
    (0, common_1.Get)('system-notifications'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemNotifications", null);
__decorate([
    (0, common_1.Get)('action-logs'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_action_log_dto_1.AdminActionLogFilterDto, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getActionLogs", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Get)('recent-activities'),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRecentActivities", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemStatistics", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.SUPER_ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map