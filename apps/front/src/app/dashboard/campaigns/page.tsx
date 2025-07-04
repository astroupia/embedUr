import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Calendar,
  Users,
  Eye,
  MousePointer,
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2
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
    type: "Promotional",
    status: "sent",
    sentDate: "2024-01-15",
    recipients: 12500,
    openRate: 24.8,
    clickRate: 3.2,
    revenue: 45200
  },
  {
    id: 2,
    name: "Weekly Newsletter #45",
    type: "Newsletter",
    status: "draft",
    sentDate: "2024-01-14",
    recipients: 18200,
    openRate: 28.1,
    clickRate: 4.1,
    revenue: 0
  },
  {
    id: 3,
    name: "Welcome Series - Day 1",
    type: "Welcome",
    status: "scheduled",
    sentDate: "2024-01-16",
    recipients: 850,
    openRate: 0,
    clickRate: 0,
    revenue: 0
  },
  {
    id: 4,
    name: "Product Update Alert",
    type: "Transactional",
    status: "sent",
    sentDate: "2024-01-13",
    recipients: 3200,
    openRate: 31.2,
    clickRate: 5.8,
    revenue: 8900
  },
  {
    id: 5,
    name: "Holiday Special Offer",
    type: "Promotional",
    status: "sent",
    sentDate: "2024-01-12",
    recipients: 15600,
    openRate: 22.4,
    clickRate: 2.9,
    revenue: 28900
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

const getTypeColor = (type: string) => {
  switch (type) {
    case "Promotional":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800";
    case "Newsletter":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "Welcome":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case "Transactional":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
  }
};

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Campaigns</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage your email campaigns</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{campaign.name}</h3>
                      <Badge className={`${getTypeColor(campaign.type)} border`}>
                        {campaign.type}
                      </Badge>
                      <Badge className={`${getStatusColor(campaign.status)} border`}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(campaign.sentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{campaign.recipients.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{campaign.openRate}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointer className="h-4 w-4" />
                        <span>{campaign.clickRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {campaign.revenue > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                        ${campaign.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Revenue</div>
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Send Now
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 