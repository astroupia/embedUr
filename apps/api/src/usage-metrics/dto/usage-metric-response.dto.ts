export class UsageMetricResponseDto {
  id: string;
  metricName: string;
  count: number;
  period: string;
  companyId: string;
  recordedAt: Date;

  constructor(data: {
    id: string;
    metricName: string;
    count: number;
    period: string;
    companyId: string;
    recordedAt: Date;
  }) {
    this.id = data.id;
    this.metricName = data.metricName;
    this.count = data.count;
    this.period = data.period;
    this.companyId = data.companyId;
    this.recordedAt = data.recordedAt;
  }
}

export class UsageMetricsOverviewDto {
  companyId: string;
  metrics: UsageMetricResponseDto[];
  planLimits: {
    leads: number;
    workflows: number;
    aiInteractions: number;
    emails: number;
    enrichments: number;
  };
  overageDetected: boolean;
  warnings: string[];

  constructor(data: {
    companyId: string;
    metrics: UsageMetricResponseDto[];
    planLimits: {
      leads: number;
      workflows: number;
      aiInteractions: number;
      emails: number;
      enrichments: number;
    };
    overageDetected: boolean;
    warnings: string[];
  }) {
    this.companyId = data.companyId;
    this.metrics = data.metrics;
    this.planLimits = data.planLimits;
    this.overageDetected = data.overageDetected;
    this.warnings = data.warnings;
  }
} 