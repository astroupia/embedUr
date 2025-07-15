import type { Workflow as PrismaWorkflow, WorkflowExecution as PrismaWorkflowExecution } from '../../../generated/prisma';
import { WorkflowEntity, WorkflowExecutionSummary } from '../entities/workflow.entity';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowType, WorkflowExecutionStatus } from '../constants/workflow.constants';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../dto/workflow.dto';

export class WorkflowMapper {
  static toEntity(
    prisma: PrismaWorkflow,
    executionCount?: number,
    lastExecution?: PrismaWorkflowExecution,
  ): WorkflowEntity {
    const executionSummary = lastExecution ? {
      id: lastExecution.id,
      status: lastExecution.status,
      startTime: lastExecution.startTime,
      endTime: lastExecution.endTime || undefined,
      durationMs: lastExecution.durationMs || undefined,
      triggeredBy: lastExecution.triggeredBy,
    } : undefined;

    return new WorkflowEntity(
      prisma.id,
      prisma.name,
      prisma.type as WorkflowType,
      prisma.n8nWorkflowId,
      prisma.companyId,
      prisma.createdAt,
      prisma.updatedAt,
      executionCount,
      executionSummary,
    );
  }

  static toPrismaCreate(dto: CreateWorkflowDto, companyId: string): any {
    return {
      name: dto.name,
      type: dto.type,
      n8nWorkflowId: dto.n8nWorkflowId,
      companyId,
    };
  }

  static toPrismaUpdate(dto: UpdateWorkflowDto): any {
    return {
      ...(dto.name && { name: dto.name }),
      ...(dto.n8nWorkflowId && { n8nWorkflowId: dto.n8nWorkflowId }),
    };
  }

  static toExecutionEntity(prisma: PrismaWorkflowExecution): WorkflowExecutionEntity {
    return new WorkflowExecutionEntity(
      prisma.id,
      prisma.status as WorkflowExecutionStatus,
      prisma.triggeredBy,
      prisma.startTime,
      prisma.endTime,
      prisma.inputData as Record<string, any> || null,
      prisma.outputData as Record<string, any> || null,
      prisma.durationMs,
      prisma.leadId,
      prisma.workflowId,
      prisma.companyId,
    );
  }

  static toPrismaExecutionCreate(
    workflowId: string,
    companyId: string,
    triggeredBy: string,
    inputData: Record<string, any>,
    leadId?: string,
  ): any {
    return {
      status: WorkflowExecutionStatus.STARTED,
      triggeredBy,
      startTime: new Date(),
      inputData,
      workflowId,
      companyId,
      ...(leadId && { leadId }),
    };
  }

  static toPrismaExecutionUpdate(
    status: WorkflowExecutionStatus,
    outputData?: Record<string, any>,
    errorMessage?: string,
  ): any {
    const update: any = {
      status,
      ...(outputData && { outputData }),
      ...(errorMessage && { errorMessage }),
    };

    // Set endTime and durationMs for completed executions
    if (status === WorkflowExecutionStatus.SUCCESS || 
        status === WorkflowExecutionStatus.FAILED ||
        status === WorkflowExecutionStatus.TIMEOUT ||
        status === WorkflowExecutionStatus.CANCELLED) {
      update.endTime = new Date();
    }

    return update;
  }
} 