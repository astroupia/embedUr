import type { Workflow as PrismaWorkflow, WorkflowExecution as PrismaWorkflowExecution } from '../../../generated/prisma';
import { WorkflowEntity } from '../entities/workflow.entity';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionStatus } from '../constants/workflow.constants';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../dto/workflow.dto';
export declare class WorkflowMapper {
    static toEntity(prisma: PrismaWorkflow, executionCount?: number, lastExecution?: PrismaWorkflowExecution): WorkflowEntity;
    static toPrismaCreate(dto: CreateWorkflowDto, companyId: string): any;
    static toPrismaUpdate(dto: UpdateWorkflowDto): any;
    static toExecutionEntity(prisma: PrismaWorkflowExecution): WorkflowExecutionEntity;
    static toPrismaExecutionCreate(workflowId: string, companyId: string, triggeredBy: string, inputData: Record<string, any>, leadId?: string): any;
    static toPrismaExecutionUpdate(status: WorkflowExecutionStatus, outputData?: Record<string, any>, errorMessage?: string): any;
}
