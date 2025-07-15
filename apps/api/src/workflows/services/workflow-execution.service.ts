import { Injectable, Logger } from '@nestjs/common';
import { WorkflowExecutionRepository } from '../repositories/workflow-execution.repository';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionStatus, WorkflowType } from '../constants/workflow.constants';

export interface WorkflowExecutionData {
  workflowId: string;
  leadId: string;
  companyId: string;
  type: WorkflowType;
  inputData: Record<string, any>;
  triggeredBy: string;
}

export interface WorkflowCompletionData {
  workflowId: string;
  leadId: string;
  companyId: string;
  status: WorkflowExecutionStatus;
  outputData?: Record<string, any>;
  errorMessage?: string;
}

@Injectable()
export class WorkflowExecutionService {
  private readonly logger = new Logger(WorkflowExecutionService.name);

  constructor(private readonly workflowExecutionRepository: WorkflowExecutionRepository) {}

  /**
   * Create a new workflow execution record
   */
  async createExecutionRecord(data: WorkflowExecutionData): Promise<WorkflowExecutionEntity> {
    this.logger.log(`Creating workflow execution for ${data.type} workflow ${data.workflowId}`);

    const execution = await this.workflowExecutionRepository.create({
      workflowId: data.workflowId,
      leadId: data.leadId,
      companyId: data.companyId,
      status: WorkflowExecutionStatus.STARTED,
      triggeredBy: data.triggeredBy,
      startTime: new Date(),
      inputData: data.inputData,
    });

    this.logger.log(`Workflow execution created: ${execution.id}`);
    return execution;
  }

  /**
   * Update workflow execution status
   */
  async updateExecutionStatus(
    id: string,
    status: WorkflowExecutionStatus,
    outputData?: Record<string, any>,
    errorMessage?: string,
  ): Promise<WorkflowExecutionEntity> {
    this.logger.log(`Updating execution ${id} status to ${status}`);

    const isCompleted = status === WorkflowExecutionStatus.SUCCESS ||
                       status === WorkflowExecutionStatus.FAILED ||
                       status === WorkflowExecutionStatus.TIMEOUT;

    let endTime: Date | undefined;
    let durationMs: number | undefined;

    if (isCompleted) {
      endTime = new Date();
      // Calculate duration
      const execution = await this.workflowExecutionRepository.findOneForDuration(id);
      if (execution) {
        durationMs = endTime.getTime() - execution.startTime.getTime();
      }
    }

    return this.workflowExecutionRepository.updateStatus(
      id,
      status,
      outputData,
      errorMessage,
      endTime,
      durationMs,
    );
  }

  /**
   * Find workflow execution by ID
   */
  async findExecution(id: string, companyId: string): Promise<WorkflowExecutionEntity> {
    return this.workflowExecutionRepository.findOne(id, companyId);
  }

  /**
   * Find pending workflow executions for a lead
   */
  async findPendingExecutions(leadId: string, companyId: string): Promise<WorkflowExecutionEntity[]> {
    return this.workflowExecutionRepository.findPendingByLead(leadId, companyId);
  }

  /**
   * Find workflow executions by type
   */
  async findExecutionsByType(
    type: WorkflowType,
    companyId: string,
    limit: number = 50,
  ): Promise<WorkflowExecutionEntity[]> {
    return this.workflowExecutionRepository.findByType(type, companyId, limit);
  }

  /**
   * Find workflow execution by workflow ID, lead ID, and company ID
   */
  async findByWorkflowLeadAndCompany(
    workflowId: string,
    leadId: string,
    companyId: string,
  ): Promise<WorkflowExecutionEntity | null> {
    return this.workflowExecutionRepository.findByWorkflowLeadAndCompany(workflowId, leadId, companyId);
  }

  /**
   * Get workflow execution statistics
   */
  async getExecutionStats(companyId: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    byType: Record<WorkflowType, { total: number; successful: number; failed: number }>;
    averageDurationMs: number;
  }> {
    return this.workflowExecutionRepository.getStats(companyId);
  }

  /**
   * Retry a failed workflow execution
   */
  async retryExecution(executionId: string, companyId: string): Promise<WorkflowExecutionEntity> {
    this.logger.log(`Retrying execution ${executionId}`);

    const originalExecution = await this.workflowExecutionRepository.findOne(executionId, companyId);

    if (originalExecution.status !== WorkflowExecutionStatus.FAILED) {
      throw new Error('Only failed executions can be retried');
    }

    // Create new execution record with same data
    const newExecution = await this.workflowExecutionRepository.create({
      workflowId: originalExecution.workflowId,
      leadId: originalExecution.leadId || '',
      companyId: originalExecution.companyId,
      status: WorkflowExecutionStatus.STARTED,
      triggeredBy: `${originalExecution.triggeredBy} (retry)`,
      startTime: new Date(),
      inputData: originalExecution.inputData || {},
    });

    this.logger.log(`Execution retry created: ${newExecution.id}`);
    return newExecution;
  }

  /**
   * Clean up old workflow executions
   */
  async cleanupOldExecutions(daysOld: number = 30): Promise<number> {
    this.logger.log(`Cleaning up workflow executions older than ${daysOld} days`);
    
    const deletedCount = await this.workflowExecutionRepository.cleanupOld(daysOld);
    
    this.logger.log(`Cleaned up ${deletedCount} old workflow executions`);
    return deletedCount;
  }
} 