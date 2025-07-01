import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { EmailAnalytics } from "@/components/dashboard/email-analytics";
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <DashboardStats />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <EmailAnalytics />
        </div>
        
        {/* Recent Campaigns - Takes 1/3 of the space */}
        <div className="lg:col-span-1">
          <RecentCampaigns />
        </div>
      </div>
    </div>
  );
} 