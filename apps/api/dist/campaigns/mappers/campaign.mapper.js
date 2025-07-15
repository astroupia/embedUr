"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignMapper = void 0;
const campaign_entity_1 = require("../entities/campaign.entity");
const campaign_constants_1 = require("../constants/campaign.constants");
class CampaignMapper {
    static toEntity(prisma, aiPersona, workflow, leadCount) {
        return new campaign_entity_1.CampaignEntity(prisma.id, prisma.name, prisma.description, prisma.status, prisma.aiPersonaId, prisma.workflowId, prisma.companyId, prisma.createdAt, prisma.updatedAt, aiPersona ? {
            id: aiPersona.id,
            name: aiPersona.name,
            description: aiPersona.description || undefined,
        } : undefined, workflow ? {
            id: workflow.id,
            name: workflow.name,
            type: workflow.type,
        } : undefined, leadCount);
    }
    static toPrismaCreate(dto, companyId) {
        const data = {
            status: campaign_constants_1.CampaignStatus.DRAFT,
            companyId,
        };
        if (dto.name !== undefined) {
            data.name = dto.name;
        }
        if (dto.description !== undefined) {
            data.description = dto.description;
        }
        if (dto.aiPersonaId !== undefined) {
            data.aiPersonaId = dto.aiPersonaId;
        }
        if (dto.workflowId !== undefined) {
            data.workflowId = dto.workflowId;
        }
        return data;
    }
    static toPrismaUpdate(dto) {
        return {
            ...(dto.name && { name: dto.name }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.status && { status: dto.status }),
            ...(dto.aiPersonaId !== undefined && { aiPersonaId: dto.aiPersonaId }),
            ...(dto.workflowId !== undefined && { workflowId: dto.workflowId }),
        };
    }
    static toAIPersonaPreview(prisma) {
        return {
            id: prisma.id,
            name: prisma.name,
            description: prisma.description || undefined,
        };
    }
    static toWorkflowPreview(prisma) {
        return {
            id: prisma.id,
            name: prisma.name,
            type: prisma.type,
        };
    }
}
exports.CampaignMapper = CampaignMapper;
//# sourceMappingURL=campaign.mapper.js.map