import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { WorkflowType } from '../constants/workflow.constants';

export class QueryWorkflowsCursorDto {
  @ApiPropertyOptional({ description: 'ID of last seen workflow' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  take?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by workflow type', enum: WorkflowType })
  @IsOptional()
  @IsEnum(WorkflowType)
  type?: WorkflowType;

  @ApiPropertyOptional({ description: 'Search workflows by name' })
  @IsOptional()
  @IsString()
  search?: string;
} 