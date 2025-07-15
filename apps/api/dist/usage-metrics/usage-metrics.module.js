"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageMetricsModule = void 0;
const common_1 = require("@nestjs/common");
const usage_metrics_controller_1 = require("./usage-metrics.controller");
const usage_metrics_service_1 = require("./usage-metrics.service");
const usage_metrics_repository_1 = require("./usage-metrics.repository");
const usage_metrics_mapper_1 = require("./usage-metrics.mapper");
const prisma_module_1 = require("../prisma/prisma.module");
let UsageMetricsModule = class UsageMetricsModule {
};
exports.UsageMetricsModule = UsageMetricsModule;
exports.UsageMetricsModule = UsageMetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [usage_metrics_controller_1.UsageMetricsController, usage_metrics_controller_1.AdminUsageMetricsController],
        providers: [usage_metrics_service_1.UsageMetricsService, usage_metrics_repository_1.UsageMetricsRepository, usage_metrics_mapper_1.UsageMetricsMapper],
        exports: [usage_metrics_service_1.UsageMetricsService, usage_metrics_repository_1.UsageMetricsRepository],
    })
], UsageMetricsModule);
//# sourceMappingURL=usage-metrics.module.js.map