"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Calendar,
  Users,
  Eye,
  MousePointer,
  MoreHorizontal,
  TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const campaigns = [
  {
    id: 1,
    name: "Summer Sale Announcement",
    status: "sent",
    sentDate: "2024-01-15",
    recipients: 12500,
    openRate: 24.8,
    clickRate: 3.2,
  },
  {
    id: 2,
    name: "Weekly Newsletter #45",
    status: "draft",
    sentDate: "2024-01-14",
    recipients: 18200,
    openRate: 28.1,
    clickRate: 4.1,
  },
  {
    id: 3,
    name: "Welcome Series - Day 1",
    status: "scheduled",
    sentDate: "2024-01-16",
    recipients: 850,
    openRate: 0,
    clickRate: 0,
  },
  {
    id: 4,
    name: "Product Update Alert",
    status: "sent",
    sentDate: "2024-01-13",
    recipients: 3200,
    openRate: 31.2,
    clickRate: 5.8,
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "sent":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
    case "draft":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
    case "scheduled":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
  }
};

export function RecentCampaigns() {
  return (
    <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Recent Campaigns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="flex items-start justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm flex-shrink-0">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-zinc-900 dark:text-white text-sm truncate">{campaign.name}</h3>
                  <Badge className={`${getStatusColor(campaign.status)} border text-xs flex-shrink-0`}>
                    {campaign.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(campaign.sentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{campaign.recipients.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{campaign.openRate}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-lg">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="outline" className="w-full">
            View All Campaigns
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 