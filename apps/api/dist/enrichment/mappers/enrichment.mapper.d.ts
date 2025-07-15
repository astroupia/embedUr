import { EnrichmentRequest as PrismaEnrichmentRequest } from '../../../generated/prisma';
import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
export declare class EnrichmentMapper {
    static toEntity(prismaModel: PrismaEnrichmentRequest): EnrichmentRequestEntity;
    static toEntityList(prismaModels: PrismaEnrichmentRequest[]): EnrichmentRequestEntity[];
    static toPrismaCreate(entity: EnrichmentRequestEntity): {
        provider: any;
        requestData: Record<string, any>;
        responseData: Record<string, any> | undefined;
        leadId: string;
        companyId: string;
    };
    static toPrismaUpdate(entity: EnrichmentRequestEntity): {
        provider: any;
        requestData: Record<string, any>;
        responseData: Record<string, any> | undefined;
    };
}
