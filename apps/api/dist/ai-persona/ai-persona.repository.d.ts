import { PrismaService } from '../prisma/prisma.service';
import { CreateAIPersonaDto } from './dto/create-ai-persona.dto';
import { UpdateAIPersonaDto } from './dto/update-ai-persona.dto';
import { AIPersonaEntity } from './entities/ai-persona.entity';
export declare class AIPersonaRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<AIPersonaEntity[]>;
    findById(id: string, companyId: string): Promise<AIPersonaEntity | null>;
    create(dto: CreateAIPersonaDto, companyId: string): Promise<AIPersonaEntity>;
    update(id: string, dto: UpdateAIPersonaDto, companyId: string): Promise<AIPersonaEntity>;
    delete(id: string, companyId: string): Promise<void>;
}
