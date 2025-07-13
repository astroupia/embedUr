import { WorkflowExecutionStatus } from '../constants/workflow.constants';
export declare class QueryExecutionsCursorDto {
    cursor?: string;
    take?: number;
    status?: WorkflowExecutionStatus;
    workflowId?: string;
    leadId?: string;
    startDate?: string;
    endDate?: string;
}
