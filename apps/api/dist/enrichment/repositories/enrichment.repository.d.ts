import { PrismaService } from '../../prisma/prisma.service';
import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
import { QueryEnrichmentCursorDto } from '../dto/query-enrichment-cursor.dto';
import { EnrichmentProvider, EnrichmentStatus } from '../constants/enrichment.constants';
export declare class EnrichmentRepository {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(entity: EnrichmentRequestEntity): Promise<EnrichmentRequestEntity>;
    findOne(id: string, companyId: string): Promise<EnrichmentRequestEntity>;
    findWithCursor(companyId: string, query: QueryEnrichmentCursorDto): Promise<{
        data: EnrichmentRequestEntity[];
        nextCursor: string | null;
    }>;
    findByLead(leadId: string, companyId: string): Promise<EnrichmentRequestEntity[]>;
    findByProvider(provider: EnrichmentProvider, companyId: string): Promise<EnrichmentRequestEntity[]>;
    findByStatus(status: EnrichmentStatus, companyId: string): Promise<EnrichmentRequestEntity[]>;
    update(id: string, companyId: string, entity: EnrichmentRequestEntity): Promise<EnrichmentRequestEntity>;
    remove(id: string, companyId: string): Promise<void>;
    countByCompany(companyId: string): Promise<number>;
    countByProvider(provider: EnrichmentProvider, companyId: string): Promise<number>;
    countByStatus(status: EnrichmentStatus, companyId: string): Promise<number>;
    findActiveEnrichment(leadId: string, companyId: string): Promise<EnrichmentRequestEntity | null>;
    getStats(companyId: string): Promise<{
        total: number;
        successful: number;
        failed: number;
        pending: number;
        byProvider: Record<EnrichmentProvider, {
            total: number;
            successful: number;
            failed: number;
        }>;
        averageDurationSeconds: number;
    }>;
    private getProviderStats;
    private getAverageDuration;
    findLeadById(leadId: string, companyId: string): Promise<any>;
    updateLeadEnrichmentData(leadId: string, companyId: string, enrichmentData: Record<string, any>): Promise<void>;
    findEnrichmentRequestByLead(leadId: string, companyId: string): Promise<EnrichmentRequestEntity | null>;
    updateEnrichmentRequestStatus(id: string, companyId: string, status: string, responseData?: Record<string, any>, errorMessage?: string): Promise<void>;
    createAuditTrail(entityId: string, action: string, changes: Record<string, any>, companyId: string, performedById?: string): Promise<void>;
}
