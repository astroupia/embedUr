import type { Lead as PrismaLead } from '../../../generated/prisma';
import { LeadEntity } from '../entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto } from '../dtos/lead.dto';
export declare class LeadMapper {
    static toEntity(prisma: PrismaLead & {
        campaign?: {
            id: string;
            name: string;
            aiPersona?: {
                id: string;
                name: string;
                description: string | null;
                prompt: string;
                parameters: any;
            } | null;
        } | null;
    }): LeadEntity;
    static toPrismaCreate(dto: CreateLeadDto, companyId: string): any;
    static toPrismaUpdate(dto: UpdateLeadDto): any;
}
