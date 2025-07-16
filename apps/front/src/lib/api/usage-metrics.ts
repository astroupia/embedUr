import { apiClient } from './client';
import type {
  UsageMetric,
  UsageMetricsOverview,
  CreateUsageMetricRequest,
} from './client';

// Usage Metrics API class that uses the base client
export class UsageMetricsAPI {
  private client = apiClient;

  /**
   * Create a new usage metric
   */
  async create(data: CreateUsageMetricRequest): Promise<UsageMetric> {
    return this.client.createUsageMetric(data);
  }

  /**
   * Get usage metrics for a period
   */
  async getAll(period?: string): Promise<UsageMetric[]> {
    return this.client.getUsageMetrics(period);
  }

  /**
   * Get usage overview
   */
  async getOverview(): Promise<UsageMetricsOverview> {
    return this.client.getUsageOverview();
  }
}

// Export types for convenience
export type {
  UsageMetric,
  UsageMetricsOverview,
  CreateUsageMetricRequest,
}; 