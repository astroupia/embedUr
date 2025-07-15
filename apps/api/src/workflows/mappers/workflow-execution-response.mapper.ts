import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionResponseDto } from '../dto/workflow-execution-response.dto';

export class WorkflowExecutionResponseMapper {
  static toDto(entity: WorkflowExecutionEntity): WorkflowExecutionResponseDto {
    return {
      id: entity.id,
      status: entity.status,
      triggeredBy: entity.triggeredBy,
      startTime: entity.startTime,
      endTime: entity.endTime,
      inputData: entity.inputData,
      outputData: entity.outputData,
      durationMs: entity.durationMs,
      leadId: entity.leadId,
      workflowId: entity.workflowId,
      companyId: entity.companyId,
      errorMessage: entity.errorMessage,
      // Business logic properties
      isCompleted: entity.isCompleted,
      isRunning: entity.isRunning,
      isSuccessful: entity.isSuccessful,
      isFailed: entity.isFailed,
      durationSeconds: entity.durationSeconds,
      hasError: entity.hasError,
      executionTime: entity.executionTime,
      canBeRetried: entity.canBeRetried(),
    };
  }

  static toDtoArray(entities: WorkflowExecutionEntity[]): WorkflowExecutionResponseDto[] {
    return entities.map(entity => this.toDto(entity));
  }
} 