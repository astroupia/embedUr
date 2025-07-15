"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const campaign_controller_1 = require("./controllers/campaign.controller");
const campaign_service_1 = require("./services/campaign.service");
const campaign_repository_1 = require("./repositories/campaign.repository");
const campaign_events_service_1 = require("./services/campaign-events.service");
const prisma_module_1 = require("../prisma/prisma.module");
const ai_persona_module_1 = require("../ai-persona/ai-persona.module");
const workflows_module_1 = require("../workflows/workflows.module");
const leads_module_1 = require("../leads/leads.module");
let CampaignsModule = class CampaignsModule {
};
exports.CampaignsModule = CampaignsModule;
exports.CampaignsModule = CampaignsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            ai_persona_module_1.AIPersonaModule,
            axios_1.HttpModule,
            (0, common_1.forwardRef)(() => workflows_module_1.WorkflowsModule),
            (0, common_1.forwardRef)(() => leads_module_1.LeadsModule),
        ],
        controllers: [campaign_controller_1.CampaignController],
        providers: [campaign_service_1.CampaignService, campaign_repository_1.CampaignRepository, campaign_events_service_1.CampaignEventsService],
        exports: [campaign_service_1.CampaignService, campaign_repository_1.CampaignRepository],
    })
], CampaignsModule);
//# sourceMappingURL=campaigns.module.js.map