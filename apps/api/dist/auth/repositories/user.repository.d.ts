import { PrismaService } from '../../prisma/prisma.service';
import { UserResponseDto, UserWithCompanyDto, CreateUserDto, UpdateUserDto, CreateUserWithCompanyDto } from '../dtos/user.dto';
import { CompanyResponseDto } from '../dtos/company.dto';
export declare class UserRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<UserResponseDto | null>;
    findById(id: string): Promise<UserResponseDto | null>;
    createWithCompany(data: CreateUserWithCompanyDto): Promise<{
        user: UserResponseDto;
        company: CompanyResponseDto;
    }>;
    updatePassword(id: string, password: string): Promise<UserResponseDto>;
    create(data: CreateUserDto): Promise<UserResponseDto>;
    update(id: string, data: UpdateUserDto): Promise<UserResponseDto>;
    findByIdWithCompany(id: string): Promise<UserWithCompanyDto | null>;
}
