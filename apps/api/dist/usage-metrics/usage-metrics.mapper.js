"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageMetricsMapper = void 0;
const usage_metric_entity_1 = require("./entities/usage-metric.entity");
const usage_metric_response_dto_1 = require("./dto/usage-metric-response.dto");
class UsageMetricsMapper {
    static toResponseDto(entity) {
        return new usage_metric_response_dto_1.UsageMetricResponseDto({
            id: entity.id,
            metricName: entity.metricName,
            count: entity.count,
            period: entity.period,
            companyId: entity.companyId,
            recordedAt: entity.recordedAt,
        });
    }
    static toResponseDtos(entities) {
        return entities.map(entity => this.toResponseDto(entity));
    }
    static toEntity(data) {
        return new usage_metric_entity_1.UsageMetricEntity(data.id, data.metricName, data.count, data.period, data.companyId, data.recordedAt);
    }
    static toEntities(data) {
        return data.map(record => this.toEntity(record));
    }
}
exports.UsageMetricsMapper = UsageMetricsMapper;
//# sourceMappingURL=usage-metrics.mapper.js.map