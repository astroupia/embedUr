import { WorkflowExecutionStatus } from '../constants/workflow.constants';
export declare class WorkflowExecutionResponseDto {
    id: string;
    status: WorkflowExecutionStatus;
    triggeredBy: string;
    startTime: Date;
    endTime: Date | null;
    inputData: Record<string, any> | null;
    outputData: Record<string, any> | null;
    durationMs: number | null;
    leadId: string | null;
    workflowId: string;
    companyId: string;
    errorMessage?: string;
    isCompleted: boolean;
    isRunning: boolean;
    isSuccessful: boolean;
    isFailed: boolean;
    durationSeconds: number | null;
    hasError: boolean;
    executionTime: string;
    canBeRetried: boolean;
}
