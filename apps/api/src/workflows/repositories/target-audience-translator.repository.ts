import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TargetAudienceTranslatorEntity, GeneratedLead, EnrichmentSchema, InterpretedCriteria } from '../entities/target-audience-translator.entity';
import { InputFormat } from '../dto/target-audience-translator.dto';
import { QueryTargetAudienceTranslatorCursorDto } from '../dto/target-audience-translator.dto';

@Injectable()
export class TargetAudienceTranslatorRepository {
  private readonly logger = new Logger(TargetAudienceTranslatorRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(entity: TargetAudienceTranslatorEntity): Promise<TargetAudienceTranslatorEntity> {
    this.logger.log(`Creating target audience translator for company ${entity.companyId}`);

    const created = await this.prisma.targetAudienceTranslator.create({
      data: {
        inputFormat: entity.inputFormat,
        targetAudienceData: entity.targetAudienceData,
        structuredData: entity.structuredData as any || undefined,
        config: entity.config as any || undefined,
        leads: entity.leads as any || undefined,
        enrichmentSchema: entity.enrichmentSchema as any || undefined,
        interpretedCriteria: entity.interpretedCriteria as any || undefined,
        reasoning: entity.reasoning,
        confidence: entity.confidence,
        status: entity.status,
        errorMessage: entity.errorMessage,
        companyId: entity.companyId,
        createdBy: entity.createdBy,
      },
    });

    return this.mapToEntity(created);
  }

  async findOne(id: string, companyId: string): Promise<TargetAudienceTranslatorEntity | null> {
    this.logger.log(`Finding target audience translator ${id} for company ${companyId}`);

    const found = await this.prisma.targetAudienceTranslator.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!found) {
      return null;
    }

    return this.mapToEntity(found);
  }

  async update(id: string, companyId: string, entity: Partial<TargetAudienceTranslatorEntity>): Promise<TargetAudienceTranslatorEntity> {
    this.logger.log(`Updating target audience translator ${id} for company ${companyId}`);

    const updated = await this.prisma.targetAudienceTranslator.update({
      where: {
        id,
        companyId,
      },
      data: {
        leads: entity.leads as any || undefined,
        enrichmentSchema: entity.enrichmentSchema as any || undefined,
        interpretedCriteria: entity.interpretedCriteria as any || undefined,
        reasoning: entity.reasoning,
        confidence: entity.confidence,
        status: entity.status,
        errorMessage: entity.errorMessage,
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(updated);
  }

  async findWithCursor(
    companyId: string,
    query: QueryTargetAudienceTranslatorCursorDto,
  ): Promise<{ data: TargetAudienceTranslatorEntity[]; nextCursor: string | null }> {
    this.logger.log(`Finding target audience translators for company ${companyId} with cursor: ${query.cursor}`);

    const take = Math.min(query.take || 20, 100);
    const skip = query.cursor ? 1 : 0;
    const cursor = query.cursor ? { id: query.cursor } : undefined;

    const where: any = {
      companyId,
    };

    if (query.search) {
      where.OR = [
        { targetAudienceData: { contains: query.search, mode: 'insensitive' } },
        { reasoning: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.inputFormat) {
      where.inputFormat = query.inputFormat;
    }

    const [data, total] = await Promise.all([
      this.prisma.targetAudienceTranslator.findMany({
        where,
        take,
        skip,
        cursor,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.targetAudienceTranslator.count({ where }),
    ]);

    const nextCursor = data.length === take && data.length < total ? data[data.length - 1].id : null;

    return {
      data: data.map(item => this.mapToEntity(item)),
      nextCursor,
    };
  }

  async findByStatus(status: string, companyId: string): Promise<TargetAudienceTranslatorEntity[]> {
    this.logger.log(`Finding target audience translators with status ${status} for company ${companyId}`);

    const found = await this.prisma.targetAudienceTranslator.findMany({
      where: {
        status,
        companyId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return found.map(item => this.mapToEntity(item));
  }

  async findByInputFormat(inputFormat: InputFormat, companyId: string): Promise<TargetAudienceTranslatorEntity[]> {
    this.logger.log(`Finding target audience translators with input format ${inputFormat} for company ${companyId}`);

    const found = await this.prisma.targetAudienceTranslator.findMany({
      where: {
        inputFormat,
        companyId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return found.map(item => this.mapToEntity(item));
  }

  async countByCompany(companyId: string): Promise<number> {
    return this.prisma.targetAudienceTranslator.count({
      where: { companyId },
    });
  }

  async countByStatus(status: string, companyId: string): Promise<number> {
    return this.prisma.targetAudienceTranslator.count({
      where: { status, companyId },
    });
  }

  async countByInputFormat(inputFormat: InputFormat, companyId: string): Promise<number> {
    return this.prisma.targetAudienceTranslator.count({
      where: { inputFormat, companyId },
    });
  }

  async getStats(companyId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byInputFormat: Record<InputFormat, number>;
    successful: number;
    failed: number;
    pending: number;
  }> {
    this.logger.log(`Getting target audience translator stats for company ${companyId}`);

    const [
      total,
      byStatus,
      byInputFormat,
      successful,
      failed,
      pending,
    ] = await Promise.all([
      this.countByCompany(companyId),
      this.getStatusStats(companyId),
      this.getInputFormatStats(companyId),
      this.countByStatus('SUCCESS', companyId),
      this.countByStatus('FAILED', companyId),
      this.countByStatus('PENDING', companyId),
    ]);

    return {
      total,
      byStatus,
      byInputFormat,
      successful,
      failed,
      pending,
    };
  }

  private async getStatusStats(companyId: string): Promise<Record<string, number>> {
    const stats = await this.prisma.targetAudienceTranslator.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { status: true },
    });

    const result: Record<string, number> = {};
    stats.forEach(stat => {
      result[stat.status] = stat._count.status;
    });

    return result;
  }

  private async getInputFormatStats(companyId: string): Promise<Record<InputFormat, number>> {
    const stats = await this.prisma.targetAudienceTranslator.groupBy({
      by: ['inputFormat'],
      where: { companyId },
      _count: { inputFormat: true },
    });

    const result: Record<InputFormat, number> = {
      [InputFormat.FREE_TEXT]: 0,
      [InputFormat.STRUCTURED_JSON]: 0,
      [InputFormat.CSV_UPLOAD]: 0,
      [InputFormat.FORM_INPUT]: 0,
    };

    stats.forEach(stat => {
      result[stat.inputFormat as InputFormat] = stat._count.inputFormat;
    });

    return result;
  }

  private mapToEntity(prismaData: any): TargetAudienceTranslatorEntity {
    return new TargetAudienceTranslatorEntity(
      prismaData.id,
      prismaData.inputFormat as InputFormat,
      prismaData.targetAudienceData,
      prismaData.structuredData,
      prismaData.config,
      prismaData.leads as GeneratedLead[],
      prismaData.enrichmentSchema as EnrichmentSchema,
      prismaData.interpretedCriteria as InterpretedCriteria,
      prismaData.reasoning,
      prismaData.confidence,
      prismaData.status,
      prismaData.errorMessage,
      prismaData.companyId,
      prismaData.createdBy,
      prismaData.createdAt,
      prismaData.updatedAt,
    );
  }
} 