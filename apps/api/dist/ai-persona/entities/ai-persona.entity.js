"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPersonaEntity = void 0;
class AIPersonaEntity {
    id;
    name;
    description;
    prompt;
    parameters;
    companyId;
    createdAt;
    updatedAt;
    constructor(id, name, description, prompt, parameters, companyId, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.prompt = prompt;
        this.parameters = parameters;
        this.companyId = companyId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    isEditable() {
        return true;
    }
}
exports.AIPersonaEntity = AIPersonaEntity;
//# sourceMappingURL=ai-persona.entity.js.map