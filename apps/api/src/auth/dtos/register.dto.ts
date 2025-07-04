import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  companyName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;
}
