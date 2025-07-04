import { PrismaService } from '../../prisma/prisma.service';
import { SessionResponseDto, CreateSessionDto, SessionWithUserDto } from '../dtos/session.dto';
export declare class SessionRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateSessionDto): Promise<SessionResponseDto>;
    findByRefreshToken(refreshToken: string): Promise<SessionResponseDto | null>;
    findByRefreshTokenWithUser(refreshToken: string): Promise<SessionWithUserDto | null>;
    deleteByRefreshToken(refreshToken: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
    deleteExpired(): Promise<void>;
}
