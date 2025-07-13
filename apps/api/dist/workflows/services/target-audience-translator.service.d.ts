import { TargetAudienceTranslatorRepository } from '../repositories/target-audience-translator.repository';
import { TargetAudienceTranslatorAiService } from './target-audience-translator-ai.service';
import { TargetAudienceTranslatorEntity } from '../entities/target-audience-translator.entity';
import { CreateTargetAudienceTranslatorDto, QueryTargetAudienceTranslatorCursorDto, InputFormat } from '../dto/target-audience-translator.dto';
import { TargetAudienceTranslatorEventsService } from './target-audience-translator-events.service';
export declare class TargetAudienceTranslatorService {
    private readonly repository;
    private readonly aiService;
    private readonly events;
    private readonly logger;
    constructor(repository: TargetAudienceTranslatorRepository, aiService: TargetAudienceTranslatorAiService, events: TargetAudienceTranslatorEventsService);
    create(dto: CreateTargetAudienceTranslatorDto, companyId: string, createdBy: string): Promise<TargetAudienceTranslatorEntity>;
    findAll(companyId: string, query: QueryTargetAudienceTranslatorCursorDto): Promise<{
        data: TargetAudienceTranslatorEntity[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<TargetAudienceTranslatorEntity>;
    findByStatus(status: string, companyId: string): Promise<TargetAudienceTranslatorEntity[]>;
    findByInputFormat(inputFormat: InputFormat, companyId: string): Promise<TargetAudienceTranslatorEntity[]>;
    getStats(companyId: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byInputFormat: Record<InputFormat, number>;
        successful: number;
        failed: number;
        pending: number;
    }>;
    retryTranslation(id: string, companyId: string, createdBy: string): Promise<TargetAudienceTranslatorEntity>;
    private processTranslation;
    private validateInput;
}
