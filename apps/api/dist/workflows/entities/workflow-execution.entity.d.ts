import { WorkflowExecutionStatus } from '../constants/workflow.constants';
export declare class WorkflowExecutionEntity {
    readonly id: string;
    readonly status: WorkflowExecutionStatus;
    readonly triggeredBy: string;
    readonly startTime: Date;
    readonly endTime: Date | null;
    readonly inputData: Record<string, any> | null;
    readonly outputData: Record<string, any> | null;
    readonly durationMs: number | null;
    readonly leadId: string | null;
    readonly workflowId: string;
    readonly companyId: string;
    readonly errorMessage?: string | undefined;
    constructor(id: string, status: WorkflowExecutionStatus, triggeredBy: string, startTime: Date, endTime: Date | null, inputData: Record<string, any> | null, outputData: Record<string, any> | null, durationMs: number | null, leadId: string | null, workflowId: string, companyId: string, errorMessage?: string | undefined);
    get isCompleted(): boolean;
    get isRunning(): boolean;
    get isSuccessful(): boolean;
    get isFailed(): boolean;
    get durationSeconds(): number | null;
    get hasError(): boolean;
    get executionTime(): string;
    canBeRetried(): boolean;
    static create(workflowId: string, companyId: string, triggeredBy: string, inputData: Record<string, any>, leadId?: string): WorkflowExecutionEntity;
    withStatus(status: WorkflowExecutionStatus, outputData?: Record<string, any>, errorMessage?: string): WorkflowExecutionEntity;
}
