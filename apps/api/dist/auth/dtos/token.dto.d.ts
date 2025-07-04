export declare class CreateEmailVerificationDto {
    userId: string;
    token: string;
    expiresAt: Date;
}
export declare class EmailVerificationResponseDto {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
export declare class CreatePasswordResetDto {
    userId: string;
    token: string;
    expiresAt: Date;
}
export declare class PasswordResetResponseDto {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}
export declare class TokenWithUserDto {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    used?: boolean;
    createdAt: Date;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}
