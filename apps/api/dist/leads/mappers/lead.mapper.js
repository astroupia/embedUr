"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadMapper = void 0;
const lead_entity_1 = require("../entities/lead.entity");
const lead_constants_1 = require("../constants/lead.constants");
class LeadMapper {
    static toEntity(prisma) {
        return new lead_entity_1.LeadEntity(prisma.id, prisma.fullName, prisma.email, prisma.linkedinUrl ?? null, prisma.enrichmentData ?? null, prisma.verified, prisma.status, prisma.companyId, prisma.campaignId, prisma.createdAt, prisma.updatedAt, prisma.campaign ? {
            id: prisma.campaign.id,
            name: prisma.campaign.name,
            aiPersona: prisma.campaign.aiPersona ? {
                id: prisma.campaign.aiPersona.id,
                name: prisma.campaign.aiPersona.name,
                description: prisma.campaign.aiPersona.description,
                prompt: prisma.campaign.aiPersona.prompt,
                parameters: prisma.campaign.aiPersona.parameters,
            } : null,
        } : null);
    }
    static toPrismaCreate(dto, companyId) {
        return {
            fullName: dto.fullName,
            email: dto.email,
            linkedinUrl: dto.linkedinUrl,
            enrichmentData: dto.enrichmentData,
            verified: dto.verified ?? false,
            status: dto.status ?? lead_constants_1.LeadStatus.NEW,
            companyId,
            campaignId: dto.campaignId,
        };
    }
    static toPrismaUpdate(dto) {
        return {
            ...(dto.fullName && { fullName: dto.fullName }),
            ...(dto.email && { email: dto.email }),
            ...(dto.linkedinUrl && { linkedinUrl: dto.linkedinUrl }),
            ...(dto.enrichmentData && { enrichmentData: dto.enrichmentData }),
            ...(dto.verified !== undefined && { verified: dto.verified }),
            ...(dto.status && { status: dto.status }),
        };
    }
}
exports.LeadMapper = LeadMapper;
//# sourceMappingURL=lead.mapper.js.map