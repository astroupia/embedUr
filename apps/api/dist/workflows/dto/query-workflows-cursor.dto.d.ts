import { WorkflowType } from '../constants/workflow.constants';
export declare class QueryWorkflowsCursorDto {
    cursor?: string;
    take?: number;
    type?: WorkflowType;
    search?: string;
}
