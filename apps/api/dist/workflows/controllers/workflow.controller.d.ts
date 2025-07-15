import { WorkflowService } from '../services/workflow.service';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto, RetryExecutionDto } from '../dto/workflow.dto';
import { QueryWorkflowsCursorDto } from '../dto/query-workflows-cursor.dto';
import { QueryExecutionsCursorDto } from '../dto/query-executions-cursor.dto';
import { WorkflowType } from '../constants/workflow.constants';
import { WorkflowResponseDto } from '../dto/workflow-response.dto';
import { WorkflowExecutionResponseDto } from '../dto/workflow-execution-response.dto';
interface CurrentUserPayload {
    userId: string;
    companyId: string;
    role: string;
}
export declare class WorkflowController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    create(createWorkflowDto: CreateWorkflowDto, user: CurrentUserPayload): Promise<WorkflowResponseDto>;
    findAll(query: QueryWorkflowsCursorDto, user: CurrentUserPayload): Promise<{
        data: WorkflowResponseDto[];
        nextCursor: string | null;
    }>;
    getStats(user: CurrentUserPayload): Promise<{
        total: number;
        byType: Record<WorkflowType, number>;
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
    }>;
    findByType(type: WorkflowType, user: CurrentUserPayload): Promise<WorkflowResponseDto[]>;
    findExecutions(query: QueryExecutionsCursorDto, user: CurrentUserPayload): Promise<{
        data: WorkflowExecutionResponseDto[];
        nextCursor: string | null;
    }>;
    findExecution(executionId: string, user: CurrentUserPayload): Promise<WorkflowExecutionResponseDto>;
    retryExecution(executionId: string, retryExecutionDto: RetryExecutionDto, user: CurrentUserPayload): Promise<WorkflowExecutionResponseDto>;
    findOne(id: string, user: CurrentUserPayload): Promise<WorkflowResponseDto>;
    update(id: string, updateWorkflowDto: UpdateWorkflowDto, user: CurrentUserPayload): Promise<WorkflowResponseDto>;
    remove(id: string, user: CurrentUserPayload): Promise<void>;
    executeWorkflow(id: string, executeWorkflowDto: ExecuteWorkflowDto, user: CurrentUserPayload): Promise<WorkflowExecutionResponseDto>;
    findExecutionsByWorkflow(id: string, user: CurrentUserPayload): Promise<WorkflowExecutionResponseDto[]>;
}
export {};
