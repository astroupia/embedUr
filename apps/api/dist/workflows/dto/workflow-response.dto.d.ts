import { WorkflowType } from '../constants/workflow.constants';
export interface WorkflowExecutionSummaryDto {
    id: string;
    status: string;
    startTime: Date;
    endTime?: Date;
    durationMs?: number;
    triggeredBy: string;
}
export declare class WorkflowResponseDto {
    id: string;
    name: string;
    type: WorkflowType;
    n8nWorkflowId: string;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    executionCount: number;
    lastExecution?: WorkflowExecutionSummaryDto;
    isActive: boolean;
    typeDescription: string;
    canBeDeleted: boolean;
    isEnrichmentWorkflow: boolean;
    isEmailSequenceWorkflow: boolean;
    isRoutingWorkflow: boolean;
}
