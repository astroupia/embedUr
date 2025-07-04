export declare class CreateSessionDto {
    userId: string;
    refreshToken: string;
    ip: string;
    userAgent: string;
    expiresAt: Date;
}
export declare class SessionResponseDto {
    id: string;
    userId: string;
    refreshToken: string;
    ip: string;
    userAgent: string;
    expiresAt: Date;
    createdAt: Date;
}
export declare class SessionWithUserDto extends SessionResponseDto {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}
