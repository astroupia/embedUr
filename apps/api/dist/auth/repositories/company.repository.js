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
exports.CompanyRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CompanyRepository = class CompanyRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const company = await this.prisma.company.findUnique({
            where: { id },
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
        return company;
    }
    async findByName(name) {
        const company = await this.prisma.company.findUnique({
            where: { name },
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
        return company;
    }
    async create(data) {
        const companyData = {
            ...data,
            schemaName: data.schemaName || data.name.replace(/\s/g, '_').toLowerCase(),
        };
        const company = await this.prisma.company.create({
            data: companyData,
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
        return company;
    }
    async update(id, data) {
        const company = await this.prisma.company.update({
            where: { id },
            data,
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
        return company;
    }
};
exports.CompanyRepository = CompanyRepository;
exports.CompanyRepository = CompanyRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyRepository);
//# sourceMappingURL=company.repository.js.map