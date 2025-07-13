import { PrismaService } from '../../prisma/prisma.service';
import { TargetAudienceTranslatorEntity } from '../entities/target-audience-translator.entity';
import { InputFormat } from '../dto/target-audience-translator.dto';
import { QueryTargetAudienceTranslatorCursorDto } from '../dto/target-audience-translator.dto';
export declare class TargetAudienceTranslatorRepository {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(entity: TargetAudienceTranslatorEntity): Promise<TargetAudienceTranslatorEntity>;
    findOne(id: string, companyId: string): Promise<TargetAudienceTranslatorEntity | null>;
    update(id: string, companyId: string, entity: Partial<TargetAudienceTranslatorEntity>): Promise<TargetAudienceTranslatorEntity>;
    findWithCursor(companyId: string, query: QueryTargetAudienceTranslatorCursorDto): Promise<{
        data: TargetAudienceTranslatorEntity[];
        nextCursor: string | null;
    }>;
    findByStatus(status: string, companyId: string): Promise<TargetAudienceTranslatorEntity[]>;
    findByInputFormat(inputFormat: InputFormat, companyId: string): Promise<TargetAudienceTranslatorEntity[]>;
    countByCompany(companyId: string): Promise<number>;
    countByStatus(status: string, companyId: string): Promise<number>;
    countByInputFormat(inputFormat: InputFormat, companyId: string): Promise<number>;
    getStats(companyId: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byInputFormat: Record<InputFormat, number>;
        successful: number;
        failed: number;
        pending: number;
    }>;
    private getStatusStats;
    private getInputFormatStats;
    private mapToEntity;
}
