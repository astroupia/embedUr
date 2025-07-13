import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionResponseDto } from '../dto/workflow-execution-response.dto';
export declare class WorkflowExecutionResponseMapper {
    static toDto(entity: WorkflowExecutionEntity): WorkflowExecutionResponseDto;
    static toDtoArray(entities: WorkflowExecutionEntity[]): WorkflowExecutionResponseDto[];
}
