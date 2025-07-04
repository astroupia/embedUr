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
exports.SessionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SessionRepository = class SessionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
    async findByRefreshToken(refreshToken) {
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
    async findByRefreshTokenWithUser(refreshToken) {
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
        return session;
    }
    async deleteByRefreshToken(refreshToken) {
        await this.prisma.session.deleteMany({
            where: { refreshToken },
        });
    }
    async deleteByUserId(userId) {
        await this.prisma.session.deleteMany({
            where: { userId },
        });
    }
    async deleteExpired() {
        await this.prisma.session.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
    }
};
exports.SessionRepository = SessionRepository;
exports.SessionRepository = SessionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionRepository);
//# sourceMappingURL=session.repository.js.map