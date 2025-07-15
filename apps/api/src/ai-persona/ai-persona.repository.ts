import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAIPersonaDto } from './dto/create-ai-persona.dto';
import { UpdateAIPersonaDto } from './dto/update-ai-persona.dto';
import { AIPersonaEntity } from './entities/ai-persona.entity';
import { AIPersonaMapper } from './ai-persona.mapper';

@Injectable()
export class AIPersonaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string): Promise<AIPersonaEntity[]> {
    const personas = await this.prisma.aIPersona.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return personas.map(AIPersonaMapper.toEntity);
  }

  async findById(id: string, companyId: string): Promise<AIPersonaEntity | null> {
    const persona = await this.prisma.aIPersona.findFirst({
      where: { id, companyId },
    });
    return persona ? AIPersonaMapper.toEntity(persona) : null;
  }

  async create(dto: CreateAIPersonaDto, companyId: string): Promise<AIPersonaEntity> {
    const persona = await this.prisma.aIPersona.create({
      data: {
        name: dto.name,
        description: dto.description,
        prompt: dto.prompt,
        parameters: dto.parameters,
        companyId,
      },
    });
    return AIPersonaMapper.toEntity(persona);
  }

  async update(id: string, dto: UpdateAIPersonaDto, companyId: string): Promise<AIPersonaEntity> {
    const persona = await this.prisma.aIPersona.update({
      where: { id, companyId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
    return AIPersonaMapper.toEntity(persona);
  }

  async delete(id: string, companyId: string): Promise<void> {
    // Check if persona is linked to any active campaigns
    const linkedCampaigns = await this.prisma.campaign.count({
      where: { aiPersonaId: id, companyId, status: { not: 'ARCHIVED' } },
    });
    if (linkedCampaigns > 0) {
      throw new ConflictException('Cannot delete persona linked to active campaigns');
    }
    await this.prisma.aIPersona.delete({ where: { id, companyId } });
  }
} 