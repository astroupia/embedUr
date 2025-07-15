import { EnrichmentService } from '../services/enrichment.service';
import { TriggerEnrichmentDto, RetryEnrichmentDto } from '../dto/enrichment.dto';
import { QueryEnrichmentCursorDto } from '../dto/query-enrichment-cursor.dto';
import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
import { EnrichmentProvider } from '../constants/enrichment.constants';
import { CompleteEnrichmentDto } from '../dto/complete-enrichment.dto';
import { EnrichmentRepository } from '../repositories/enrichment.repository';
interface CurrentUserPayload {
    userId: string;
    companyId: string;
    role: string;
}
export declare class EnrichmentController {
    private readonly enrichmentService;
    private readonly enrichmentRepository;
    private readonly logger;
    constructor(enrichmentService: EnrichmentService, enrichmentRepository: EnrichmentRepository);
    triggerEnrichment(triggerEnrichmentDto: TriggerEnrichmentDto, user: CurrentUserPayload): Promise<EnrichmentRequestEntity>;
    retryEnrichment(id: string, retryEnrichmentDto: RetryEnrichmentDto, user: CurrentUserPayload): Promise<EnrichmentRequestEntity>;
    findAll(query: QueryEnrichmentCursorDto, user: CurrentUserPayload): Promise<{
        data: EnrichmentRequestEntity[];
        nextCursor: string | null;
    }>;
    getStats(user: CurrentUserPayload): Promise<import("../dto/enrichment.dto").EnrichmentStatsDto>;
    findByLead(leadId: string, user: CurrentUserPayload): Promise<EnrichmentRequestEntity[]>;
    findByProvider(provider: EnrichmentProvider, user: CurrentUserPayload): Promise<EnrichmentRequestEntity[]>;
    findOne(id: string, user: CurrentUserPayload): Promise<EnrichmentRequestEntity>;
    handleEnrichmentComplete(dto: CompleteEnrichmentDto): Promise<{
        success: boolean;
    }>;
    private updateLeadWithEnrichedData;
    private updateEnrichmentRequest;
    private handleFailedEnrichment;
    private logEnrichmentCompletion;
}
export {};
