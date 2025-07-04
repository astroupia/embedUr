import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CompanyResponseDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from '../dtos/company.dto';

@Injectable()
export class CompanyRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<CompanyResponseDto | null> {
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

  async findByName(name: string): Promise<CompanyResponseDto | null> {
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

  async create(data: CreateCompanyDto): Promise<CompanyResponseDto> {
    const companyData = {
      ...data,
      schemaName:
        data.schemaName || data.name.replace(/\s/g, '_').toLowerCase(),
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

  async update(
    id: string,
    data: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
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
}
