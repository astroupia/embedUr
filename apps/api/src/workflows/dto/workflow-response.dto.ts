import { ApiProperty } from '@nestjs/swagger';
import { WorkflowType } from '../constants/workflow.constants';

export interface WorkflowExecutionSummaryDto {
  id: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  triggeredBy: string;
}

export class WorkflowResponseDto {
  @ApiProperty({ description: 'Workflow ID' })
  id: string;

  @ApiProperty({ description: 'Workflow name' })
  name: string;

  @ApiProperty({ description: 'Workflow type', enum: WorkflowType })
  type: WorkflowType;

  @ApiProperty({ description: 'N8N workflow ID' })
  n8nWorkflowId: string;

  @ApiProperty({ description: 'Company ID' })
  companyId: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Number of executions' })
  executionCount: number;

  @ApiProperty({ description: 'Last execution summary', required: false })
  lastExecution?: WorkflowExecutionSummaryDto;

  // Business logic properties
  @ApiProperty({ description: 'Whether the workflow is active (has executions)' })
  isActive: boolean;

  @ApiProperty({ description: 'Human-readable type description' })
  typeDescription: string;

  @ApiProperty({ description: 'Whether the workflow can be deleted' })
  canBeDeleted: boolean;

  @ApiProperty({ description: 'Whether this is an enrichment workflow' })
  isEnrichmentWorkflow: boolean;

  @ApiProperty({ description: 'Whether this is an email sequence workflow' })
  isEmailSequenceWorkflow: boolean;

  @ApiProperty({ description: 'Whether this is a lead routing workflow' })
  isRoutingWorkflow: boolean;
} 