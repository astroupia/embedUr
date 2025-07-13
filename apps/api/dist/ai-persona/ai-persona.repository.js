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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPersonaRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_persona_mapper_1 = require("./ai-persona.mapper");
let AIPersonaRepository = class AIPersonaRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId) {
        const personas = await this.prisma.aIPersona.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
        });
        return personas.map(ai_persona_mapper_1.AIPersonaMapper.toEntity);
    }
    async findById(id, companyId) {
        const persona = await this.prisma.aIPersona.findFirst({
            where: { id, companyId },
        });
        return persona ? ai_persona_mapper_1.AIPersonaMapper.toEntity(persona) : null;
    }
    async create(dto, companyId) {
        const persona = await this.prisma.aIPersona.create({
            data: {
                name: dto.name,
                description: dto.description,
                prompt: dto.prompt,
                parameters: dto.parameters,
                companyId,
            },
        });
        return ai_persona_mapper_1.AIPersonaMapper.toEntity(persona);
    }
    async update(id, dto, companyId) {
        const persona = await this.prisma.aIPersona.update({
            where: { id, companyId },
            data: {
                ...dto,
                updatedAt: new Date(),
            },
        });
        return ai_persona_mapper_1.AIPersonaMapper.toEntity(persona);
    }
    async delete(id, companyId) {
        const linkedCampaigns = await this.prisma.campaign.count({
            where: { aiPersonaId: id, companyId, status: { not: 'ARCHIVED' } },
        });
        if (linkedCampaigns > 0) {
            throw new common_1.ConflictException('Cannot delete persona linked to active campaigns');
        }
        await this.prisma.aIPersona.delete({ where: { id, companyId } });
    }
};
exports.AIPersonaRepository = AIPersonaRepository;
exports.AIPersonaRepository = AIPersonaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AIPersonaRepository);
//# sourceMappingURL=ai-persona.repository.js.map