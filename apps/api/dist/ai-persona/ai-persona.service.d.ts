import { AIPersonaRepository } from './ai-persona.repository';
import { CreateAIPersonaDto } from './dto/create-ai-persona.dto';
import { UpdateAIPersonaDto } from './dto/update-ai-persona.dto';
import { AIPersonaResponseDto } from './dto/ai-persona-response.dto';
export declare class AIPersonaService {
    private readonly repo;
    private readonly PROMPT_MAX_LENGTH;
    private readonly NAME_MAX_LENGTH;
    private readonly DESCRIPTION_MAX_LENGTH;
    private readonly FORBIDDEN_KEYWORDS;
    constructor(repo: AIPersonaRepository);
    findAll(companyId: string): Promise<AIPersonaResponseDto[]>;
    findById(id: string, companyId: string): Promise<AIPersonaResponseDto>;
    create(dto: CreateAIPersonaDto, companyId: string): Promise<AIPersonaResponseDto>;
    update(id: string, dto: UpdateAIPersonaDto, companyId: string): Promise<AIPersonaResponseDto>;
    delete(id: string, companyId: string): Promise<void>;
    private validatePrompt;
    private validateName;
    private validateDescription;
    private validateParameters;
    private validateParameter;
    private containsPromptInjection;
    private hasBalancedBrackets;
    private hasExcessiveRepetition;
    testPromptSafety(prompt: string): Promise<{
        isSafe: boolean;
        confidence: number;
        issues: string[];
    }>;
    getPromptStats(companyId: string): Promise<{
        totalPersonas: number;
        averagePromptLength: number;
        longestPrompt: number;
        shortestPrompt: number;
    }>;
}
