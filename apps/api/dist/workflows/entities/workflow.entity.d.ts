import { WorkflowType } from '../constants/workflow.constants';
export interface WorkflowExecutionSummary {
    id: string;
    status: string;
    startTime: Date;
    endTime?: Date;
    durationMs?: number;
    triggeredBy: string;
}
export declare class WorkflowEntity {
    readonly id: string;
    readonly name: string;
    readonly type: WorkflowType;
    readonly n8nWorkflowId: string;
    readonly companyId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly executionCount?: number | undefined;
    readonly lastExecution?: WorkflowExecutionSummary | undefined;
    constructor(id: string, name: string, type: WorkflowType, n8nWorkflowId: string, companyId: string, createdAt: Date, updatedAt: Date, executionCount?: number | undefined, lastExecution?: WorkflowExecutionSummary | undefined);
    get isActive(): boolean;
    get typeDescription(): string;
    get canBeDeleted(): boolean;
    get isTargetAudienceTranslatorWorkflow(): boolean;
    get isEnrichmentWorkflow(): boolean;
    get isEmailSequenceWorkflow(): boolean;
    get isRoutingWorkflow(): boolean;
    canExecuteWithInput(inputData: Record<string, any>): boolean;
    static create(name: string, type: WorkflowType, n8nWorkflowId: string, companyId: string): WorkflowEntity;
    withExecutionSummary(executionCount: number, lastExecution?: WorkflowExecutionSummary): WorkflowEntity;
}
