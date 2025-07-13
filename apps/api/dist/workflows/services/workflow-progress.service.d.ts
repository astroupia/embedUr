import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionStatus } from '../constants/workflow.constants';
import { WorkflowExecutionRepository } from '../repositories/workflow-execution.repository';
import { WorkflowRepository } from '../repositories/workflow.repository';
export interface WorkflowProgress {
    executionId: string;
    workflowId: string;
    workflowName: string;
    status: WorkflowExecutionStatus;
    progress: number;
    currentStep?: string;
    totalSteps?: number;
    estimatedTimeRemaining?: number;
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
export declare class WorkflowProgressService {
    private readonly workflowExecutionRepository;
    private readonly workflowRepository;
    private readonly logger;
    private readonly progressCache;
    private readonly subscriptions;
    constructor(workflowExecutionRepository: WorkflowExecutionRepository, workflowRepository: WorkflowRepository);
    updateProgress(progressUpdate: ProgressUpdate): Promise<void>;
    subscribeToProgress(userId: string, companyId: string, executionIds: string[], socketId: string): Promise<void>;
    unsubscribeFromProgress(socketId: string): Promise<void>;
    getProgressHistory(executionId: string): Promise<WorkflowProgress[]>;
    getWorkflowAnalytics(workflowId: string): Promise<{
        totalExecutions: number;
        completedExecutions: number;
        failedExecutions: number;
        averageProgress: number;
        averageDuration: number;
    }>;
    getProgress(executionId: string): Promise<WorkflowProgress | null>;
    calculateProgress(execution: WorkflowExecutionEntity): WorkflowProgress;
    private notifySubscribers;
    private getEstimatedDuration;
    private getTotalStepsForWorkflowType;
    private calculateEstimatedTimeRemaining;
    private getProgressMessage;
    cleanupOldProgress(maxAgeMs?: number): Promise<void>;
}
