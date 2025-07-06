import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { EmailAnalytics } from "@/components/dashboard/email-analytics";
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Notifications } from "@/components/dashboard/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Play, FileText, Building2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <DashboardStats />
      
      {/* Quick Actions */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              aria-label="Import CSV file with leads"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              aria-label="Launch new campaign"
            >
              <Play className="h-4 w-4" />
              Launch Campaign
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              aria-label="View workflow logs"
            >
              <FileText className="h-4 w-4" />
              View Workflow Logs
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <EmailAnalytics />
        </div>
        
        {/* Right Sidebar - Takes 1/3 of the space */}
        <div className="lg:col-span-1 space-y-6">
          {/* Company Context */}
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Acme Corp</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Active Company</p>
                </div>
                <Button variant="outline" size="sm">
                  Switch
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications */}
          <Notifications />
          
          {/* Recent Activity */}
          <RecentActivity />
          
          {/* Recent Campaigns */}
          <RecentCampaigns />
        </div>
      </div>
    </div>
  );
} 