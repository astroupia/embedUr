import { UsageMetricEntity } from './entities/usage-metric.entity';
import { UsageMetricResponseDto } from './dto/usage-metric-response.dto';

export class UsageMetricsMapper {
  /**
   * Map entity to response DTO
   */
  static toResponseDto(entity: UsageMetricEntity): UsageMetricResponseDto {
    return new UsageMetricResponseDto({
      id: entity.id,
      metricName: entity.metricName,
      count: entity.count,
      period: entity.period,
      companyId: entity.companyId,
      recordedAt: entity.recordedAt,
    });
  }

  /**
   * Map multiple entities to response DTOs
   */
  static toResponseDtos(entities: UsageMetricEntity[]): UsageMetricResponseDto[] {
    return entities.map(entity => this.toResponseDto(entity));
  }

  /**
   * Map database record to entity
   */
  static toEntity(data: any): UsageMetricEntity {
    return new UsageMetricEntity(
      data.id,
      data.metricName,
      data.count,
      data.period,
      data.companyId,
      data.recordedAt,
    );
  }

  /**
   * Map multiple database records to entities
   */
  static toEntities(data: any[]): UsageMetricEntity[] {
    return data.map(record => this.toEntity(record));
  }
} 