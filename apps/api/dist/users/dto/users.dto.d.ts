export declare class CreateUserDto {
    email: string;
    password: string;
    name?: string;
    companyId: string;
    role?: 'ADMIN' | 'MEMBER' | 'READ_ONLY';
}
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    role?: 'ADMIN' | 'MEMBER' | 'READ_ONLY';
}
export declare class QueryUsersDto {
    page?: number;
    perPage?: number;
    search?: string;
}
