import { PrismaService } from '../../prisma/prisma.service';
import { LeadEntity } from '../entities/lead.entity';
import { QueryLeadsCursorDto } from '../dtos/query-leads-cursor.dto';
import { CreateLeadDto, UpdateLeadDto } from '../dtos/lead.dto';
import { $Enums } from '../../../generated/prisma';
export declare class LeadRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateLeadDto, companyId: string): Promise<LeadEntity>;
    findWithCursor(companyId: string, query: QueryLeadsCursorDto): Promise<{
        data: LeadEntity[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<LeadEntity>;
    update(id: string, companyId: string, dto: UpdateLeadDto): Promise<LeadEntity>;
    remove(id: string, companyId: string): Promise<void>;
    findByEmail(email: string, companyId: string): Promise<LeadEntity | null>;
    findByStatus(status: $Enums.LeadStatus, companyId: string): Promise<LeadEntity[]>;
    countByCompany(companyId: string): Promise<number>;
    countByStatus(status: $Enums.LeadStatus, companyId: string): Promise<number>;
    findOneWithCampaign(id: string, companyId: string): Promise<LeadEntity>;
    findOneWithEnrichmentData(id: string, companyId: string): Promise<LeadEntity>;
    updateEnrichmentData(id: string, companyId: string, enrichmentData: Record<string, any>, additionalFields?: Record<string, any>): Promise<LeadEntity>;
    updateStatus(id: string, companyId: string, status: $Enums.LeadStatus): Promise<LeadEntity>;
    createAuditTrail(entityId: string, action: string, changes: Record<string, any>, companyId: string, performedById?: string): Promise<void>;
    createEnrichmentRequest(leadId: string, data: {
        provider: string;
        requestData: Record<string, any>;
        companyId: string;
    }): Promise<void>;
    createEmailLog(leadId: string, data: {
        status: string;
        campaignId: string;
        companyId: string;
        metadata?: Record<string, any>;
    }): Promise<void>;
    createSystemNotification(message: string, level: string, companyId: string): Promise<void>;
    findOneWithCampaignAndAiPersona(id: string, companyId: string): Promise<LeadEntity>;
}
