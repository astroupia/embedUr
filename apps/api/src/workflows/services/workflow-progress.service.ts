import { Injectable, Logger } from '@nestjs/common';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionStatus } from '../constants/workflow.constants';
import { WorkflowExecutionRepository } from '../repositories/workflow-execution.repository';
import { WorkflowRepository } from '../repositories/workflow.repository';

export interface WorkflowProgress {
  executionId: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowExecutionStatus;
  progress: number; // 0-100
  currentStep?: string;
  totalSteps?: number;
  estimatedTimeRemaining?: number; // in seconds
  message?: string;
  timestamp: Date;
}

export interface ProgressSubscription {
  userId: string;
  companyId: string;
  executionIds: string[];
  socketId: string;
}

export interface ProgressUpdate {
  executionId: string;
  step: string;
  progress: number;
  message?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class WorkflowProgressService {
  private readonly logger = new Logger(WorkflowProgressService.name);
  private readonly progressCache = new Map<string, WorkflowProgress>();
  private readonly subscriptions = new Map<string, ProgressSubscription>();

  constructor(
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    private readonly workflowRepository: WorkflowRepository,
  ) {}

  /**
   * Update progress for a workflow execution
   */
  async updateProgress(progressUpdate: ProgressUpdate): Promise<void> {
    this.logger.log(`Updating progress for execution ${progressUpdate.executionId}: ${progressUpdate.progress}%`);

    // Get execution and workflow details
    const execution = await this.workflowExecutionRepository.findOne(progressUpdate.executionId, '');
    const workflow = await this.workflowRepository.findOne(execution.workflowId, execution.companyId);

    // Create WorkflowProgress from ProgressUpdate
    const progress: WorkflowProgress = {
      executionId: progressUpdate.executionId,
      workflowId: execution.workflowId,
      workflowName: workflow.name,
      status: WorkflowExecutionStatus.RUNNING,
      progress: progressUpdate.progress,
      currentStep: progressUpdate.step,
      totalSteps: this.getTotalStepsForWorkflowType(workflow.type),
      estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(execution, progressUpdate.progress),
      message: progressUpdate.message,
      timestamp: new Date(),
    };

    // Cache the progress
    this.progressCache.set(progressUpdate.executionId, progress);

    // Notify subscribed clients
    await this.notifySubscribers(progress);
  }

  /**
   * Subscribe to progress updates
   */
  async subscribeToProgress(
    userId: string,
    companyId: string,
    executionIds: string[],
    socketId: string,
  ): Promise<void> {
    this.logger.log(`User ${userId} subscribing to progress for executions: ${executionIds.join(', ')}`);

    const subscription: ProgressSubscription = {
      userId,
      companyId,
      executionIds,
      socketId,
    };

    this.subscriptions.set(socketId, subscription);

    // Send current progress for subscribed executions
    for (const executionId of executionIds) {
      const progress = this.progressCache.get(executionId);
      if (progress) {
        // In a real implementation, this would emit via WebSocket
        this.logger.log(`Sending progress update to ${socketId}: ${progress.progress}%`);
      }
    }
  }

  /**
   * Unsubscribe from progress updates
   */
  async unsubscribeFromProgress(socketId: string): Promise<void> {
    this.logger.log(`Unsubscribing socket ${socketId} from progress updates`);

    this.subscriptions.delete(socketId);
  }

  /**
   * Get progress history for an execution
   */
  async getProgressHistory(executionId: string): Promise<WorkflowProgress[]> {
    // In a real implementation, this would query a progress history table
    // For now, return the cached progress if available
    const progress = this.progressCache.get(executionId);
    return progress ? [progress] : [];
  }

  /**
   * Get workflow analytics
   */
  async getWorkflowAnalytics(workflowId: string): Promise<{
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    averageProgress: number;
    averageDuration: number;
  }> {
    // Get executions for this workflow
    const executions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(
      workflowId,
      { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }, // Last 30 days
    );

    const totalExecutions = executions.length;
    const completedExecutions = executions.filter(e => e.status === WorkflowExecutionStatus.SUCCESS).length;
    const failedExecutions = executions.filter(e => e.status === WorkflowExecutionStatus.FAILED).length;
    
    // Calculate average progress (for completed executions, progress is 100)
    const averageProgress = totalExecutions > 0 
      ? (completedExecutions * 100 + failedExecutions * 0) / totalExecutions 
      : 0;
    
    // Calculate average duration
    const completedExecutionsWithDuration = executions.filter(e => 
      e.status === WorkflowExecutionStatus.SUCCESS && e.durationMs
    );
    const averageDuration = completedExecutionsWithDuration.length > 0
      ? completedExecutionsWithDuration.reduce((sum, e) => sum + (e.durationMs || 0), 0) / completedExecutionsWithDuration.length
      : 0;

    return {
      totalExecutions,
      completedExecutions,
      failedExecutions,
      averageProgress,
      averageDuration,
    };
  }

  /**
   * Get current progress for an execution
   */
  async getProgress(executionId: string): Promise<WorkflowProgress | null> {
    return this.progressCache.get(executionId) || null;
  }

  /**
   * Calculate progress based on execution status and metadata
   */
  calculateProgress(execution: WorkflowExecutionEntity): WorkflowProgress {
    let progress = 0;
    let currentStep = '';
    let totalSteps = 1;
    let estimatedTimeRemaining: number | undefined;

    switch (execution.status) {
      case WorkflowExecutionStatus.STARTED:
        progress = 10;
        currentStep = 'Started';
        break;
      
      case WorkflowExecutionStatus.RUNNING:
        // Calculate progress based on execution duration and estimated total time
        const elapsedMs = Date.now() - execution.startTime.getTime();
        const estimatedTotalMs = this.getEstimatedDuration(execution);
        progress = Math.min(90, Math.floor((elapsedMs / estimatedTotalMs) * 100));
        currentStep = 'Processing';
        estimatedTimeRemaining = Math.max(0, Math.floor((estimatedTotalMs - elapsedMs) / 1000));
        break;
      
      case WorkflowExecutionStatus.SUCCESS:
        progress = 100;
        currentStep = 'Completed';
        break;
      
      case WorkflowExecutionStatus.FAILED:
        progress = 0;
        currentStep = 'Failed';
        break;
      
      default:
        progress = 0;
        currentStep = 'Unknown';
    }

    return {
      executionId: execution.id,
      workflowId: execution.workflowId,
      workflowName: 'Unknown Workflow', // Will be updated when workflow details are available
      status: execution.status,
      progress,
      currentStep,
      totalSteps,
      estimatedTimeRemaining,
      message: this.getProgressMessage(execution),
      timestamp: new Date(),
    };
  }

  /**
   * Notify subscribers about progress updates
   */
  private async notifySubscribers(progress: WorkflowProgress): Promise<void> {
    const subscribers = Array.from(this.subscriptions.values()).filter(sub =>
      sub.executionIds.includes(progress.executionId)
    );

    for (const subscriber of subscribers) {
      try {
        // In a real implementation, this would emit via WebSocket
        this.logger.log(`Notifying subscriber ${subscriber.socketId} about progress: ${progress.progress}%`);
      } catch (error) {
        this.logger.error(`Failed to notify subscriber ${subscriber.socketId}:`, error);
      }
    }
  }

  /**
   * Get estimated duration for workflow type
   */
  private getEstimatedDuration(execution: WorkflowExecutionEntity): number {
    // Default estimates in milliseconds
    const estimates: Record<string, number> = {
      TARGET_AUDIENCE_TRANSLATOR: 30000, // 30 seconds
      LEAD_ENRICHMENT: 45000, // 45 seconds
      EMAIL_SEQUENCE: 15000, // 15 seconds
      LEAD_ROUTING: 20000, // 20 seconds
    };

    // Get workflow type from execution (this would need to be enhanced to include workflow type in execution)
    return estimates['TARGET_AUDIENCE_TRANSLATOR'] || 30000; // Default 30 seconds
  }

  /**
   * Get total steps for workflow type
   */
  private getTotalStepsForWorkflowType(workflowType: string): number {
    const stepCounts: Record<string, number> = {
      TARGET_AUDIENCE_TRANSLATOR: 3,
      LEAD_ENRICHMENT: 4,
      EMAIL_SEQUENCE: 2,
      LEAD_ROUTING: 3,
    };

    return stepCounts[workflowType] || 1;
  }

  /**
   * Calculate estimated time remaining based on current progress
   */
  private calculateEstimatedTimeRemaining(execution: WorkflowExecutionEntity, currentProgress: number): number {
    if (currentProgress <= 0) return 0;
    
    const elapsedMs = Date.now() - execution.startTime.getTime();
    const estimatedTotalMs = (elapsedMs / currentProgress) * 100;
    const remainingMs = estimatedTotalMs - elapsedMs;
    
    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  /**
   * Get human-readable progress message
   */
  private getProgressMessage(execution: WorkflowExecutionEntity): string {
    switch (execution.status) {
      case WorkflowExecutionStatus.STARTED:
        return 'Workflow execution has started';
      
      case WorkflowExecutionStatus.RUNNING:
        return 'Workflow is currently processing';
      
      case WorkflowExecutionStatus.SUCCESS:
        return 'Workflow completed successfully';
      
      case WorkflowExecutionStatus.FAILED:
        return `Workflow failed: ${execution.outputData?.error || 'Unknown error'}`;
      
      default:
        return 'Workflow status unknown';
    }
  }

  /**
   * Clean up old progress data
   */
  async cleanupOldProgress(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    const cutoff = Date.now() - maxAgeMs;
    
    for (const [executionId, progress] of this.progressCache.entries()) {
      if (progress.timestamp.getTime() < cutoff) {
        this.progressCache.delete(executionId);
      }
    }
  }
} 