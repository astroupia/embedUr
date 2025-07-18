"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Mail,
  FileText,
  Target,
  Calendar,
  Bot,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { DashboardStats } from "@/lib/types/dashboard";
import { authErrorHandler } from "@/lib/utils/auth-error-handler";

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use the authenticated API client instead of direct fetch
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else if (response.status === 401) {
          console.error('Unauthorized - token may be expired');
          authErrorHandler.handleAuthError(new Error('Unauthorized'));
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Total Leads
          </CardTitle>
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats?.totalLeads.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            All time leads
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Active Campaigns
          </CardTitle>
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-sm">
            <Target className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats?.activeCampaigns || '0'}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Currently running
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Upcoming Bookings
          </CardTitle>
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm">
            <Calendar className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats?.upcomingBookings.count || '0'}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {stats?.upcomingBookings.next ? 'Next: Today' : 'No upcoming'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            AI Interactions
          </CardTitle>
          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats?.aiInteractions.drafts || '0'}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {stats?.aiInteractions.replies || '0'} replies generated
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 