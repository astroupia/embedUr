"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Calendar,
  Download,
  Filter
} from "lucide-react";

// Mock data for analytics
const performanceData = [
  { date: "Jan", sent: 12000, opened: 3000, clicked: 400, unsubscribed: 25 },
  { date: "Feb", sent: 15000, opened: 3750, clicked: 525, unsubscribed: 28 },
  { date: "Mar", sent: 18000, opened: 4320, clicked: 648, unsubscribed: 22 },
  { date: "Apr", sent: 22000, opened: 5280, clicked: 792, unsubscribed: 35 },
  { date: "May", sent: 25000, opened: 6000, clicked: 900, unsubscribed: 38 },
  { date: "Jun", sent: 28000, opened: 6720, clicked: 1008, unsubscribed: 18 },
  { date: "Jul", sent: 32000, opened: 7680, clicked: 1152, unsubscribed: 20 },
];

const subscriberGrowthData = [
  { month: "Jan", new: 1200, total: 42000 },
  { month: "Feb", new: 1350, total: 43350 },
  { month: "Mar", new: 1100, total: 44450 },
  { month: "Apr", new: 1600, total: 46050 },
  { month: "May", new: 1800, total: 47850 },
  { month: "Jun", new: 2100, total: 49950 },
  { month: "Jul", new: 2400, total: 52350 },
];

const emailTypesData = [
  { name: "Newsletter", value: 45, color: "#3b82f6" },
  { name: "Promotional", value: 30, color: "#ef4444" },
  { name: "Transactional", value: 15, color: "#10b981" },
  { name: "Welcome", value: 10, color: "#f59e0b" },
];

const engagementByTimeData = [
  { time: "9 AM", opens: 1200, clicks: 180 },
  { time: "12 PM", opens: 2100, clicks: 315 },
  { time: "3 PM", opens: 1800, clicks: 270 },
  { time: "6 PM", opens: 2400, clicks: 360 },
  { time: "9 PM", opens: 900, clicks: 135 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Analytics</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Detailed performance insights and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
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
            <p className="text-xs text-green-600 dark:text-green-400">
              +2,400 this month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
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
            <p className="text-xs text-green-600 dark:text-green-400">
              +2.1% vs last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
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
            <p className="text-xs text-red-600 dark:text-red-400">
              -0.5% vs last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">$89,700</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              +15.2% this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber Growth */}
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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

        {/* Email Types Distribution */}
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader>
            <CardTitle>Email Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emailTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {emailTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {emailTypesData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement by Time */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle>Engagement by Time of Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementByTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="opens" fill="#3b82f6" name="Opens" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" fill="#10b981" name="Clicks" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 