import { LeadService } from '../services/lead.service';
import { CreateLeadDto, UpdateLeadDto } from '../dtos/lead.dto';
import { QueryLeadsCursorDto } from '../dtos/query-leads-cursor.dto';
import { LeadStatus } from '../constants/lead.constants';
import { LeadResponseDto } from '../dtos/lead-response.dto';
interface CurrentUserPayload {
    userId: string;
    companyId: string;
    role: string;
}
export declare class LeadController {
    private readonly leadService;
    constructor(leadService: LeadService);
    create(createLeadDto: CreateLeadDto, user: CurrentUserPayload): Promise<LeadResponseDto>;
    findAll(query: QueryLeadsCursorDto, user: CurrentUserPayload): Promise<{
        data: LeadResponseDto[];
        nextCursor: string | null;
    }>;
    getStats(user: CurrentUserPayload): Promise<{
        total: number;
        byStatus: Record<LeadStatus, number>;
    }>;
    findByStatus(status: LeadStatus, user: CurrentUserPayload): Promise<LeadResponseDto[]>;
    findOne(id: string, user: CurrentUserPayload): Promise<LeadResponseDto>;
    update(id: string, updateLeadDto: UpdateLeadDto, user: CurrentUserPayload): Promise<LeadResponseDto>;
    remove(id: string, user: CurrentUserPayload): Promise<void>;
    triggerEnrichment(id: string, user: CurrentUserPayload): Promise<LeadResponseDto>;
}
export {};
