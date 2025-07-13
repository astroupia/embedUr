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
export declare class WorkflowExecutionService {
    private readonly workflowExecutionRepository;
    private readonly logger;
    constructor(workflowExecutionRepository: WorkflowExecutionRepository);
    createExecutionRecord(data: WorkflowExecutionData): Promise<WorkflowExecutionEntity>;
    updateExecutionStatus(id: string, status: WorkflowExecutionStatus, outputData?: Record<string, any>, errorMessage?: string): Promise<WorkflowExecutionEntity>;
    findExecution(id: string, companyId: string): Promise<WorkflowExecutionEntity>;
    findPendingExecutions(leadId: string, companyId: string): Promise<WorkflowExecutionEntity[]>;
    findExecutionsByType(type: WorkflowType, companyId: string, limit?: number): Promise<WorkflowExecutionEntity[]>;
    findByWorkflowLeadAndCompany(workflowId: string, leadId: string, companyId: string): Promise<WorkflowExecutionEntity | null>;
    getExecutionStats(companyId: string): Promise<{
        total: number;
        successful: number;
        failed: number;
        pending: number;
        byType: Record<WorkflowType, {
            total: number;
            successful: number;
            failed: number;
        }>;
        averageDurationMs: number;
    }>;
    retryExecution(executionId: string, companyId: string): Promise<WorkflowExecutionEntity>;
    cleanupOldExecutions(daysOld?: number): Promise<number>;
}
