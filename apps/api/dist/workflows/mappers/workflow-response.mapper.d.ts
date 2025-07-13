import { WorkflowEntity } from '../entities/workflow.entity';
import { WorkflowResponseDto } from '../dto/workflow-response.dto';
export declare class WorkflowResponseMapper {
    static toDto(entity: WorkflowEntity): WorkflowResponseDto;
    static toDtoArray(entities: WorkflowEntity[]): WorkflowResponseDto[];
}
