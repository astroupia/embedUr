"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Database,
  Bot,
  Mail,
  Calendar,
  Users,
  Globe,
  Shield,
  BarChart3,
  Settings
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for demonstration
const mockUsageData = {
  smartlead: {
    name: "Smartlead",
    icon: Mail,
    current: 1250,
    limit: 2000,
    resetDate: "2024-02-01",
    status: "healthy",
    trend: "up",
    services: [
      { name: "Email Sends", used: 850, limit: 1000, percentage: 85 },
      { name: "Email Opens", used: 320, limit: 500, percentage: 64 },
      { name: "Email Replies", used: 80, limit: 200, percentage: 40 }
    ]
  },
  openai: {
    name: "OpenAI",
    icon: Bot,
    current: 450,
    limit: 1000,
    resetDate: "2024-02-01",
    status: "healthy",
    trend: "up",
    services: [
      { name: "GPT-4 Tokens", used: 250, limit: 500, percentage: 50 },
      { name: "GPT-3.5 Tokens", used: 200, limit: 500, percentage: 40 }
    ]
  },
  calendly: {
    name: "Calendly",
    icon: Calendar,
    current: 45,
    limit: 100,
    resetDate: "2024-02-01",
    status: "warning",
    trend: "up",
    services: [
      { name: "Bookings", used: 45, limit: 100, percentage: 45 }
    ]
  },
  apollo: {
    name: "Apollo",
    icon: Users,
    current: 1800,
    limit: 2000,
    resetDate: "2024-02-01",
    status: "healthy",
    trend: "down",
    services: [
      { name: "Lead Scrapes", used: 1200, limit: 1500, percentage: 80 },
      { name: "Email Verifications", used: 600, limit: 500, percentage: 120 }
    ]
  },
  dropcontact: {
    name: "Dropcontact",
    icon: Database,
    current: 320,
    limit: 500,
    resetDate: "2024-02-01",
    status: "healthy",
    trend: "up",
    services: [
      { name: "Lead Enrichment", used: 320, limit: 500, percentage: 64 }
    ]
  },
  zerobounce: {
    name: "ZeroBounce",
    icon: Shield,
    current: 850,
    limit: 1000,
    resetDate: "2024-02-01",
    status: "healthy",
    trend: "up",
    services: [
      { name: "Email Verification", used: 850, limit: 1000, percentage: 85 }
    ]
  }
};

const statusColors = {
  healthy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const trendColors = {
  up: "text-green-600",
  down: "text-red-600",
  stable: "text-gray-600"
};

export default function UsagePage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Usage & Quotas</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Monitor API usage and service limits
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total API Calls</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">4,665</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Services Used</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">6</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Avg Usage</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">78%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Reset Date</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">Feb 1</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(mockUsageData).map(([key, service]) => {
          const Icon = service.icon;
          const percentage = getUsagePercentage(service.current, service.limit);
          const isOverLimit = service.current > service.limit;
          
          return (
            <Card 
              key={key}
              className={`border-0 bg-white dark:bg-zinc-900 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                selectedService === key ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedService(selectedService === key ? null : key)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                        {service.current.toLocaleString()} / {service.limit.toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[service.status as keyof typeof statusColors]}>
                      {service.status}
                    </Badge>
                    {service.trend === 'up' ? (
                      <TrendingUp className={`h-4 w-4 ${trendColors[service.trend as keyof typeof trendColors]}`} />
                    ) : service.trend === 'down' ? (
                      <TrendingDown className={`h-4 w-4 ${trendColors[service.trend as keyof typeof trendColors]}`} />
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Usage
                      </span>
                      <span className={`text-sm font-bold ${getUsageColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {isOverLimit && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Over limit by {(service.current - service.limit).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Resets on {new Date(service.resetDate).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Service View */}
      {selectedService && (
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
              {mockUsageData[selectedService as keyof typeof mockUsageData].name} - Detailed Usage
            </CardTitle>
            <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
              Breakdown by service type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Usage %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsageData[selectedService as keyof typeof mockUsageData].services.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.used.toLocaleString()}</TableCell>
                    <TableCell>{service.limit.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(service.percentage)}`}
                            style={{ width: `${Math.min(service.percentage, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getUsageColor(service.percentage)}`}>
                          {service.percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        service.percentage >= 90 ? statusColors.critical :
                        service.percentage >= 75 ? statusColors.warning :
                        statusColors.healthy
                      }>
                        {service.percentage >= 90 ? 'Critical' :
                         service.percentage >= 75 ? 'Warning' : 'Healthy'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Usage History */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Usage History
          </CardTitle>
          <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
            Daily API usage over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Usage history chart will be displayed here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 