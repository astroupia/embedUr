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
exports.TokenRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TokenRepository = class TokenRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createEmailVerification(data) {
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
    async findEmailVerification(token) {
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
    async findEmailVerificationWithUser(token) {
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
        return verification;
    }
    async deleteEmailVerification(token) {
        await this.prisma.emailVerification.deleteMany({ where: { token } });
    }
    async createPasswordReset(data) {
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
    async findPasswordReset(token) {
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
    async findPasswordResetWithUser(token) {
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
        return reset;
    }
    async markPasswordResetUsed(token) {
        await this.prisma.passwordReset.update({
            where: { token },
            data: { used: true },
        });
    }
};
exports.TokenRepository = TokenRepository;
exports.TokenRepository = TokenRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TokenRepository);
//# sourceMappingURL=token.repository.js.map