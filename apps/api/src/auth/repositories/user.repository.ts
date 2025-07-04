import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../../../generated/prisma';
import {
  UserResponseDto,
  UserWithCompanyDto,
  CreateUserDto,
  UpdateUserDto,
  CreateUserWithCompanyDto,
} from '../dtos/user.dto';
import { CompanyResponseDto } from '../dtos/company.dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserResponseDto | null> {
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

  async findById(id: string): Promise<UserResponseDto | null> {
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

  async createWithCompany(
    data: CreateUserWithCompanyDto,
  ): Promise<{ user: UserResponseDto; company: CompanyResponseDto }> {
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

  async updatePassword(id: string, password: string): Promise<UserResponseDto> {
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

  async create(data: CreateUserDto): Promise<UserResponseDto> {
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

  async update(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
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

  async findByIdWithCompany(id: string): Promise<UserWithCompanyDto | null> {
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
    return user as UserWithCompanyDto;
  }
}
