import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { $Enums } from '../../../generated/prisma';
import { CompanyResponseDto } from './company.dto';

type UserRole = $Enums.UserRole;

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum($Enums.UserRole)
  role?: UserRole;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  profileUrl?: string;

  @IsOptional()
  @IsString()
  twitterUsername?: string;

  @IsOptional()
  @IsString()
  facebookUsername?: string;

  @IsOptional()
  @IsString()
  instagramUsername?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum($Enums.UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  profileUrl?: string;

  @IsOptional()
  @IsString()
  twitterUsername?: string;

  @IsOptional()
  @IsString()
  facebookUsername?: string;

  @IsOptional()
  @IsString()
  instagramUsername?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  password?: string;
  linkedinUrl?: string | null;
  profileUrl?: string | null;
  twitterUsername?: string | null;
  facebookUsername?: string | null;
  instagramUsername?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserWithCompanyDto extends UserResponseDto {
  company: CompanyResponseDto;
}

export class CreateUserWithCompanyDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password: string;

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
