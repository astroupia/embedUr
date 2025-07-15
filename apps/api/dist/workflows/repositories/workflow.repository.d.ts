import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowEntity } from '../entities/workflow.entity';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { QueryWorkflowsCursorDto } from '../dto/query-workflows-cursor.dto';
import { QueryExecutionsCursorDto } from '../dto/query-executions-cursor.dto';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../dto/workflow.dto';
import { WorkflowType, WorkflowExecutionStatus } from '../constants/workflow.constants';
export declare class WorkflowRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateWorkflowDto, companyId: string): Promise<WorkflowEntity>;
    findWithCursor(companyId: string, query: QueryWorkflowsCursorDto): Promise<{
        data: WorkflowEntity[];
        nextCursor: string | null;
    }>;
    findOne(id: string, companyId: string): Promise<WorkflowEntity>;
    update(id: string, companyId: string, dto: UpdateWorkflowDto): Promise<WorkflowEntity>;
    remove(id: string, companyId: string): Promise<void>;
    findByType(type: WorkflowType, companyId: string): Promise<WorkflowEntity[]>;
    countByCompany(companyId: string): Promise<number>;
    countByType(type: WorkflowType, companyId: string): Promise<number>;
    createExecution(workflowId: string, companyId: string, triggeredBy: string, inputData: Record<string, any>, leadId?: string): Promise<WorkflowExecutionEntity>;
    findExecutionsWithCursor(companyId: string, query: QueryExecutionsCursorDto): Promise<{
        data: WorkflowExecutionEntity[];
        nextCursor: string | null;
    }>;
    findExecution(id: string, companyId: string): Promise<WorkflowExecutionEntity>;
    updateExecution(id: string, companyId: string, status: WorkflowExecutionStatus, outputData?: Record<string, any>, errorMessage?: string): Promise<WorkflowExecutionEntity>;
    findExecutionsByWorkflow(workflowId: string, companyId: string): Promise<WorkflowExecutionEntity[]>;
    countExecutionsByWorkflow(workflowId: string, companyId: string): Promise<number>;
    countExecutionsByStatus(status: WorkflowExecutionStatus, companyId: string): Promise<number>;
    findByCompany(companyId: string): Promise<WorkflowEntity[]>;
}
