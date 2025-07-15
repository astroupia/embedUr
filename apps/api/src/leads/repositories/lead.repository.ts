import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadEntity } from '../entities/lead.entity';
import { LeadMapper } from '../mappers/lead.mapper';
import { QueryLeadsCursorDto } from '../dtos/query-leads-cursor.dto';
import { CreateLeadDto, UpdateLeadDto } from '../dtos/lead.dto';
import { $Enums } from '../../../generated/prisma';

@Injectable()
export class LeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto, companyId: string): Promise<LeadEntity> {
    try {
      const data = LeadMapper.toPrismaCreate(dto, companyId);
      const lead = await this.prisma.lead.create({ data });
      return LeadMapper.toEntity(lead);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Lead with this email already exists for this company');
      }
      throw error;
    }
  }

  async findWithCursor(
    companyId: string,
    query: QueryLeadsCursorDto,
  ): Promise<{ data: LeadEntity[]; nextCursor: string | null }> {
    const { cursor, take = 20, status, search, campaignId } = query;
    const takeNumber = typeof take === 'string' ? parseInt(take, 10) : take;
    const where: Record<string, any> = { companyId };
    
    if (status) {
      where.status = status;
    }
    
    if (campaignId) {
      where.campaignId = campaignId;
    }
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const items = await this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: takeNumber + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        campaign: {
          include: {
            aiPersona: true,
          },
        },
      },
    });

    const hasMore = items.length > takeNumber;
    const data = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data: data.map(item => LeadMapper.toEntity(item)),
      nextCursor,
    };
  }

  async findOne(id: string, companyId: string): Promise<LeadEntity> {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        campaign: {
          include: {
            aiPersona: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return LeadMapper.toEntity(lead);
  }

  async update(id: string, companyId: string, dto: UpdateLeadDto): Promise<LeadEntity> {
    // First check if lead exists
    await this.findOne(id, companyId);

    const data = LeadMapper.toPrismaUpdate(dto);
    const lead = await this.prisma.lead.update({
      where: { id },
      data,
      include: {
        campaign: {
          include: {
            aiPersona: true,
          },
        },
      },
    });

    return LeadMapper.toEntity(lead);
  }

  async remove(id: string, companyId: string): Promise<void> {
    // First check if lead exists
    await this.findOne(id, companyId);

    await this.prisma.lead.delete({
      where: { id },
    });
  }

  async findByEmail(email: string, companyId: string): Promise<LeadEntity | null> {
    const lead = await this.prisma.lead.findFirst({
      where: { email, companyId },
    });

    return lead ? LeadMapper.toEntity(lead) : null;
  }

  async findByStatus(status: $Enums.LeadStatus, companyId: string): Promise<LeadEntity[]> {
    const leads = await this.prisma.lead.findMany({
      where: { status, companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          include: {
            aiPersona: true,
          },
        },
      },
    });

    return leads.map(LeadMapper.toEntity);
  }

  async countByCompany(companyId: string): Promise<number> {
    return this.prisma.lead.count({
      where: { companyId },
    });
  }

  async countByStatus(status: $Enums.LeadStatus, companyId: string): Promise<number> {
    return this.prisma.lead.count({
      where: { status, companyId },
    });
  }

  async findOneWithCampaign(id: string, companyId: string): Promise<LeadEntity> {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: { campaign: true },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return LeadMapper.toEntity(lead);
  }

  async findOneWithEnrichmentData(id: string, companyId: string): Promise<LeadEntity> {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: { campaign: true },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return LeadMapper.toEntity(lead);
  }

  async updateEnrichmentData(
    id: string, 
    companyId: string, 
    enrichmentData: Record<string, any>,
    additionalFields?: Record<string, any>
  ): Promise<LeadEntity> {
    const updateData: any = {
      enrichmentData,
      ...additionalFields,
    };

    const lead = await this.prisma.lead.updateMany({
      where: { id, companyId },
      data: updateData,
    });

    // Return the updated lead
    return this.findOne(id, companyId);
  }

  async updateStatus(id: string, companyId: string, status: $Enums.LeadStatus): Promise<LeadEntity> {
    const lead = await this.prisma.lead.update({
      where: { id },
      data: { status },
    });

    return LeadMapper.toEntity(lead);
  }

  async createAuditTrail(
    entityId: string, 
    action: string, 
    changes: Record<string, any>, 
    companyId: string,
    performedById?: string
  ): Promise<void> {
    await this.prisma.auditTrail.create({
      data: {
        entity: 'Lead',
        entityId,
        action,
        changes,
        companyId,
        performedById,
      },
    });
  }

  async createEnrichmentRequest(
    leadId: string,
    data: {
      provider: string;
      requestData: Record<string, any>;
      companyId: string;
    }
  ): Promise<void> {
    await this.prisma.enrichmentRequest.create({
      data: {
        provider: data.provider as any,
        requestData: data.requestData,
        status: 'PENDING',
        leadId,
        companyId: data.companyId,
      },
    });
  }

  async createEmailLog(
    leadId: string,
    data: {
      status: string;
      campaignId: string;
      companyId: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.prisma.emailLog.create({
      data: {
        status: data.status as any,
        leadId,
        campaignId: data.campaignId,
        companyId: data.companyId,
        metadata: data.metadata,
      },
    });
  }

  async createSystemNotification(
    message: string,
    level: string,
    companyId: string
  ): Promise<void> {
    await this.prisma.systemNotification.create({
      data: {
        message,
        level: level as any,
        companyId,
      },
    });
  }

  async findOneWithCampaignAndAiPersona(id: string, companyId: string): Promise<LeadEntity> {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: { 
        campaign: {
          include: {
            aiPersona: true
          }
        } 
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // Cast to any to bypass type mismatch for now
    return LeadMapper.toEntity(lead as any);
  }
} 