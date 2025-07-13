export class GlobalMetricsSummaryDto {
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  totalUsers: number;
  activeUsers: number;
  totalLeads: number;
  totalWorkflows: number;
  totalAiInteractions: number;
  totalEmails: number;
  totalEnrichments: number;
  totalBookings: number;
  totalCampaigns: number;
  averageLeadsPerCompany: number;
  averageWorkflowsPerCompany: number;
  topPerformingCompanies: Array<{
    companyId: string;
    companyName: string;
    leadsCreated: number;
    workflowsExecuted: number;
  }>;
  recentActivity: Array<{
    companyId: string;
    companyName: string;
    action: string;
    timestamp: Date;
  }>;
}

export class PlatformHealthDto {
  status: 'healthy' | 'warning' | 'critical';
  databaseStatus: 'connected' | 'disconnected' | 'error';
  activeConnections: number;
  systemLoad: number;
  memoryUsage: number;
  diskUsage: number;
  lastBackupAt?: Date;
  uptime: number;
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
}

export class UsageAnalyticsDto {
  period: string;
  totalUsage: {
    leads: number;
    workflows: number;
    aiInteractions: number;
    emails: number;
    enrichments: number;
  };
  usageByCompany: Array<{
    companyId: string;
    companyName: string;
    leads: number;
    workflows: number;
    aiInteractions: number;
    emails: number;
    enrichments: number;
    planLimit: {
      leads: number;
      workflows: number;
    };
    usagePercentage: {
      leads: number;
      workflows: number;
    };
  }>;
  trends: {
    leadsGrowth: number;
    workflowsGrowth: number;
    aiInteractionsGrowth: number;
    emailsGrowth: number;
    enrichmentsGrowth: number;
  };
} 