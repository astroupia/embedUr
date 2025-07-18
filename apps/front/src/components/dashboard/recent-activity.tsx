"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { WorkflowRun } from "@/lib/types/dashboard";
import { authErrorHandler } from "@/lib/utils/auth-error-handler";

export function RecentActivity() {
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflowRuns = async () => {
      try {
        // Use the authenticated API client instead of direct fetch
        const response = await fetch('/api/workflow_runs/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setWorkflowRuns(data);
        } else if (response.status === 401) {
          console.error('Unauthorized - token may be expired');
          authErrorHandler.handleAuthError(new Error('Unauthorized'));
        }
      } catch (error) {
        console.error('Error fetching workflow runs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowRuns();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'RUNNING':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 dark:text-green-400';
      case 'FAILED':
        return 'text-red-600 dark:text-red-400';
      case 'RUNNING':
        return 'text-blue-600 dark:text-blue-400';
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatWorkflowType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowRuns.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
              No recent activity
            </p>
          ) : (
            workflowRuns.map((run) => (
              <div key={run.id} className="flex items-start space-x-3">
                {getStatusIcon(run.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {formatWorkflowType(run.workflow_type)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {run.message || 'Workflow completed'}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatTime(run.created_at)}
                  </p>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(run.status)}`}>
                  {run.status}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 