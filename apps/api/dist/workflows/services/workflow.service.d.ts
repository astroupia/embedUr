import { WorkflowRepository } from '../repositories/workflow.repository';
import { WorkflowEventsService } from './workflow-events.service';
import { WorkflowEntity } from '../entities/workflow.entity';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto, RetryExecutionDto } from '../dto/workflow.dto';
import { QueryWorkflowsCursorDto } from '../dto/query-workflows-cursor.dto';
import { QueryExecutionsCursorDto } from '../dto/query-executions-cursor.dto';
import { WorkflowType } from '../constants/workflow.constants';
export declare class WorkflowService {
    private readonly workflowRepository;
    private readonly workflowEvents;
    private readonly logger;
    constructor(workflowRepository: WorkflowRepository, workflowEvents: WorkflowEventsService);
    create(dto: CreateWorkflowDto, companyId: string): Promise<WorkflowEntity>;
    findAll(companyId: string, query: QueryWorkflowsCursorDto): Promise<{
        data: WorkflowEntity[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<WorkflowEntity>;
    update(id: string, companyId: string, dto: UpdateWorkflowDto): Promise<WorkflowEntity>;
    remove(id: string, companyId: string): Promise<void>;
    findByType(type: WorkflowType, companyId: string): Promise<WorkflowEntity[]>;
    getStats(companyId: string): Promise<{
        total: number;
        byType: Record<WorkflowType, number>;
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
    }>;
    executeWorkflow(id: string, companyId: string, dto: ExecuteWorkflowDto, triggeredBy: string): Promise<WorkflowExecutionEntity>;
    findExecutions(companyId: string, query: QueryExecutionsCursorDto): Promise<{
        data: WorkflowExecutionEntity[];
        nextCursor: string | null;
    }>;
    findExecution(id: string, companyId: string): Promise<WorkflowExecutionEntity>;
    retryExecution(executionId: string, companyId: string, dto: RetryExecutionDto, triggeredBy: string): Promise<WorkflowExecutionEntity>;
    findExecutionsByWorkflow(workflowId: string, companyId: string): Promise<WorkflowExecutionEntity[]>;
}
