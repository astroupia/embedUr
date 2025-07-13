import { EnrichmentRepository } from '../repositories/enrichment.repository';
import { EnrichmentEventsService } from '../events/enrichment-events.service';
import { ApolloEnrichmentProvider } from '../providers/apollo-enrichment-provider';
import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
import { TriggerEnrichmentDto, RetryEnrichmentDto, EnrichmentStatsDto } from '../dto/enrichment.dto';
import { QueryEnrichmentCursorDto } from '../dto/query-enrichment-cursor.dto';
import { EnrichmentProvider } from '../constants/enrichment.constants';
import { LeadRepository } from '../../leads/repositories/lead.repository';
import { LeadEventsService } from '../../leads/services/lead-events.service';
export declare class EnrichmentService {
    private readonly enrichmentRepository;
    private readonly enrichmentEvents;
    private readonly apolloProvider;
    private readonly leadRepository;
    private readonly leadEvents;
    private readonly logger;
    constructor(enrichmentRepository: EnrichmentRepository, enrichmentEvents: EnrichmentEventsService, apolloProvider: ApolloEnrichmentProvider, leadRepository: LeadRepository, leadEvents: LeadEventsService);
    triggerEnrichment(dto: TriggerEnrichmentDto, companyId: string, triggeredBy: string): Promise<EnrichmentRequestEntity>;
    retryEnrichment(enrichmentId: string, companyId: string, dto: RetryEnrichmentDto, triggeredBy: string): Promise<EnrichmentRequestEntity>;
    findAll(companyId: string, query: QueryEnrichmentCursorDto): Promise<{
        data: EnrichmentRequestEntity[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<EnrichmentRequestEntity>;
    findByLead(leadId: string, companyId: string): Promise<EnrichmentRequestEntity[]>;
    findByProvider(provider: EnrichmentProvider, companyId: string): Promise<EnrichmentRequestEntity[]>;
    getStats(companyId: string): Promise<EnrichmentStatsDto>;
    private processEnrichment;
    private updateLeadWithEnrichedData;
    private getProvider;
    private getDefaultProvider;
    triggerEnrichmentWorkflow(leadId: string, companyId: string): Promise<void>;
}
