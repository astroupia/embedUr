import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, email: true, name: true, role: true, companyId: true, createdAt: true, updatedAt: true },
    });
  }

 async findAll(query: QueryUsersDto) {
  const {
    page = 1,
    perPage = 10,
    search,
  } = query; // default values here

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


  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, companyId: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
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

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
