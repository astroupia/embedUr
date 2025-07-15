"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const leads_module_1 = require("./leads/leads.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const workflows_module_1 = require("./workflows/workflows.module");
const enrichment_module_1 = require("./enrichment/enrichment.module");
const n8n_module_1 = require("./n8n/n8n.module");
const replies_module_1 = require("./replies/replies.module");
const ai_persona_module_1 = require("./ai-persona/ai-persona.module");
const usage_metrics_module_1 = require("./usage-metrics/usage-metrics.module");
const admin_module_1 = require("./admin/admin.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            leads_module_1.LeadsModule,
            campaigns_module_1.CampaignsModule,
            workflows_module_1.WorkflowsModule,
            enrichment_module_1.EnrichmentModule,
            n8n_module_1.N8nModule,
            replies_module_1.RepliesModule,
            ai_persona_module_1.AIPersonaModule,
            usage_metrics_module_1.UsageMetricsModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map