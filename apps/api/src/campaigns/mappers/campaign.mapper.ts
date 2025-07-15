import type { Campaign as PrismaCampaign, AIPersona as PrismaAIPersona, Workflow as PrismaWorkflow } from '../../../generated/prisma';
import { CampaignEntity, AIPersonaPreview, WorkflowPreview } from '../entities/campaign.entity';
import { CampaignStatus } from '../constants/campaign.constants';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';

export class CampaignMapper {
  static toEntity(
    prisma: PrismaCampaign,
    aiPersona?: PrismaAIPersona,
    workflow?: PrismaWorkflow,
    leadCount?: number,
  ): CampaignEntity {
    return new CampaignEntity(
      prisma.id,
      prisma.name,
      prisma.description,
      prisma.status as CampaignStatus,
      prisma.aiPersonaId,
      prisma.workflowId,
      prisma.companyId,
      prisma.createdAt,
      prisma.updatedAt,
      aiPersona ? {
        id: aiPersona.id,
        name: aiPersona.name,
        description: aiPersona.description || undefined,
      } : undefined,
      workflow ? {
        id: workflow.id,
        name: workflow.name,
        type: workflow.type,
      } : undefined,
      leadCount,
    );
  }

  static toPrismaCreate(dto: CreateCampaignDto, companyId: string): any {
    const data: any = {
      status: CampaignStatus.DRAFT,
      companyId,
    };

    // Only include name if it's provided
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

  static toPrismaUpdate(dto: UpdateCampaignDto): any {
    return {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.status && { status: dto.status }),
      ...(dto.aiPersonaId !== undefined && { aiPersonaId: dto.aiPersonaId }),
      ...(dto.workflowId !== undefined && { workflowId: dto.workflowId }),
    };
  }

  static toAIPersonaPreview(prisma: PrismaAIPersona): AIPersonaPreview {
    return {
      id: prisma.id,
      name: prisma.name,
      description: prisma.description || undefined,
    };
  }

  static toWorkflowPreview(prisma: PrismaWorkflow): WorkflowPreview {
    return {
      id: prisma.id,
      name: prisma.name,
      type: prisma.type,
    };
  }
} 