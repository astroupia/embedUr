import { LeadEntity } from '../entities/lead.entity';
import { LeadResponseDto } from '../dtos/lead-response.dto';

export class LeadResponseMapper {
  static toResponseDto(entity: LeadEntity): LeadResponseDto {
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
      // Business logic properties
      score: entity.score,
      isQualified: entity.isQualified,
      hasEnrichmentData: entity.hasEnrichmentData,
      companyName: entity.companyName,
      jobTitle: entity.jobTitle,
      location: entity.location,
    };
  }

  static toResponseDtoList(entities: LeadEntity[]): LeadResponseDto[] {
    return entities.map(entity => this.toResponseDto(entity));
  }
} 