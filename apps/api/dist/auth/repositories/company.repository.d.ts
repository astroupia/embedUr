import { PrismaService } from '../../prisma/prisma.service';
import { CompanyResponseDto, CreateCompanyDto, UpdateCompanyDto } from '../dtos/company.dto';
export declare class CompanyRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<CompanyResponseDto | null>;
    findByName(name: string): Promise<CompanyResponseDto | null>;
    create(data: CreateCompanyDto): Promise<CompanyResponseDto>;
    update(id: string, data: UpdateCompanyDto): Promise<CompanyResponseDto>;
}
