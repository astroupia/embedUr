import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateEmailVerificationDto {
  @IsString()
  userId: string;

  @IsString()
  token: string;

  @IsDateString()
  expiresAt: Date;
}

export class EmailVerificationResponseDto {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class CreatePasswordResetDto {
  @IsString()
  userId: string;

  @IsString()
  token: string;

  @IsDateString()
  expiresAt: Date;
}

export class PasswordResetResponseDto {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export class TokenWithUserDto {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used?: boolean;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
