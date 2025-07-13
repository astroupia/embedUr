import { ReplyEntity } from '../entities/reply.entity';
import { ReplyResponseDto } from '../dto/reply.dto';
export declare class ReplyMapper {
    static toEntity(model: any): ReplyEntity | null;
    static toDto(entity: ReplyEntity): ReplyResponseDto | null;
    static toEntityArray(models: any[]): ReplyEntity[];
    static toDtoArray(entities: ReplyEntity[]): ReplyResponseDto[];
    static toEntityWithRelations(model: any): ReplyEntity | null;
    static toCreateData(dto: any, companyId: string): any;
    static toUpdateData(dto: any): any;
    static toWorkflowUpdateData(workflowData: any): any;
    static createStatsSummary(replies: ReplyEntity[]): any;
}
