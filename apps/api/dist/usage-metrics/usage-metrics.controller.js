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
exports.AdminUsageMetricsController = exports.UsageMetricsController = void 0;
const common_1 = require("@nestjs/common");
const usage_metrics_service_1 = require("./usage-metrics.service");
const create_usage_metric_dto_1 = require("./dto/create-usage-metric.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const enums_1 = require("../constants/enums");
let UsageMetricsController = class UsageMetricsController {
    usageMetricsService;
    constructor(usageMetricsService) {
        this.usageMetricsService = usageMetricsService;
    }
    async getCompanyMetrics(req, period, metricNames) {
        const companyId = req.user.companyId;
        const metricNamesArray = metricNames ? metricNames.split(',') : undefined;
        return this.usageMetricsService.getCompanyMetrics(companyId, period, metricNamesArray);
    }
    async getUsageOverview(req) {
        const companyId = req.user.companyId;
        return this.usageMetricsService.getUsageOverview(companyId);
    }
    async getCurrentPeriodMetrics(req) {
        const companyId = req.user.companyId;
        return this.usageMetricsService.getCurrentPeriodMetrics(companyId);
    }
    async getMetricsStats(req) {
        const companyId = req.user.companyId;
        return this.usageMetricsService.getMetricsStats(companyId);
    }
    async recordMetric(dto, req) {
        if (dto.companyId !== req.user.companyId) {
            throw new common_1.BadRequestException('Can only record metrics for your own company');
        }
        return this.usageMetricsService.recordMetric(dto);
    }
};
exports.UsageMetricsController = UsageMetricsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MEMBER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('metricNames')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsageMetricsController.prototype, "getCompanyMetrics", null);
__decorate([
    (0, common_1.Get)('overview'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MEMBER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageMetricsController.prototype, "getUsageOverview", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MEMBER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageMetricsController.prototype, "getCurrentPeriodMetrics", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MEMBER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageMetricsController.prototype, "getMetricsStats", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_usage_metric_dto_1.CreateUsageMetricDto, Object]),
    __metadata("design:returntype", Promise)
], UsageMetricsController.prototype, "recordMetric", null);
exports.UsageMetricsController = UsageMetricsController = __decorate([
    (0, common_1.Controller)('usage-metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [usage_metrics_service_1.UsageMetricsService])
], UsageMetricsController);
let AdminUsageMetricsController = class AdminUsageMetricsController {
    usageMetricsService;
    constructor(usageMetricsService) {
        this.usageMetricsService = usageMetricsService;
    }
    async getAllCompaniesMetrics(period, metricNames) {
        const metricNamesArray = metricNames ? metricNames.split(',') : undefined;
        return this.usageMetricsService.getAllCompaniesMetrics(period, metricNamesArray);
    }
    async getGlobalMetricsSummary() {
        return this.usageMetricsService.getGlobalMetricsSummary();
    }
    async getCompanyMetricsForAdmin(companyId) {
        return this.usageMetricsService.getCompanyMetricsForAdmin(companyId);
    }
    async getCompanyUsageOverviewForAdmin(companyId) {
        const originalCompanyId = companyId;
        return this.usageMetricsService.getUsageOverview(originalCompanyId);
    }
};
exports.AdminUsageMetricsController = AdminUsageMetricsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('metricNames')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminUsageMetricsController.prototype, "getAllCompaniesMetrics", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminUsageMetricsController.prototype, "getGlobalMetricsSummary", null);
__decorate([
    (0, common_1.Get)(':companyId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsageMetricsController.prototype, "getCompanyMetricsForAdmin", null);
__decorate([
    (0, common_1.Get)(':companyId/overview'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsageMetricsController.prototype, "getCompanyUsageOverviewForAdmin", null);
exports.AdminUsageMetricsController = AdminUsageMetricsController = __decorate([
    (0, common_1.Controller)('admin/usage-metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [usage_metrics_service_1.UsageMetricsService])
], AdminUsageMetricsController);
//# sourceMappingURL=usage-metrics.controller.js.map