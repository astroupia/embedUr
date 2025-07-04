"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const user_repository_1 = require("../repositories/user.repository");
const session_repository_1 = require("../repositories/session.repository");
const token_repository_1 = require("../repositories/token.repository");
const mail_service_1 = require("./mail.service");
let AuthService = class AuthService {
    userRepository;
    sessionRepository;
    tokenRepository;
    mailService;
    jwtService;
    constructor(userRepository, sessionRepository, tokenRepository, mailService, jwtService) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.tokenRepository = tokenRepository;
        this.mailService = mailService;
        this.jwtService = jwtService;
    }
    async register(registerDto, req) {
        const { email, password, companyName, firstName, lastName } = registerDto;
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const { user, company } = await this.userRepository.createWithCompany({
            email,
            password: hashedPassword,
            companyName,
            firstName: firstName || '',
            lastName: lastName || '',
        });
        const verificationToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.tokenRepository.createEmailVerification({
            userId: user.id,
            token: verificationToken,
            expiresAt,
        });
        await this.mailService.sendVerification(email, verificationToken);
        return {
            message: 'User registered successfully. Please check your email to verify your account.',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                companyId: user.companyId,
            },
        };
    }
    async login(loginDto, req) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.sessionRepository.create({
            userId: user.id,
            refreshToken,
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            expiresAt,
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                companyId: user.companyId,
            },
        };
    }
    async refresh(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        const session = await this.sessionRepository.findByRefreshToken(refreshToken);
        if (!session) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.userRepository.findById(session.userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const newAccessToken = this.generateAccessToken(user);
        const newRefreshToken = this.generateRefreshToken(user);
        await this.sessionRepository.deleteByRefreshToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.sessionRepository.create({
            userId: user.id,
            refreshToken: newRefreshToken,
            ip: session.ip,
            userAgent: session.userAgent,
            expiresAt,
        });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(refreshToken) {
        await this.sessionRepository.deleteByRefreshToken(refreshToken);
        return { message: 'Logged out successfully' };
    }
    async verifyEmail(verifyEmailDto) {
        const { token } = verifyEmailDto;
        const verification = await this.tokenRepository.findEmailVerification(token);
        if (!verification) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (verification.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Verification token has expired');
        }
        await this.tokenRepository.deleteEmailVerification(token);
        return { message: 'Email verified successfully' };
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return {
                message: 'If an account with this email exists, a password reset link has been sent.',
            };
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.tokenRepository.createPasswordReset({
            userId: user.id,
            token: resetToken,
            expiresAt,
        });
        await this.mailService.sendPasswordReset(email, resetToken);
        return {
            message: 'If an account with this email exists, a password reset link has been sent.',
        };
    }
    async resetPassword(resetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        const reset = await this.tokenRepository.findPasswordReset(token);
        if (!reset) {
            throw new common_1.BadRequestException('Invalid reset token');
        }
        if (reset.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Reset token has expired');
        }
        if (reset.used) {
            throw new common_1.BadRequestException('Reset token has already been used');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await this.userRepository.updatePassword(reset.userId, hashedPassword);
        await this.tokenRepository.markPasswordResetUsed(token);
        await this.sessionRepository.deleteByUserId(reset.userId);
        return { message: 'Password reset successfully' };
    }
    generateAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
        };
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET || 'access-secret',
            expiresIn: '15m',
        });
    }
    generateRefreshToken(user) {
        const payload = {
            sub: user.id,
            type: 'refresh',
        };
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
            expiresIn: '7d',
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        session_repository_1.SessionRepository,
        token_repository_1.TokenRepository,
        mail_service_1.MailService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map