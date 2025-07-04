import { $Enums } from '../../../generated/prisma';
import { CompanyResponseDto } from './company.dto';
type UserRole = $Enums.UserRole;
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: UserRole;
    companyId: string;
    linkedinUrl?: string;
    profileUrl?: string;
    twitterUsername?: string;
    facebookUsername?: string;
    instagramUsername?: string;
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    linkedinUrl?: string;
    profileUrl?: string;
    twitterUsername?: string;
    facebookUsername?: string;
    instagramUsername?: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    companyId: string;
    password?: string;
    linkedinUrl?: string | null;
    profileUrl?: string | null;
    twitterUsername?: string | null;
    facebookUsername?: string | null;
    instagramUsername?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserWithCompanyDto extends UserResponseDto {
    company: CompanyResponseDto;
}
export declare class CreateUserWithCompanyDto {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    companyName: string;
    industry?: string;
    location?: string;
    website?: string;
}
export {};
