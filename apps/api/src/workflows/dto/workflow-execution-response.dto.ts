import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkflowExecutionStatus } from '../constants/workflow.constants';

export class WorkflowExecutionResponseDto {
  @ApiProperty({ description: 'Workflow execution ID' })
  id: string;

  @ApiProperty({ description: 'Execution status', enum: WorkflowExecutionStatus })
  status: WorkflowExecutionStatus;

  @ApiProperty({ description: 'User ID who triggered the execution' })
  triggeredBy: string;

  @ApiProperty({ description: 'Execution start time' })
  startTime: Date;

  @ApiPropertyOptional({ description: 'Execution end time' })
  endTime: Date | null;

  @ApiPropertyOptional({ description: 'Input data for the execution' })
  inputData: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Output data from the execution' })
  outputData: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Execution duration in milliseconds' })
  durationMs: number | null;

  @ApiPropertyOptional({ description: 'Lead ID if execution is related to a specific lead' })
  leadId: string | null;

  @ApiProperty({ description: 'Workflow ID' })
  workflowId: string;

  @ApiProperty({ description: 'Company ID' })
  companyId: string;

  @ApiPropertyOptional({ description: 'Error message if execution failed' })
  errorMessage?: string;

  // Business logic properties
  @ApiProperty({ description: 'Whether the execution is completed' })
  isCompleted: boolean;

  @ApiProperty({ description: 'Whether the execution is currently running' })
  isRunning: boolean;

  @ApiProperty({ description: 'Whether the execution was successful' })
  isSuccessful: boolean;

  @ApiProperty({ description: 'Whether the execution failed' })
  isFailed: boolean;

  @ApiPropertyOptional({ description: 'Execution duration in seconds' })
  durationSeconds: number | null;

  @ApiProperty({ description: 'Whether the execution has an error' })
  hasError: boolean;

  @ApiProperty({ description: 'Human-readable execution time' })
  executionTime: string;

  @ApiProperty({ description: 'Whether the execution can be retried' })
  canBeRetried: boolean;
} 