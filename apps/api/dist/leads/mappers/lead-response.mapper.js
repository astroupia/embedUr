"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadResponseMapper = void 0;
class LeadResponseMapper {
    static toResponseDto(entity) {
        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
            linkedinUrl: entity.linkedinUrl,
            enrichmentData: entity.enrichmentData,
            verified: entity.verified,
            status: entity.status,
            companyId: entity.companyId,
            campaignId: entity.campaignId,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            campaign: entity.campaign,
            score: entity.score,
            isQualified: entity.isQualified,
            hasEnrichmentData: entity.hasEnrichmentData,
            companyName: entity.companyName,
            jobTitle: entity.jobTitle,
            location: entity.location,
        };
    }
    static toResponseDtoList(entities) {
        return entities.map(entity => this.toResponseDto(entity));
    }
}
exports.LeadResponseMapper = LeadResponseMapper;
//# sourceMappingURL=lead-response.mapper.js.map