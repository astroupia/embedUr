import { IsString, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  userId: string;

  @IsString()
  refreshToken: string;

  @IsString()
  ip: string;

  @IsString()
  userAgent: string;

  @IsDateString()
  expiresAt: Date;
}

export class SessionResponseDto {
  id: string;
  userId: string;
  refreshToken: string;
  ip: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
}

export class SessionWithUserDto extends SessionResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
