import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Users, 
  Mail,
  Calendar,
  Eye,
  MousePointer,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Filter,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const segments = [
  {
    id: 1,
    name: "Premium Subscribers",
    description: "High-value customers with premium subscriptions",
    subscribers: 12500,
    avgOpenRate: 32.1,
    avgClickRate: 7.8,
    lastUpdated: "2024-01-15",
    status: "active"
  },
  {
    id: 2,
    name: "Recent Purchasers",
    description: "Customers who made a purchase in the last 30 days",
    subscribers: 8900,
    avgOpenRate: 29.8,
    avgClickRate: 6.9,
    lastUpdated: "2024-01-14",
    status: "active"
  },
  {
    id: 3,
    name: "Engaged Users",
    description: "Users who regularly open and click emails",
    subscribers: 15600,
    avgOpenRate: 26.4,
    avgClickRate: 5.2,
    lastUpdated: "2024-01-13",
    status: "active"
  },
  {
    id: 4,
    name: "Inactive Users",
    description: "Users who haven't opened emails in 90+ days",
    subscribers: 3200,
    avgOpenRate: 8.2,
    avgClickRate: 1.1,
    lastUpdated: "2024-01-12",
    status: "inactive"
  },
  {
    id: 5,
    name: "New Subscribers",
    description: "Users who subscribed in the last 7 days",
    subscribers: 850,
    avgOpenRate: 18.5,
    avgClickRate: 3.4,
    lastUpdated: "2024-01-11",
    status: "active"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
    case "inactive":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
  }
};

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Segments</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage your subscriber segments and lists</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Segment
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                placeholder="Search segments..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Segments List */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle>All Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segments.map((segment) => (
              <div key={segment.id} className="flex items-center justify-between p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{segment.name}</h3>
                      <Badge className={`${getStatusColor(segment.status)} border`}>
                        {segment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{segment.description}</p>
                    <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{segment.subscribers.toLocaleString()} subscribers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{segment.avgOpenRate}% avg open</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointer className="h-4 w-4" />
                        <span>{segment.avgClickRate}% avg click</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Updated {new Date(segment.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    View Details
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Segment
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Campaign
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Segments
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">5</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Active segments
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Subscribers
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-sm">
              <Mail className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">40,050</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Across all segments
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Avg. Performance
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">23.2%</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Average open rate
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 