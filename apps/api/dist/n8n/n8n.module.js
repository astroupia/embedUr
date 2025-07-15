"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const n8n_controller_1 = require("./n8n.controller");
const n8n_service_1 = require("./services/n8n.service");
const n8n_repository_1 = require("./repositories/n8n.repository");
const prisma_module_1 = require("../prisma/prisma.module");
const leads_module_1 = require("../leads/leads.module");
const workflows_module_1 = require("../workflows/workflows.module");
const replies_module_1 = require("../replies/replies.module");
let N8nModule = class N8nModule {
};
exports.N8nModule = N8nModule;
exports.N8nModule = N8nModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            prisma_module_1.PrismaModule,
            leads_module_1.LeadsModule,
            workflows_module_1.WorkflowsModule,
            replies_module_1.RepliesModule,
        ],
        controllers: [n8n_controller_1.N8nController],
        providers: [n8n_service_1.N8nService, n8n_repository_1.N8nRepository],
        exports: [
            n8n_service_1.N8nService,
            n8n_repository_1.N8nRepository,
            leads_module_1.LeadsModule,
        ],
    })
], N8nModule);
//# sourceMappingURL=n8n.module.js.map