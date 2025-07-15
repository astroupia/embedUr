import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrichmentRequestEntity } from '../entities/enrichment-request.entity';
import { EnrichmentMapper } from '../mappers/enrichment.mapper';
import { QueryEnrichmentCursorDto } from '../dto/query-enrichment-cursor.dto';
import { EnrichmentProvider, EnrichmentStatus } from '../constants/enrichment.constants';

@Injectable()
export class EnrichmentRepository {
  private readonly logger = new Logger(EnrichmentRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(entity: EnrichmentRequestEntity): Promise<EnrichmentRequestEntity> {
    this.logger.log(`Creating enrichment request for lead ${entity.leadId}`);

    const prismaData = EnrichmentMapper.toPrismaCreate(entity);
    const created = await this.prisma.enrichmentRequest.create({
      data: prismaData,
    });

    this.logger.log(`Enrichment request created: ${created.id}`);
    return EnrichmentMapper.toEntity(created);
  }

  async findOne(id: string, companyId: string): Promise<EnrichmentRequestEntity> {
    this.logger.log(`Finding enrichment request ${id} for company ${companyId}`);

    const enrichment = await this.prisma.enrichmentRequest.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!enrichment) {
      throw new Error('Enrichment request not found');
    }

    return EnrichmentMapper.toEntity(enrichment);
  }

  async findWithCursor(
    companyId: string,
    query: QueryEnrichmentCursorDto,
  ): Promise<{ data: EnrichmentRequestEntity[]; nextCursor: string | null }> {
    this.logger.log(`Finding enrichment requests for company ${companyId} with cursor: ${query.cursor}`);

    const { cursor, limit, sortBy, sortOrder, leadId, provider, status } = query;

    // Build where clause
    const where: any = { companyId };
    if (leadId) where.leadId = leadId;
    if (provider) where.provider = provider;
    if (status) where.status = status;

    // Build cursor condition
    let cursorCondition = {};
    if (cursor && sortBy) {
      cursorCondition = {
        [sortBy as string]: sortOrder === 'desc' ? { lt: cursor } : { gt: cursor },
      };
    }

    const enrichments = await this.prisma.enrichmentRequest.findMany({
      where: { ...where, ...cursorCondition },
      take: (limit || 20) + 1, // Take one extra to determine if there's a next page
      orderBy: {
        [sortBy as string]: sortOrder,
      },
    });

    const hasNextPage = enrichments.length > (limit || 20);
    const data = enrichments.slice(0, limit || 20);
    const nextCursor = hasNextPage ? data[data.length - 1]?.id : null;

    return {
      data: EnrichmentMapper.toEntityList(data),
      nextCursor,
    };
  }

