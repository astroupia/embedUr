import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AIPersonaService } from './ai-persona.service';
import { CreateAIPersonaDto } from './dto/create-ai-persona.dto';
import { UpdateAIPersonaDto } from './dto/update-ai-persona.dto';
import { AIPersonaResponseDto } from './dto/ai-persona-response.dto';
export declare class AIPersonaController {
    private readonly service;
    constructor(service: AIPersonaService);
    findAll(user: CurrentUser): Promise<AIPersonaResponseDto[]>;
    create(dto: CreateAIPersonaDto, user: CurrentUser): Promise<AIPersonaResponseDto>;
    findById(id: string, user: CurrentUser): Promise<AIPersonaResponseDto>;
    update(id: string, dto: UpdateAIPersonaDto, user: CurrentUser): Promise<AIPersonaResponseDto>;
    delete(id: string, user: CurrentUser): Promise<void>;
}
