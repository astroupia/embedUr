"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const workflow_controller_1 = require("./controllers/workflow.controller");
const workflow_service_1 = require("./services/workflow.service");
const workflow_repository_1 = require("./repositories/workflow.repository");
const workflow_events_service_1 = require("./services/workflow-events.service");
const workflow_execution_service_1 = require("./services/workflow-execution.service");
const workflow_execution_repository_1 = require("./repositories/workflow-execution.repository");
const workflow_orchestrator_service_1 = require("./services/workflow-orchestrator.service");
const workflow_progress_service_1 = require("./services/workflow-progress.service");
const workflow_error_handler_service_1 = require("./services/workflow-error-handler.service");
const workflow_analytics_service_1 = require("./services/workflow-analytics.service");
const audit_trail_service_1 = require("./services/audit-trail.service");
const target_audience_translator_controller_1 = require("./controllers/target-audience-translator.controller");
const target_audience_translator_service_1 = require("./services/target-audience-translator.service");
const target_audience_translator_repository_1 = require("./repositories/target-audience-translator.repository");
const target_audience_translator_ai_service_1 = require("./services/target-audience-translator-ai.service");
const target_audience_translator_events_service_1 = require("./services/target-audience-translator-events.service");
const prisma_module_1 = require("../prisma/prisma.module");
const leads_module_1 = require("../leads/leads.module");
const campaigns_module_1 = require("../campaigns/campaigns.module");
const auth_module_1 = require("../auth/auth.module");
const admin_module_1 = require("../admin/admin.module");
let WorkflowsModule = class WorkflowsModule {
};
exports.WorkflowsModule = WorkflowsModule;
exports.WorkflowsModule = WorkflowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            axios_1.HttpModule,
            (0, common_1.forwardRef)(() => leads_module_1.LeadsModule),
            (0, common_1.forwardRef)(() => campaigns_module_1.CampaignsModule),
            auth_module_1.AuthModule,
            admin_module_1.AdminModule
        ],
        controllers: [
            workflow_controller_1.WorkflowController,
            target_audience_translator_controller_1.TargetAudienceTranslatorController,
        ],
        providers: [
            workflow_service_1.WorkflowService,
            workflow_repository_1.WorkflowRepository,
            workflow_events_service_1.WorkflowEventsService,
            workflow_execution_service_1.WorkflowExecutionService,
            workflow_execution_repository_1.WorkflowExecutionRepository,
            workflow_orchestrator_service_1.WorkflowOrchestratorService,
            workflow_progress_service_1.WorkflowProgressService,
            workflow_error_handler_service_1.WorkflowErrorHandlerService,
            workflow_analytics_service_1.WorkflowAnalyticsService,
            audit_trail_service_1.AuditTrailService,
            target_audience_translator_service_1.TargetAudienceTranslatorService,
            target_audience_translator_repository_1.TargetAudienceTranslatorRepository,
            target_audience_translator_ai_service_1.TargetAudienceTranslatorAiService,
            target_audience_translator_events_service_1.TargetAudienceTranslatorEventsService,
        ],
        exports: [
            workflow_service_1.WorkflowService,
            workflow_repository_1.WorkflowRepository,
            workflow_events_service_1.WorkflowEventsService,
            workflow_execution_service_1.WorkflowExecutionService,
            workflow_execution_repository_1.WorkflowExecutionRepository,
            workflow_orchestrator_service_1.WorkflowOrchestratorService,
            workflow_progress_service_1.WorkflowProgressService,
            workflow_error_handler_service_1.WorkflowErrorHandlerService,
            workflow_analytics_service_1.WorkflowAnalyticsService,
            audit_trail_service_1.AuditTrailService,
            target_audience_translator_service_1.TargetAudienceTranslatorService,
            target_audience_translator_repository_1.TargetAudienceTranslatorRepository,
        ],
    })
], WorkflowsModule);
//# sourceMappingURL=workflows.module.js.map