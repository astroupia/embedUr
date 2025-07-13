import { TargetAudienceTranslatorService } from '../services/target-audience-translator.service';
import { CreateTargetAudienceTranslatorDto, QueryTargetAudienceTranslatorCursorDto, InputFormat } from '../dto/target-audience-translator.dto';
import { TargetAudienceTranslatorEntity } from '../entities/target-audience-translator.entity';
interface CurrentUserPayload {
    userId: string;
    companyId: string;
    role: string;
}
export declare class TargetAudienceTranslatorController {
    private readonly targetAudienceTranslatorService;
    constructor(targetAudienceTranslatorService: TargetAudienceTranslatorService);
    create(createDto: CreateTargetAudienceTranslatorDto, user: CurrentUserPayload): Promise<TargetAudienceTranslatorEntity>;
    findAll(query: QueryTargetAudienceTranslatorCursorDto, user: CurrentUserPayload): Promise<{
        data: TargetAudienceTranslatorEntity[];
        nextCursor: string | null;
    }>;
    getStats(user: CurrentUserPayload): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byInputFormat: Record<InputFormat, number>;
        successful: number;
        failed: number;
        pending: number;
    }>;
    findByStatus(status: string, user: CurrentUserPayload): Promise<TargetAudienceTranslatorEntity[]>;
    findByInputFormat(format: InputFormat, user: CurrentUserPayload): Promise<TargetAudienceTranslatorEntity[]>;
    findOne(id: string, user: CurrentUserPayload): Promise<TargetAudienceTranslatorEntity>;
    retryTranslation(id: string, user: CurrentUserPayload): Promise<TargetAudienceTranslatorEntity>;
}
export {};
