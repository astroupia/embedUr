import { LeadEntity } from '../entities/lead.entity';
import { LeadResponseDto } from '../dtos/lead-response.dto';
export declare class LeadResponseMapper {
    static toResponseDto(entity: LeadEntity): LeadResponseDto;
    static toResponseDtoList(entities: LeadEntity[]): LeadResponseDto[];
}
