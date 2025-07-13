import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength, MinLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkflowType } from '../constants/workflow.constants';

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Workflow name', minLength: 1, maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Workflow type', enum: WorkflowType })
  @IsNotEmpty()
  @IsEnum(WorkflowType)
  type: WorkflowType;

  @ApiProperty({ description: 'N8N workflow ID for external automation reference' })
  @IsNotEmpty()
  @IsString()
  n8nWorkflowId: string;
}

export class UpdateWorkflowDto {
  @ApiPropertyOptional({ description: 'Workflow name', minLength: 1, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'N8N workflow ID for external automation reference' })
  @IsOptional()
  @IsString()
  n8nWorkflowId?: string;
}

export class ExecuteWorkflowDto {
  @ApiProperty({ 
    description: 'Input data for workflow execution', 
    type: 'object',
    additionalProperties: true
  })
  @IsNotEmpty()
  @IsObject()
  inputData: Record<string, any>;

  @ApiPropertyOptional({ description: 'Lead ID if execution is related to a specific lead' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ description: 'Campaign ID if execution is related to a specific campaign' })
  @IsOptional()
  @IsString()
  campaignId?: string;
}

export class RetryExecutionDto {
  @ApiPropertyOptional({ 
    description: 'Updated input data for retry', 
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  inputData?: Record<string, any>;
} 