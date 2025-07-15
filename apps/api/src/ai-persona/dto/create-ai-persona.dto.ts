import { IsString, IsNotEmpty, IsOptional, IsObject, ValidateIf } from 'class-validator';

export class CreateAIPersonaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  @ValidateIf((o) => o.parameters !== undefined)
  @IsObject({ message: 'Parameters must be a valid object' })
  parameters?: Record<string, any>;
} 