  async findByLead(leadId: string, companyId: string): Promise<EnrichmentRequestEntity[]> {
    this.logger.log(`Finding enrichment requests for lead ${leadId} in company ${companyId}`);

    const enrichments = await this.prisma.enrichmentRequest.findMany({
      where: {
        leadId,
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return EnrichmentMapper.toEntityList(enrichments);
  }

  async findByProvider(
    provider: EnrichmentProvider,
    companyId: string,
  ): Promise<EnrichmentRequestEntity[]> {
    this.logger.log(`Finding enrichment requests for provider ${provider} in company ${companyId}`);

    const enrichments = await this.prisma.enrichmentRequest.findMany({
      where: {
        provider: provider as any,
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return EnrichmentMapper.toEntityList(enrichments);
  }

  async findByStatus(
    status: EnrichmentStatus,
    companyId: string,
  ): Promise<EnrichmentRequestEntity[]> {
    this.logger.log(`Finding enrichment requests with status ${status} in company ${companyId}`);

    const enrichments = await this.prisma.enrichmentRequest.findMany({
      where: {
        status: status as any,
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return EnrichmentMapper.toEntityList(enrichments);
  }

  async update(id: string, companyId: string, entity: EnrichmentRequestEntity): Promise<EnrichmentRequestEntity> {
    this.logger.log(`Updating enrichment request ${id} for company ${companyId}`);

    const prismaData = EnrichmentMapper.toPrismaUpdate(entity);
    const updated = await this.prisma.enrichmentRequest.updateMany({
      where: {
        id,
        companyId,
      },
      data: prismaData,
    });

    if (updated.count === 0) {
      throw new Error('Enrichment request not found');
    }

    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    this.logger.log(`Removing enrichment request ${id} for company ${companyId}`);

    const deleted = await this.prisma.enrichmentRequest.deleteMany({
      where: {
        id,
        companyId,
      },
    });

    if (deleted.count === 0) {
      throw new Error('Enrichment request not found');
    }
  }

  async countByCompany(companyId: string): Promise<number> {
    return this.prisma.enrichmentRequest.count({
      where: { companyId },
    });
  }

  async countByProvider(provider: EnrichmentProvider, companyId: string): Promise<number> {
    return this.prisma.enrichmentRequest.count({
      where: {
        provider: provider as any,
        companyId,
      },
    });
  }

  async countByStatus(status: EnrichmentStatus, companyId: string): Promise<number> {
    return this.prisma.enrichmentRequest.count({
      where: {
        status: status as any,
        companyId,
      },
    });
  }

  async findActiveEnrichment(leadId: string, companyId: string): Promise<EnrichmentRequestEntity | null> {
    this.logger.log(`Finding active enrichment for lead ${leadId} in company ${companyId}`);

    const activeStatuses = [EnrichmentStatus.PENDING, EnrichmentStatus.IN_PROGRESS];
    
    const enrichment = await this.prisma.enrichmentRequest.findFirst({
      where: {
        leadId,
        companyId,
        status: {
          in: activeStatuses as any,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return enrichment ? EnrichmentMapper.toEntity(enrichment) : null;
  }

  async getStats(companyId: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    byProvider: Record<EnrichmentProvider, { total: number; successful: number; failed: number }>;
    averageDurationSeconds: number;
  }> {
    this.logger.log(`Getting enrichment stats for company ${companyId}`);

    const [
      total,
      successful,
      failed,
      pending,
      apolloStats,
      dropContactStats,
      clearbitStats,
      n8nStats,
      averageDuration,
    ] = await Promise.all([
      this.countByCompany(companyId),
      this.countByStatus(EnrichmentStatus.SUCCESS, companyId),
      this.countByStatus(EnrichmentStatus.FAILED, companyId),
      this.countByStatus(EnrichmentStatus.PENDING, companyId),
      this.getProviderStats(EnrichmentProvider.APOLLO, companyId),
      this.getProviderStats(EnrichmentProvider.DROP_CONTACT, companyId),
      this.getProviderStats(EnrichmentProvider.CLEARBIT, companyId),
      this.getProviderStats(EnrichmentProvider.N8N, companyId),
      this.getAverageDuration(companyId),
    ]);

    return {
      total,
      successful,
      failed,
      pending,
      byProvider: {
        [EnrichmentProvider.APOLLO]: apolloStats,
        [EnrichmentProvider.DROP_CONTACT]: dropContactStats,
        [EnrichmentProvider.CLEARBIT]: clearbitStats,
        [EnrichmentProvider.N8N]: n8nStats,
      },
      averageDurationSeconds: averageDuration,
    };
  }

  private async getProviderStats(
    provider: EnrichmentProvider,
    companyId: string,
  ): Promise<{ total: number; successful: number; failed: number }> {
    const [total, successful, failed] = await Promise.all([
      this.countByProvider(provider, companyId),
      this.prisma.enrichmentRequest.count({
        where: {
          provider: provider as any,
          companyId,
          status: EnrichmentStatus.SUCCESS as any,
        },
      }),
      this.prisma.enrichmentRequest.count({
        where: {
          provider: provider as any,
          companyId,
          status: EnrichmentStatus.FAILED as any,
        },
      }),
    ]);

    return { total, successful, failed };
  }

  private async getAverageDuration(companyId: string): Promise<number> {
    // TODO: Implement actual average duration calculation
    return 0;
  }

  async findLeadById(leadId: string, companyId: string): Promise<any> {
    this.logger.log(`Finding lead ${leadId} for company ${companyId}`);

    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    return lead;
  }

  async updateLeadEnrichmentData(leadId: string, companyId: string, enrichmentData: Record<string, any>): Promise<void> {
    this.logger.log(`Updating enrichment data for lead ${leadId}`);

    await this.prisma.lead.updateMany({
      where: { id: leadId, companyId },
      data: { enrichmentData },
    });
  }

  async findEnrichmentRequestByLead(leadId: string, companyId: string): Promise<EnrichmentRequestEntity | null> {
    this.logger.log(`Finding enrichment request for lead ${leadId} in company ${companyId}`);

    const enrichment = await this.prisma.enrichmentRequest.findFirst({
      where: {
        leadId,
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return enrichment ? EnrichmentMapper.toEntity(enrichment) : null;
  }

  async updateEnrichmentRequestStatus(
    id: string, 
    companyId: string, 
    status: string, 
    responseData?: Record<string, any>,
    errorMessage?: string
  ): Promise<void> {
    this.logger.log(`Updating enrichment request ${id} status to ${status}`);

    const updateData: any = { status };
    if (responseData) updateData.responseData = responseData;
    if (errorMessage) updateData.errorMessage = errorMessage;

    await this.prisma.enrichmentRequest.updateMany({
      where: { id, companyId },
      data: updateData,
    });
  }

  async createAuditTrail(
    entityId: string, 
    action: string, 
    changes: Record<string, any>, 
    companyId: string,
    performedById?: string
  ): Promise<void> {
    this.logger.log(`Creating audit trail for ${action} on entity ${entityId}`);

    await this.prisma.auditTrail.create({
      data: {
        entity: 'Enrichment',
        entityId,
        action,
        changes,
        companyId,
        performedById,
      },
    });
  }
} 