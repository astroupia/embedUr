import { BookingEntity } from '../entities/booking.entity';
import { BookingResponseDto } from '../dto/booking.dto';
export declare class BookingMapper {
    static toEntity(model: any): BookingEntity | null;
    static toDto(entity: BookingEntity): BookingResponseDto | null;
    static toEntityArray(models: any[]): BookingEntity[];
    static toDtoArray(entities: BookingEntity[]): BookingResponseDto[];
    static toEntityWithRelations(model: any): BookingEntity | null;
    static toCreateData(dto: any, companyId: string): any;
    static toUpdateData(dto: any): any;
    static toWorkflowUpdateData(workflowData: any): any;
    static createStatsSummary(bookings: BookingEntity[]): any;
}
