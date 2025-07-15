"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageMetricsOverviewDto = exports.UsageMetricResponseDto = void 0;
class UsageMetricResponseDto {
    id;
    metricName;
    count;
    period;
    companyId;
    recordedAt;
    constructor(data) {
        this.id = data.id;
        this.metricName = data.metricName;
        this.count = data.count;
        this.period = data.period;
        this.companyId = data.companyId;
        this.recordedAt = data.recordedAt;
    }
}
exports.UsageMetricResponseDto = UsageMetricResponseDto;
class UsageMetricsOverviewDto {
    companyId;
    metrics;
    planLimits;
    overageDetected;
    warnings;
    constructor(data) {
        this.companyId = data.companyId;
        this.metrics = data.metrics;
        this.planLimits = data.planLimits;
        this.overageDetected = data.overageDetected;
        this.warnings = data.warnings;
    }
}
exports.UsageMetricsOverviewDto = UsageMetricsOverviewDto;
//# sourceMappingURL=usage-metric-response.dto.js.map