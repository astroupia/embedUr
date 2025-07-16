import { apiClient } from './client';
import type {
  AdminActionLog,
  Company,
  GlobalMetricsSummary,
  UsageMetric,
  UsageMetricsOverview,
  UpdateCompanyStatusRequest,
  UpdateCompanyPlanRequest,
  CreateSystemNotificationRequest,
  QueryAdminActionLogsRequest,
  PaginatedResponse,
} from './client';

// Admin API class that uses the base client
export class AdminAPI {
  private client = apiClient;

  /**
   * Get admin action logs with pagination and filtering
   */
  async getActionLogs(params?: QueryAdminActionLogsRequest): Promise<PaginatedResponse<AdminActionLog>> {
    return this.client.getAdminActionLogs(params);
  }

  /**
   * Update company status
   */
  async updateCompanyStatus(companyId: string, data: UpdateCompanyStatusRequest): Promise<Company> {
    return this.client.updateCompanyStatus(companyId, data);
  }

  /**
   * Update company plan
   */
  async updateCompanyPlan(companyId: string, data: UpdateCompanyPlanRequest): Promise<Company> {
    return this.client.updateCompanyPlan(companyId, data);
  }

  /**
   * Create system notification
   */
  async createSystemNotification(data: CreateSystemNotificationRequest): Promise<void> {
    return this.client.createSystemNotification(data);
  }

  /**
   * Get global metrics summary
   */
  async getGlobalMetricsSummary(): Promise<GlobalMetricsSummary> {
    return this.client.getGlobalMetricsSummary();
  }

  /**
   * Get all companies metrics
   */
  async getAllCompaniesMetrics(period?: string, metricNames?: string): Promise<UsageMetric[]> {
    return this.client.getAllCompaniesMetrics(period, metricNames);
  }

  /**
   * Get company metrics for admin
   */
  async getCompanyMetricsForAdmin(companyId: string): Promise<UsageMetric[]> {
    return this.client.getCompanyMetricsForAdmin(companyId);
  }

  /**
   * Get company usage overview for admin
   */
  async getCompanyUsageOverviewForAdmin(companyId: string): Promise<UsageMetricsOverview> {
    return this.client.getCompanyUsageOverviewForAdmin(companyId);
  }
}

// Export types for convenience
export type {
  AdminActionLog,
  Company,
  GlobalMetricsSummary,
  UsageMetric,
  UsageMetricsOverview,
  UpdateCompanyStatusRequest,
  UpdateCompanyPlanRequest,
  CreateSystemNotificationRequest,
  QueryAdminActionLogsRequest,
  PaginatedResponse,
}; 