import { WorkflowType } from '../constants/workflow.constants';
export declare class CreateWorkflowDto {
    name: string;
    type: WorkflowType;
    n8nWorkflowId: string;
}
export declare class UpdateWorkflowDto {
    name?: string;
    n8nWorkflowId?: string;
}
export declare class ExecuteWorkflowDto {
    inputData: Record<string, any>;
    leadId?: string;
    campaignId?: string;
}
export declare class RetryExecutionDto {
    inputData?: Record<string, any>;
}
