"use client";


import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Mail,
  FileText,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Total Subscribers
          </CardTitle>
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">52,350</div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            +2,400 this month
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Avg. Open Rate
          </CardTitle>
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-sm">
            <Eye className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">24.8%</div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            +2.1% vs last month
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Active Campaigns
          </CardTitle>
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm">
            <Mail className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">12</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            3 scheduled, 9 drafts
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Templates
          </CardTitle>
          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm">
            <FileText className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">24</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            5 categories
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 