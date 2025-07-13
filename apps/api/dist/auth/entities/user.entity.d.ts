import { UserRole } from '../../constants/enums';
export declare class UserEntity {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: UserRole;
    companyId: string;
    linkedinUrl?: string;
    profileUrl?: string;
    twitterUsername?: string;
    facebookUsername?: string;
    instagramUsername?: string;
    createdAt: Date;
    updatedAt: Date;
}
