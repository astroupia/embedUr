"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUsageMetricDto = void 0;
const class_validator_1 = require("class-validator");
const usage_metric_entity_1 = require("../entities/usage-metric.entity");
class CreateUsageMetricDto {
    metricName;
    count;
    period;
    companyId;
}
exports.CreateUsageMetricDto = CreateUsageMetricDto;
__decorate([
    (0, class_validator_1.IsEnum)(usage_metric_entity_1.MetricName),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUsageMetricDto.prototype, "metricName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateUsageMetricDto.prototype, "count", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUsageMetricDto.prototype, "period", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUsageMetricDto.prototype, "companyId", void 0);
//# sourceMappingURL=create-usage-metric.dto.js.map