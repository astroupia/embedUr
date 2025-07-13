import { WorkflowEntity } from '../entities/workflow.entity';
import { WorkflowResponseDto, WorkflowExecutionSummaryDto } from '../dto/workflow-response.dto';

export class WorkflowResponseMapper {
  static toDto(entity: WorkflowEntity): WorkflowResponseDto {
    const lastExecutionDto: WorkflowExecutionSummaryDto | undefined = entity.lastExecution ? {
      id: entity.lastExecution.id,
      status: entity.lastExecution.status,
      startTime: entity.lastExecution.startTime,
      endTime: entity.lastExecution.endTime,
      durationMs: entity.lastExecution.durationMs,
      triggeredBy: entity.lastExecution.triggeredBy,
    } : undefined;

    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      n8nWorkflowId: entity.n8nWorkflowId,
      companyId: entity.companyId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      executionCount: entity.executionCount || 0,
      lastExecution: lastExecutionDto,
      // Business logic properties
      isActive: entity.isActive,
      typeDescription: entity.typeDescription,
      canBeDeleted: entity.canBeDeleted,
      isEnrichmentWorkflow: entity.isEnrichmentWorkflow,
      isEmailSequenceWorkflow: entity.isEmailSequenceWorkflow,
      isRoutingWorkflow: entity.isRoutingWorkflow,
    };
  }

  static toDtoArray(entities: WorkflowEntity[]): WorkflowResponseDto[] {
    return entities.map(entity => this.toDto(entity));
  }
} 