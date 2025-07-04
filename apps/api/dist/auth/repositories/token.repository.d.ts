import { PrismaService } from '../../prisma/prisma.service';
import { EmailVerificationResponseDto, CreateEmailVerificationDto, PasswordResetResponseDto, CreatePasswordResetDto, TokenWithUserDto } from '../dtos/token.dto';
export declare class TokenRepository {
    private prisma;
    constructor(prisma: PrismaService);
    createEmailVerification(data: CreateEmailVerificationDto): Promise<EmailVerificationResponseDto>;
    findEmailVerification(token: string): Promise<EmailVerificationResponseDto | null>;
    findEmailVerificationWithUser(token: string): Promise<TokenWithUserDto | null>;
    deleteEmailVerification(token: string): Promise<void>;
    createPasswordReset(data: CreatePasswordResetDto): Promise<PasswordResetResponseDto>;
    findPasswordReset(token: string): Promise<PasswordResetResponseDto | null>;
    findPasswordResetWithUser(token: string): Promise<TokenWithUserDto | null>;
    markPasswordResetUsed(token: string): Promise<void>;
}
