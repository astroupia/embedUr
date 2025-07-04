"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { 
  Calendar,
  Target,
  Send,
  Eye,
  MousePointer,
  Users,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart,
  Lightbulb
} from "lucide-react";

// Mock data for campaign performance over time
const campaignPerformanceData = [
  { day: "Mon", sent: 8500, opened: 2125, clicked: 340, unsubscribed: 25 },
  { day: "Tue", sent: 9200, opened: 2300, clicked: 368, unsubscribed: 28 },
  { day: "Wed", sent: 7800, opened: 1950, clicked: 312, unsubscribed: 22 },
  { day: "Thu", sent: 10500, opened: 2625, clicked: 420, unsubscribed: 35 },
  { day: "Fri", sent: 11200, opened: 2800, clicked: 448, unsubscribed: 38 },
  { day: "Sat", sent: 6800, opened: 1700, clicked: 272, unsubscribed: 18 },
  { day: "Sun", sent: 7200, opened: 1800, clicked: 288, unsubscribed: 20 },
];

// Mock data for subscriber growth
const subscriberGrowthData = [
  { month: "Jan", new: 1200, total: 42000 },
  { month: "Feb", new: 1350, total: 43350 },
  { month: "Mar", new: 1100, total: 44450 },
  { month: "Apr", new: 1600, total: 46050 },
  { month: "May", new: 1800, total: 47850 },
  { month: "Jun", new: 2100, total: 49950 },
  { month: "Jul", new: 2400, total: 52350 },
];

const upcomingCampaigns = [
  {
    id: 1,
    name: "Holiday Season Preview",
    scheduledDate: "2024-01-20",
    recipients: 18500,
    type: "Promotional",
    status: "Ready to Send"
  },
  {
    id: 2,
    name: "Monthly Newsletter",
    scheduledDate: "2024-01-25",
    recipients: 45200,
    type: "Newsletter",
    status: "In Review"
  },
  {
    id: 3,
    name: "Product Update",
    scheduledDate: "2024-01-28",
    recipients: 3200,
    type: "Transactional",
    status: "Draft"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Ready to Send":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
    case "In Review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case "Draft":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
  }
};

export function CampaignOverview() {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Campaign Overview</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Comprehensive view of your email campaign performance</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total Subscribers
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">52,350</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                +2,400 this month
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Avg. Open Rate
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-sm">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">24.8%</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                +2.1% vs last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Avg. Click Rate
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm">
                <MousePointer className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">3.2%</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                -0.5% vs last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Unsubscribe Rate
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">0.3%</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                -0.1% vs last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campaign Performance Chart */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Weekly Performance</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Campaign performance over the last week</p>
          </div>
        </div>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={campaignPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Sent"
                />
                <Area 
                  type="monotone" 
                  dataKey="opened" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  name="Opened"
                />
                <Area 
                  type="monotone" 
                  dataKey="clicked" 
                  stackId="1" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.3}
                  name="Clicked"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscriber Growth and Upcoming Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-sm">
              <PieChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Subscriber Growth</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Monthly subscriber acquisition trends</p>
            </div>
          </div>
          
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subscriberGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="new" fill="#3b82f6" name="New Subscribers" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 shadow-sm">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Upcoming Campaigns</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Scheduled and draft campaigns</p>
            </div>
          </div>
          
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{campaign.name}</h4>
                        <Badge className={`${getStatusColor(campaign.status)} border`}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(campaign.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <span>{campaign.recipients.toLocaleString()} recipients</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 shadow-sm">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">AI Insights & Recommendations</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Data-driven insights to improve your campaigns</p>
          </div>
        </div>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Positive Trends
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-zinc-700 dark:text-zinc-300">Open rates increased by 2.1% this month</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-zinc-700 dark:text-zinc-300">Subscriber growth rate is 15% above industry average</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-zinc-700 dark:text-zinc-300">Unsubscribe rate decreased by 0.1%</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Recommendations
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-zinc-700 dark:text-zinc-300">Send emails between 6-8 PM for better engagement</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-zinc-700 dark:text-zinc-300">Include more personalized content to improve click rates</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-zinc-700 dark:text-zinc-300">Test subject lines with emojis for higher open rates</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 