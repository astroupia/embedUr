import { AIPersona as PrismaAIPersona } from '../../generated/prisma';
import { AIPersonaEntity } from './entities/ai-persona.entity';
import { AIPersonaResponseDto } from './dto/ai-persona-response.dto';
export declare class AIPersonaMapper {
    static toEntity(prisma: PrismaAIPersona): AIPersonaEntity;
    static toResponseDto(entity: AIPersonaEntity): AIPersonaResponseDto;
}
