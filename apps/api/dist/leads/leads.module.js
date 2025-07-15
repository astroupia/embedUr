"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const prisma_module_1 = require("../prisma/prisma.module");
const workflows_module_1 = require("../workflows/workflows.module");
const campaigns_module_1 = require("../campaigns/campaigns.module");
const usage_metrics_module_1 = require("../usage-metrics/usage-metrics.module");
const lead_entity_1 = require("./entities/lead.entity");
const lead_dto_1 = require("./dtos/lead.dto");
const query_leads_cursor_dto_1 = require("./dtos/query-leads-cursor.dto");
const lead_mapper_1 = require("./mappers/lead.mapper");
const lead_repository_1 = require("./repositories/lead.repository");
const lead_service_1 = require("./services/lead.service");
const lead_events_service_1 = require("./services/lead-events.service");
const lead_controller_1 = require("./controllers/lead.controller");
let LeadsModule = class LeadsModule {
};
exports.LeadsModule = LeadsModule;
exports.LeadsModule = LeadsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            axios_1.HttpModule,
            (0, common_1.forwardRef)(() => workflows_module_1.WorkflowsModule),
            campaigns_module_1.CampaignsModule,
            usage_metrics_module_1.UsageMetricsModule,
        ],
        controllers: [
            lead_controller_1.LeadController,
        ],
        providers: [
            lead_entity_1.LeadEntity,
            lead_dto_1.CreateLeadDto,
            lead_dto_1.UpdateLeadDto,
            query_leads_cursor_dto_1.QueryLeadsCursorDto,
            lead_mapper_1.LeadMapper,
            lead_repository_1.LeadRepository,
            lead_service_1.LeadService,
            lead_events_service_1.LeadEventsService,
        ],
        exports: [
            lead_service_1.LeadService,
            lead_events_service_1.LeadEventsService,
            lead_repository_1.LeadRepository,
            lead_mapper_1.LeadMapper,
            lead_entity_1.LeadEntity,
        ],
    })
], LeadsModule);
//# sourceMappingURL=leads.module.js.map