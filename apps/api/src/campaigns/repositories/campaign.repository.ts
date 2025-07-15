import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CampaignEntity } from '../entities/campaign.entity';
import { CampaignMapper } from '../mappers/campaign.mapper';
import { QueryCampaignsCursorDto } from '../dto/query-campaigns-cursor.dto';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { CampaignStatus } from '../constants/campaign.constants';

@Injectable()
export class CampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCampaignDto, companyId: string): Promise<CampaignEntity> {
    try {
      // Validate AI Persona belongs to company if provided
      if (dto.aiPersonaId) {
        await this.validateAIPersonaOwnership(dto.aiPersonaId, companyId);
      }

      // Validate Workflow belongs to company if provided
      if (dto.workflowId) {
        await this.validateWorkflowOwnership(dto.workflowId, companyId);
      }

      const data = CampaignMapper.toPrismaCreate(dto, companyId);
      const campaign = await this.prisma.campaign.create({ data });
      return CampaignMapper.toEntity(campaign);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Campaign with this name already exists for this company');
      }
      throw error;
    }
  }

  async findWithCursor(
    companyId: string,
    query: QueryCampaignsCursorDto,
  ): Promise<{ data: CampaignEntity[]; nextCursor: string | null }> {
    const { cursor, take = 20, status, search } = query;
    const takeNumber = typeof take === 'string' ? parseInt(take, 10) : take;
    const where: Record<string, any> = { companyId };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    const items = await this.prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: takeNumber + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        aiPersona: true,
        workflow: true,
        _count: {
          select: { leads: true },
        },
      },
    });

    const hasMore = items.length > takeNumber;
    const data = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data: data.map(item => CampaignMapper.toEntity(
        item,
        item.aiPersona || undefined,
        item.workflow || undefined,
        item._count.leads,
      )),
      nextCursor,
    };
  }

  async findOne(id: string, companyId: string): Promise<CampaignEntity> {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
      include: {
        aiPersona: true,
        workflow: true,
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return CampaignMapper.toEntity(
      campaign,
      campaign.aiPersona || undefined,
      campaign.workflow || undefined,
      campaign._count.leads,
    );
  }

  async update(id: string, companyId: string, dto: UpdateCampaignDto): Promise<CampaignEntity> {
    // First check if campaign exists and is editable
    const existingCampaign = await this.findOne(id, companyId);
    
    if (!existingCampaign.isEditable) {
      throw new BadRequestException('Campaign cannot be edited in its current status');
    }

    // Validate status transition if status is being updated
    if (dto.status && !existingCampaign.canTransitionTo(dto.status)) {
      throw new BadRequestException(`Invalid status transition from ${existingCampaign.status} to ${dto.status}`);
    }

    // Validate AI Persona belongs to company if being updated
    if (dto.aiPersonaId) {
      await this.validateAIPersonaOwnership(dto.aiPersonaId, companyId);
    }

    // Validate Workflow belongs to company if being updated
    if (dto.workflowId) {
      await this.validateWorkflowOwnership(dto.workflowId, companyId);
    }

    const data = CampaignMapper.toPrismaUpdate(dto);
    const campaign = await this.prisma.campaign.update({
      where: { id },
      data,
      include: {
        aiPersona: true,
        workflow: true,
        _count: {
          select: { leads: true },
        },
      },
    });

    return CampaignMapper.toEntity(
      campaign,
      campaign.aiPersona || undefined,
      campaign.workflow || undefined,
      campaign._count.leads,
    );
  }

  async archive(id: string, companyId: string): Promise<CampaignEntity> {
    const existingCampaign = await this.findOne(id, companyId);
    
    if (!existingCampaign.canArchive()) {
      throw new BadRequestException('Campaign cannot be archived in its current status');
    }

    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.ARCHIVED },
      include: {
        aiPersona: true,
        workflow: true,
        _count: {
          select: { leads: true },
        },
      },
    });

    return CampaignMapper.toEntity(
      campaign,
      campaign.aiPersona || undefined,
      campaign.workflow || undefined,
      campaign._count.leads,
    );
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existingCampaign = await this.findOne(id, companyId);
    
    if (!existingCampaign.isDeletable) {
      throw new BadRequestException('Campaign cannot be deleted in its current status');
    }

    await this.prisma.campaign.delete({
      where: { id },
    });
  }

  async findByStatus(status: CampaignStatus, companyId: string): Promise<CampaignEntity[]> {
    const campaigns = await this.prisma.campaign.findMany({
      where: { status, companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        aiPersona: true,
        workflow: true,
        _count: {
          select: { leads: true },
        },
      },
    });

    return campaigns.map(campaign => CampaignMapper.toEntity(
      campaign,
      campaign.aiPersona || undefined,
      campaign.workflow || undefined,
      campaign._count.leads,
    ));
  }

  async countByCompany(companyId: string): Promise<number> {
    return this.prisma.campaign.count({
      where: { companyId },
    });
  }

  async countByStatus(status: CampaignStatus, companyId: string): Promise<number> {
    return this.prisma.campaign.count({
      where: { status, companyId },
    });
  }

  async countActiveByCompany(companyId: string): Promise<number> {
    return this.prisma.campaign.count({
      where: { 
        companyId,
        status: { in: [CampaignStatus.ACTIVE, CampaignStatus.PAUSED] },
      },
    });
  }

  private async validateAIPersonaOwnership(aiPersonaId: string, companyId: string): Promise<void> {
    const aiPersona = await this.prisma.aIPersona.findFirst({
      where: { id: aiPersonaId, companyId },
    });

    if (!aiPersona) {
      throw new BadRequestException('AI Persona not found or does not belong to this company');
    }
  }

  private async validateWorkflowOwnership(workflowId: string, companyId: string): Promise<void> {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: workflowId, companyId },
    });

    if (!workflow) {
      throw new BadRequestException('Workflow not found or does not belong to this company');
    }
  }
} 