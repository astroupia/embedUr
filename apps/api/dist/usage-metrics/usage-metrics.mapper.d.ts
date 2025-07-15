import { UsageMetricEntity } from './entities/usage-metric.entity';
import { UsageMetricResponseDto } from './dto/usage-metric-response.dto';
export declare class UsageMetricsMapper {
    static toResponseDto(entity: UsageMetricEntity): UsageMetricResponseDto;
    static toResponseDtos(entities: UsageMetricEntity[]): UsageMetricResponseDto[];
    static toEntity(data: any): UsageMetricEntity;
    static toEntities(data: any[]): UsageMetricEntity[];
}
