import type { Lead as PrismaLead } from '../../../generated/prisma';
import { LeadEntity } from '../entities/lead.entity';
import { LeadStatus } from '../constants/lead.constants';
import { CreateLeadDto, UpdateLeadDto } from '../dtos/lead.dto';

export class LeadMapper {
  static toEntity(prisma: PrismaLead & { 
    campaign?: { 
      id: string; 
      name: string;
      aiPersona?: {
        id: string;
        name: string;
        description: string | null;
        prompt: string;
        parameters: any;
      } | null;
    } | null 
  }): LeadEntity {
    return new LeadEntity(
      prisma.id,
      prisma.fullName,
      prisma.email,
      prisma.linkedinUrl ?? null,
      prisma.enrichmentData as any ?? null,
      prisma.verified,
      prisma.status as LeadStatus,
      prisma.companyId,
      prisma.campaignId,
      prisma.createdAt,
      prisma.updatedAt,
      prisma.campaign ? {
        id: prisma.campaign.id,
        name: prisma.campaign.name,
        aiPersona: prisma.campaign.aiPersona ? {
          id: prisma.campaign.aiPersona.id,
          name: prisma.campaign.aiPersona.name,
          description: prisma.campaign.aiPersona.description,
          prompt: prisma.campaign.aiPersona.prompt,
          parameters: prisma.campaign.aiPersona.parameters,
        } : null,
      } : null,
    );
  }

  static toPrismaCreate(dto: CreateLeadDto, companyId: string): any {
    return {
      fullName: dto.fullName,
      email: dto.email,
      linkedinUrl: dto.linkedinUrl,
      enrichmentData: dto.enrichmentData,
      verified: dto.verified ?? false,
      status: dto.status ?? LeadStatus.NEW,
      companyId,
      campaignId: dto.campaignId,
    };
  }

  static toPrismaUpdate(dto: UpdateLeadDto): any {
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