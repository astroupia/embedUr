"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageAnalyticsDto = exports.PlatformHealthDto = exports.GlobalMetricsSummaryDto = void 0;
class GlobalMetricsSummaryDto {
    totalCompanies;
    activeCompanies;
    suspendedCompanies;
    totalUsers;
    activeUsers;
    totalLeads;
    totalWorkflows;
    totalAiInteractions;
    totalEmails;
    totalEnrichments;
    totalBookings;
    totalCampaigns;
    averageLeadsPerCompany;
    averageWorkflowsPerCompany;
    topPerformingCompanies;
    recentActivity;
}
exports.GlobalMetricsSummaryDto = GlobalMetricsSummaryDto;
class PlatformHealthDto {
    status;
    databaseStatus;
    activeConnections;
    systemLoad;
    memoryUsage;
    diskUsage;
    lastBackupAt;
    uptime;
    alerts;
}
exports.PlatformHealthDto = PlatformHealthDto;
class UsageAnalyticsDto {
    period;
    totalUsage;
    usageByCompany;
    trends;
}
exports.UsageAnalyticsDto = UsageAnalyticsDto;
//# sourceMappingURL=global-metrics.dto.js.map