import { EnrichmentRequest as PrismaEnrichmentRequest } from '../../../generated/prisma';
import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
import { EnrichmentProvider, EnrichmentStatus } from '../constants/enrichment.constants';

export class EnrichmentMapper {
  static toEntity(prismaModel: PrismaEnrichmentRequest): EnrichmentRequestEntity {
    return new EnrichmentRequestEntity(
      prismaModel.id,
      prismaModel.provider as EnrichmentProvider,
      prismaModel.requestData as Record<string, any>,
      prismaModel.responseData as Record<string, any> | null,
      'PENDING' as EnrichmentStatus, // Default status for now
      prismaModel.leadId,
      prismaModel.companyId,
      prismaModel.createdAt,
      prismaModel.createdAt, // Use createdAt as updatedAt for now
      undefined, // No errorMessage field yet
      0, // Default retryCount
      undefined, // No durationMs field yet
    );
  }

  static toEntityList(prismaModels: PrismaEnrichmentRequest[]): EnrichmentRequestEntity[] {
    return prismaModels.map(this.toEntity);
  }

  static toPrismaCreate(entity: EnrichmentRequestEntity) {
    return {
      provider: entity.provider as any,
      requestData: entity.requestData,
      responseData: entity.responseData || undefined,
      leadId: entity.leadId,
      companyId: entity.companyId,
    };
  }

  static toPrismaUpdate(entity: EnrichmentRequestEntity) {
    return {
      provider: entity.provider as any,
      requestData: entity.requestData,
      responseData: entity.responseData || undefined,
    };
  }
} 