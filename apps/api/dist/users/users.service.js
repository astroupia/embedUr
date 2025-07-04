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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const hashed = await bcrypt.hash(dto.password, 12);
        return this.prisma.user.create({
            data: { ...dto, password: hashed },
            select: { id: true, email: true, name: true, role: true, companyId: true, createdAt: true, updatedAt: true },
        });
    }
    async findAll(query) {
        const { page = 1, perPage = 10, search, } = query;
        const where = search
            ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] }
            : {};
        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                select: { id: true, email: true, name: true, role: true, companyId: true, createdAt: true },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { data, total, page, perPage };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, role: true, companyId: true, createdAt: true, updatedAt: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(id, dto) {
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 12);
        }
        await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: { id: true, email: true, name: true, role: true, updatedAt: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.delete({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map