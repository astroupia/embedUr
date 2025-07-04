import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto/users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
        email: string;
        name: string | null;
        companyId: string;
        role: import("generated/prisma").$Enums.UserRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: QueryUsersDto): Promise<{
        data: {
            email: string;
            name: string | null;
            companyId: string;
            role: import("generated/prisma").$Enums.UserRole;
            id: string;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        perPage: number;
    }>;
    me(user: any): any;
    findOne(id: string): Promise<{
        email: string;
        name: string | null;
        companyId: string;
        role: import("generated/prisma").$Enums.UserRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        email: string;
        name: string | null;
        role: import("generated/prisma").$Enums.UserRole;
        id: string;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        email: string;
        password: string;
        name: string | null;
        companyId: string;
        role: import("generated/prisma").$Enums.UserRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
