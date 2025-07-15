"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METRIC_DESCRIPTIONS = exports.MetricName = exports.UsageMetricEntity = void 0;
class UsageMetricEntity {
    id;
    metricName;
    count;
    period;
    companyId;
    recordedAt;
    constructor(id, metricName, count, period, companyId, recordedAt) {
        this.id = id;
        this.metricName = metricName;
        this.count = count;
        this.period = period;
        this.companyId = companyId;
        this.recordedAt = recordedAt;
    }
    get isCurrentPeriod() {
        const today = new Date();
        const currentPeriod = UsageMetricEntity.formatPeriod(today);
        return this.period === currentPeriod;
    }
    get isOverLimit() {
        return false;
    }
    get periodType() {
        if (this.period.length === 10)
            return 'daily';
        if (this.period.length === 7)
            return 'monthly';
        if (this.period.length === 4)
            return 'yearly';
        return 'daily';
    }
    static create(metricName, companyId, count = 1, period) {
        const currentPeriod = period || UsageMetricEntity.formatPeriod(new Date());
        return new UsageMetricEntity('', metricName, count, currentPeriod, companyId, new Date());
    }
    increment(amount = 1) {
        return new UsageMetricEntity(this.id, this.metricName, this.count + amount, this.period, this.companyId, this.recordedAt);
    }
    withCount(count) {
        return new UsageMetricEntity(this.id, this.metricName, count, this.period, this.companyId, this.recordedAt);
    }
    static formatPeriod(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
exports.UsageMetricEntity = UsageMetricEntity;
var MetricName;
(function (MetricName) {
    MetricName["LEADS_CREATED"] = "LEADS_CREATED";
    MetricName["WORKFLOWS_EXECUTED"] = "WORKFLOWS_EXECUTED";
    MetricName["AI_INTERACTIONS"] = "AI_INTERACTIONS";
    MetricName["EMAILS_SENT"] = "EMAILS_SENT";
    MetricName["ENRICHMENT_REQUESTS"] = "ENRICHMENT_REQUESTS";
    MetricName["REPLIES_CLASSIFIED"] = "REPLIES_CLASSIFIED";
    MetricName["CAMPAIGNS_CREATED"] = "CAMPAIGNS_CREATED";
    MetricName["BOOKINGS_CREATED"] = "BOOKINGS_CREATED";
    MetricName["API_CALLS"] = "API_CALLS";
})(MetricName || (exports.MetricName = MetricName = {}));
exports.METRIC_DESCRIPTIONS = {
    [MetricName.LEADS_CREATED]: 'Total leads created by the company',
    [MetricName.WORKFLOWS_EXECUTED]: 'Total workflows executed by the company',
    [MetricName.AI_INTERACTIONS]: 'Total AI operations performed (drafts, analysis, etc.)',
    [MetricName.EMAILS_SENT]: 'Total emails sent via campaigns',
    [MetricName.ENRICHMENT_REQUESTS]: 'Total enrichment API calls made',
    [MetricName.REPLIES_CLASSIFIED]: 'Total replies analyzed by AI',
    [MetricName.CAMPAIGNS_CREATED]: 'Total campaigns created by the company',
    [MetricName.BOOKINGS_CREATED]: 'Total bookings created by the company',
    [MetricName.API_CALLS]: 'Total API calls made by the company',
};
//# sourceMappingURL=usage-metric.entity.js.map