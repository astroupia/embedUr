"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPersonaMapper = void 0;
const ai_persona_entity_1 = require("./entities/ai-persona.entity");
class AIPersonaMapper {
    static toEntity(prisma) {
        return new ai_persona_entity_1.AIPersonaEntity(prisma.id, prisma.name, prisma.description ?? null, prisma.prompt, prisma.parameters ?? null, prisma.companyId, prisma.createdAt, prisma.updatedAt);
    }
    static toResponseDto(entity) {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description ?? undefined,
            prompt: entity.prompt,
            parameters: entity.parameters ?? undefined,
            companyId: entity.companyId,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
exports.AIPersonaMapper = AIPersonaMapper;
//# sourceMappingURL=ai-persona.mapper.js.map