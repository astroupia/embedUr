"use client";

import { useEffect, useState } from "react";
import { Bell, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { Notification } from "@/lib/types/dashboard";

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?unread=true');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'INFO':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return 'border-l-green-500';
      case 'WARNING':
        return 'border-l-yellow-500';
      case 'ERROR':
        return 'border-l-red-500';
      case 'INFO':
      default:
        return 'border-l-blue-500';
    }
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

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  if (loading) {
    return (
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Notifications
          </CardTitle>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
              No notifications
            </p>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${getNotificationColor(notification.level)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                {getNotificationIcon(notification.level)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {notification.message}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatTime(notification.created_at)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
              </div>
            ))
          )}
          {notifications.length > 5 && (
            <div className="text-center pt-2">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View all notifications
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 