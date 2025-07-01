"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Star,
  ArrowUpRight,
  Trophy,
  Target
} from "lucide-react";

const topCampaigns = [
  {
    id: 1,
    name: "Black Friday Sale",
    openRate: 34.2,
    clickRate: 8.5,
    conversionRate: 2.1,
    revenue: 45200,
    trend: "+15.2%"
  },
  {
    id: 2,
    name: "Product Launch Announcement",
    openRate: 31.8,
    clickRate: 7.2,
    conversionRate: 1.8,
    revenue: 28900,
    trend: "+8.7%"
  },
  {
    id: 3,
    name: "Weekly Newsletter #42",
    openRate: 28.5,
    clickRate: 6.1,
    conversionRate: 1.2,
    revenue: 15600,
    trend: "+5.3%"
  }
];

const topSegments = [
  {
    id: 1,
    name: "Premium Subscribers",
    subscribers: 12500,
    avgOpenRate: 32.1,
    avgClickRate: 7.8,
    growth: "+12.4%"
  },
  {
    id: 2,
    name: "Recent Purchasers",
    subscribers: 8900,
    avgOpenRate: 29.8,
    avgClickRate: 6.9,
    growth: "+8.9%"
  },
  {
    id: 3,
    name: "Engaged Users",
    subscribers: 15600,
    avgOpenRate: 26.4,
    avgClickRate: 5.2,
    growth: "+6.1%"
  }
];

export function TopPerformers() {
  return (
    <div className="space-y-8">
      {/* Top Performing Campaigns */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-sm">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Top Campaigns</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Best performing email campaigns</p>
          </div>
        </div>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-zinc-400 to-zinc-500 text-white' :
                      'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{campaign.name}</h4>
                      <div className="flex items-center space-x-4 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Open: {campaign.openRate}%</span>
                        <span>Click: {campaign.clickRate}%</span>
                        <span>Conv: {campaign.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">${campaign.revenue.toLocaleString()}</div>
                    <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {campaign.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Segments */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Top Segments</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Best performing subscriber segments</p>
          </div>
        </div>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {topSegments.map((segment, index) => (
                <div key={segment.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 font-bold text-sm text-white">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{segment.name}</h4>
                      <div className="flex items-center space-x-4 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{segment.subscribers.toLocaleString()} subscribers</span>
                        <span>Open: {segment.avgOpenRate}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">{segment.avgClickRate}%</div>
                    <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {segment.growth}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-sm">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Performance Summary</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Key performance indicators</p>
          </div>
        </div>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Best Open Rate</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">34.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Best Click Rate</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">8.5%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Best Conversion</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">2.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Revenue</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">$89,700</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 