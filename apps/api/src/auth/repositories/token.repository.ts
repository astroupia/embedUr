import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EmailVerificationResponseDto,
  CreateEmailVerificationDto,
  PasswordResetResponseDto,
  CreatePasswordResetDto,
  TokenWithUserDto,
} from '../dtos/token.dto';

@Injectable()
export class TokenRepository {
  constructor(private prisma: PrismaService) {}

  // Email Verification
  async createEmailVerification(
    data: CreateEmailVerificationDto,
  ): Promise<EmailVerificationResponseDto> {
    const verification = await this.prisma.emailVerification.create({
      data,
      select: {
        id: true,
        userId: true,
        token: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return verification;
  }

  async findEmailVerification(
    token: string,
  ): Promise<EmailVerificationResponseDto | null> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      select: {
        id: true,
        userId: true,
        token: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return verification;
  }

  async findEmailVerificationWithUser(
    token: string,
  ): Promise<TokenWithUserDto | null> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return verification as TokenWithUserDto;
  }

  async deleteEmailVerification(token: string): Promise<void> {
    await this.prisma.emailVerification.deleteMany({ where: { token } });
  }

  // Password Reset
  async createPasswordReset(
    data: CreatePasswordResetDto,
  ): Promise<PasswordResetResponseDto> {
    const reset = await this.prisma.passwordReset.create({
      data,
      select: {
        id: true,
        userId: true,
        token: true,
        expiresAt: true,
        used: true,
        createdAt: true,
      },
    });
    return reset;
  }

  async findPasswordReset(
    token: string,
  ): Promise<PasswordResetResponseDto | null> {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token },
      select: {
        id: true,
        userId: true,
        token: true,
        expiresAt: true,
        used: true,
        createdAt: true,
      },
    });
    return reset;
  }

  async findPasswordResetWithUser(
    token: string,
  ): Promise<TokenWithUserDto | null> {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return reset as TokenWithUserDto;
  }

  async markPasswordResetUsed(token: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { token },
      data: { used: true },
    });
  }
}
