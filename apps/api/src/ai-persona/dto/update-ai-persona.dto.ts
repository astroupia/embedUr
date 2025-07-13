import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateAIPersonaDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
} 