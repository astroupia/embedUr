"use client";

import * as React from "react";
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const monthlyData = [
  { month: "Jan", sent: 15420, opened: 4626, clicked: 693, replied: 138 },
  { month: "Feb", sent: 18250, opened: 5475, clicked: 821, replied: 164 },
  { month: "Mar", sent: 21300, opened: 6390, clicked: 958, replied: 191 },
  { month: "Apr", sent: 24180, opened: 7254, clicked: 1088, replied: 217 },
  { month: "May", sent: 26890, opened: 8067, clicked: 1210, replied: 242 },
  { month: "Jun", sent: 29560, opened: 8868, clicked: 1330, replied: 266 },
  { month: "Jul", sent: 32420, opened: 9726, clicked: 1459, replied: 291 },
];

const weeklyData = [
  { day: "Mon", opens: 2840, clicks: 426, replies: 85 },
  { day: "Tue", opens: 3120, clicks: 468, replies: 93 },
  { day: "Wed", opens: 2980, clicks: 447, replies: 89 },
  { day: "Thu", opens: 3250, clicks: 487, replies: 97 },
  { day: "Fri", opens: 2890, clicks: 433, replies: 86 },
  { day: "Sat", opens: 1560, clicks: 234, replies: 46 },
  { day: "Sun", opens: 1420, clicks: 213, replies: 42 },
];

const monthlyChartConfig = {
  sent: {
    label: "Emails Sent",
    color: "var(--chart-1)",
  },
  opened: {
    label: "Opened",
    color: "var(--chart-2)",
  },
  clicked: {
    label: "Clicked",
    color: "var(--chart-3)",
  },
  replied: {
    label: "Replied",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const weeklyChartConfig = {
  opens: {
    label: "Opens",
    color: "var(--chart-1)",
  },
  clicks: {
    label: "Clicks",
    color: "var(--chart-2)",
  },
  replies: {
    label: "Replies",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function EmailAnalytics() {
  const [timeRange, setTimeRange] = React.useState("7m");

  return (
    <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Email Performance
          </CardTitle>
          <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
            Track your email campaign performance over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 7 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7m" className="rounded-lg">
              Last 7 months
            </SelectItem>
            <SelectItem value="3m" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="1m" className="rounded-lg">
              Last month
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-6 px-2 pt-4 sm:px-6 sm:pt-6">
        {/* Monthly Performance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Monthly Trends</h3>
          </div>
          <ChartContainer
            config={monthlyChartConfig}
            className="aspect-auto h-[250px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border"
          >
            <LineChart data={monthlyData}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--muted-foreground)"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line
                dataKey="sent"
                type="monotone"
                stroke="var(--color-sent)"
                strokeWidth={2}
                dot={{ fill: "var(--color-sent)", strokeWidth: 2, r: 4 }}
              />
              <Line
                dataKey="opened"
                type="monotone"
                stroke="var(--color-opened)"
                strokeWidth={2}
                dot={{ fill: "var(--color-opened)", strokeWidth: 2, r: 4 }}
              />
              <Line
                dataKey="clicked"
                type="monotone"
                stroke="var(--color-clicked)"
                strokeWidth={2}
                dot={{ fill: "var(--color-clicked)", strokeWidth: 2, r: 4 }}
              />
              <Line
                dataKey="replied"
                type="monotone"
                stroke="var(--color-replied)"
                strokeWidth={2}
                dot={{ fill: "var(--color-replied)", strokeWidth: 2, r: 4 }}
              />
              <ChartLegend />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Weekly Engagement */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Weekly Engagement</h3>
          </div>
          <ChartContainer
            config={weeklyChartConfig}
            className="aspect-auto h-[150px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border"
          >
            <BarChart data={weeklyData}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--muted-foreground)"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="opens"
                fill="var(--color-opens)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="clicks"
                fill="var(--color-clicks)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="replies"
                fill="var(--color-replies)"
                radius={[4, 4, 0, 0]}
              />
              <ChartLegend />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
} 
