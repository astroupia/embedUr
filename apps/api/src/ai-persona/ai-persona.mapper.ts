import { AIPersona as PrismaAIPersona } from '../../generated/prisma';
import { AIPersonaEntity } from './entities/ai-persona.entity';
import { AIPersonaResponseDto } from './dto/ai-persona-response.dto';

export class AIPersonaMapper {
  static toEntity(prisma: PrismaAIPersona): AIPersonaEntity {
    return new AIPersonaEntity(
      prisma.id,
      prisma.name,
      prisma.description ?? null,
      prisma.prompt,
      (prisma.parameters as any) ?? null,
      prisma.companyId,
      prisma.createdAt,
      prisma.updatedAt,
    );
  }

  static toResponseDto(entity: AIPersonaEntity): AIPersonaResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? undefined,
      prompt: entity.prompt,
      parameters: entity.parameters ?? undefined,
      companyId: entity.companyId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
} 