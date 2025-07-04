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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UserRepository = class UserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
                password: true,
                linkedinUrl: true,
                profileUrl: true,
                twitterUsername: true,
                facebookUsername: true,
                instagramUsername: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
                password: true,
                linkedinUrl: true,
                profileUrl: true,
                twitterUsername: true,
                facebookUsername: true,
                instagramUsername: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async createWithCompany(data) {
        const result = await this.prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    name: data.companyName,
                    industry: data.industry || 'Technology',
                    employees: 1,
                    schemaName: data.companyName.replace(/\s/g, '_').toLowerCase(),
                    location: data.location,
                    website: data.website,
                },
                select: {
                    id: true,
                    name: true,
                    schemaName: true,
                    status: true,
                    planId: true,
                    industry: true,
                    location: true,
                    website: true,
                    description: true,
                    logoUrl: true,
                    bannerUrl: true,
                    employees: true,
                    revenue: true,
                    linkedinUsername: true,
                    twitterUsername: true,
                    facebookUsername: true,
                    instagramUsername: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: data.password,
                    companyId: company.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    companyId: true,
                    password: true,
                    linkedinUrl: true,
                    profileUrl: true,
                    twitterUsername: true,
                    facebookUsername: true,
                    instagramUsername: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return { user, company };
        });
        return result;
    }
    async updatePassword(id, password) {
        const user = await this.prisma.user.update({
            where: { id },
            data: { password },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
                linkedinUrl: true,
                profileUrl: true,
                twitterUsername: true,
                facebookUsername: true,
                instagramUsername: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async create(data) {
        const user = await this.prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
                password: true,
                linkedinUrl: true,
                profileUrl: true,
                twitterUsername: true,
                facebookUsername: true,
                instagramUsername: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async update(id, data) {
        const user = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
                password: true,
                linkedinUrl: true,
                profileUrl: true,
                twitterUsername: true,
                facebookUsername: true,
                instagramUsername: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async findByIdWithCompany(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        schemaName: true,
                        status: true,
                        planId: true,
                        industry: true,
                        location: true,
                        website: true,
                        description: true,
                        logoUrl: true,
                        bannerUrl: true,
                        employees: true,
                        revenue: true,
                        linkedinUsername: true,
                        twitterUsername: true,
                        facebookUsername: true,
                        instagramUsername: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        return user;
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserRepository);
//# sourceMappingURL=user.repository.js.map