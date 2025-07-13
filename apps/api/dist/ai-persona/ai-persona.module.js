"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPersonaModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const ai_persona_controller_1 = require("./ai-persona.controller");
const ai_persona_service_1 = require("./ai-persona.service");
const ai_persona_repository_1 = require("./ai-persona.repository");
let AIPersonaModule = class AIPersonaModule {
};
exports.AIPersonaModule = AIPersonaModule;
exports.AIPersonaModule = AIPersonaModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [ai_persona_controller_1.AIPersonaController],
        providers: [ai_persona_service_1.AIPersonaService, ai_persona_repository_1.AIPersonaRepository],
        exports: [ai_persona_service_1.AIPersonaService],
    })
], AIPersonaModule);
//# sourceMappingURL=ai-persona.module.js.map