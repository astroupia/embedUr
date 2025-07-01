"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", sent: 12000, opened: 3000, clicked: 400 },
  { month: "Feb", sent: 15000, opened: 3750, clicked: 525 },
  { month: "Mar", sent: 18000, opened: 4320, clicked: 648 },
  { month: "Apr", sent: 22000, opened: 5280, clicked: 792 },
  { month: "May", sent: 25000, opened: 6000, clicked: 900 },
  { month: "Jun", sent: 28000, opened: 6720, clicked: 1008 },
  { month: "Jul", sent: 32000, opened: 7680, clicked: 1152 },
];

const weeklyData = [
  { day: "Mon", opens: 1200, clicks: 180 },
  { day: "Tue", opens: 2100, clicks: 315 },
  { day: "Wed", opens: 1800, clicks: 270 },
  { day: "Thu", opens: 2400, clicks: 360 },
  { day: "Fri", opens: 1900, clicks: 285 },
  { day: "Sat", opens: 900, clicks: 135 },
  { day: "Sun", opens: 800, clicks: 120 },
];

export function EmailAnalytics() {
  return (
    <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Email Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Performance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Monthly Trends</h3>
          </div>
          <div className="h-[250px] [&_.recharts-cartesian-axis-tick_text]:fill-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="clicked"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Engagement */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Weekly Engagement</h3>
          </div>
          <div className="h-[150px] [&_.recharts-cartesian-axis-tick_text]:fill-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="opens"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="clicks"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 