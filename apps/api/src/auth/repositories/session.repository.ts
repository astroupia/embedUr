import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SessionResponseDto,
  CreateSessionDto,
  SessionWithUserDto,
} from '../dtos/session.dto';

@Injectable()
export class SessionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSessionDto): Promise<SessionResponseDto> {
    const session = await this.prisma.session.create({
      data,
      select: {
        id: true,
        userId: true,
        refreshToken: true,
        ip: true,
        userAgent: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return session;
  }

  async findByRefreshToken(
    refreshToken: string,
  ): Promise<SessionResponseDto | null> {
    const session = await this.prisma.session.findFirst({
      where: { refreshToken, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userId: true,
        refreshToken: true,
        ip: true,
        userAgent: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return session;
  }

  async findByRefreshTokenWithUser(
    refreshToken: string,
  ): Promise<SessionWithUserDto | null> {
    const session = await this.prisma.session.findFirst({
      where: { refreshToken, expiresAt: { gt: new Date() } },
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
    return session as SessionWithUserDto;
  }

  async deleteByRefreshToken(refreshToken: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
