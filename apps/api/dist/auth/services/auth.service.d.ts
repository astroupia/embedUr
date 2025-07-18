import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';
import { TokenRepository } from '../repositories/token.repository';
import { MailService } from './mail.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
export declare class AuthService {
    private userRepository;
    private sessionRepository;
    private tokenRepository;
    private mailService;
    private jwtService;
    private refreshJwtService;
    constructor(userRepository: UserRepository, sessionRepository: SessionRepository, tokenRepository: TokenRepository, mailService: MailService, jwtService: JwtService, refreshJwtService: JwtService);
    register(registerDto: RegisterDto, req: Request): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            companyId: string;
        };
    }>;
    login(loginDto: LoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("generated/prisma").$Enums.UserRole;
            companyId: string;
        };
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private generateAccessToken;
    private generateRefreshToken;
}
