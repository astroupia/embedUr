"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Bot,
  Brain,
  Route,
  Users,
  Target,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Zap,
  Lightbulb,
  ArrowRight,
  Save,
  Play
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
const mockQuestionnaires = [
  {
    id: 1,
    name: "B2B SaaS Lead Qualification",
    description: "Qualify B2B SaaS leads based on company size and budget",
    status: "active",
    questions: 8,
    responses: 156,
    conversionRate: 23.5,
    lastUpdated: "2024-01-15",
    aiRouting: true,
    rules: [
      { condition: "Company Size > 50", action: "Route to Enterprise Team" },
      { condition: "Budget > $10k", action: "Route to Sales Team" },
      { condition: "Industry = Tech", action: "Route to Tech Specialist" }
    ]
  },
  {
    id: 2,
    name: "E-commerce Customer Profile",
    description: "Profile e-commerce customers for personalized campaigns",
    status: "draft",
    questions: 12,
    responses: 89,
    conversionRate: 18.2,
    lastUpdated: "2024-01-10",
    aiRouting: false,
    rules: [
      { condition: "Purchase Frequency > 3/month", action: "Route to VIP Team" },
      { condition: "Average Order > $100", action: "Route to Premium Team" }
    ]
  },
  {
    id: 3,
    name: "Real Estate Lead Scoring",
    description: "Score real estate leads based on timeline and budget",
    status: "active",
    questions: 6,
    responses: 234,
    conversionRate: 31.7,
    lastUpdated: "2024-01-12",
    aiRouting: true,
    rules: [
      { condition: "Timeline < 3 months", action: "Route to Urgent Team" },
      { condition: "Budget > $500k", action: "Route to Luxury Team" }
    ]
  }
];

const mockResponses = [
  {
    id: 1,
    leadName: "John Smith",
    company: "TechCorp Inc",
    questionnaire: "B2B SaaS Lead Qualification",
    responses: {
      "Company Size": "100-500 employees",
      "Budget": "$25,000 - $50,000",
      "Timeline": "3-6 months",
      "Decision Maker": "Yes",
      "Industry": "Technology"
    },
    aiDecision: "Route to Enterprise Team",
    confidence: 94,
    timestamp: "2024-01-15T10:30:00Z",
    status: "processed"
  },
  {
    id: 2,
    leadName: "Sarah Johnson",
    company: "StartupXYZ",
    questionnaire: "B2B SaaS Lead Qualification",
    responses: {
      "Company Size": "10-50 employees",
      "Budget": "$5,000 - $10,000",
      "Timeline": "1-3 months",
      "Decision Maker": "No",
      "Industry": "Technology"
    },
    aiDecision: "Route to SMB Team",
    confidence: 87,
    timestamp: "2024-01-15T09:15:00Z",
    status: "pending"
  }
];

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
};

const confidenceColors = {
  high: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

export default function QuestionnairePage() {
  const [activeTab, setActiveTab] = useState("questionnaires");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuestionnaires = mockQuestionnaires.filter(q =>
    q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 90) return "high";
    if (confidence >= 70) return "medium";
    return "low";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Questionnaire & Routing</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage customer profiles and AI routing logic
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Questionnaire
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Questionnaires</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">3</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Responses</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">479</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">AI Routing</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">2</p>
              </div>
              <Bot className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Avg Conversion</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">24.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="routing">AI Routing</TabsTrigger>
        </TabsList>

        <TabsContent value="questionnaires" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search questionnaires..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questionnaires List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestionnaires.map((questionnaire) => (
              <Card key={questionnaire.id} className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {questionnaire.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {questionnaire.description}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[questionnaire.status as keyof typeof statusColors]}>
                      {questionnaire.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-600 dark:text-zinc-400">Questions</p>
                        <p className="font-medium text-zinc-900 dark:text-white">{questionnaire.questions}</p>
                      </div>
                      <div>
                        <p className="text-zinc-600 dark:text-zinc-400">Responses</p>
                        <p className="font-medium text-zinc-900 dark:text-white">{questionnaire.responses}</p>
                      </div>
                      <div>
                        <p className="text-zinc-600 dark:text-zinc-400">Conversion</p>
                        <p className="font-medium text-zinc-900 dark:text-white">{questionnaire.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-zinc-600 dark:text-zinc-400">AI Routing</p>
                        <div className="flex items-center gap-1">
                          {questionnaire.aiRouting ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">{questionnaire.aiRouting ? 'Active' : 'Manual'}</span>
                        </div>
                      </div>
                    </div>

                                         <div className="space-y-2">
                       <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Routing Rules</p>
                       <div className="space-y-1">
                         {questionnaire.rules.slice(0, 2).map((rule, index) => (
                           <div key={index} className="text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded">
                             <span className="font-medium">{rule.condition}</span>
                             <ArrowRight className="h-3 w-3 inline mx-1" />
                             <span>{rule.action}</span>
                           </div>
                         ))}
                         {questionnaire.rules.length > 2 && (
                           <p className="text-xs text-zinc-500 dark:text-zinc-400">
                             +{questionnaire.rules.length - 2} more rules
                           </p>
                         )}
                       </div>
                     </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Updated {new Date(questionnaire.lastUpdated).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-6">
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                Recent Responses
              </CardTitle>
              <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                Latest questionnaire responses and AI decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Questionnaire</TableHead>
                    <TableHead>AI Decision</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockResponses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{response.leadName}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{response.company}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{response.questionnaire}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{response.aiDecision}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${response.confidence}%` }}
                            />
                          </div>
                          <Badge className={confidenceColors[getConfidenceLevel(response.confidence) as keyof typeof confidenceColors]}>
                            {response.confidence}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          response.status === 'processed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }>
                          {response.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {new Date(response.timestamp).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Routing Overview */}
            <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Routing Engine
                </CardTitle>
                <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                  Configure AI-powered routing decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-500" />
                      <span className="font-medium text-zinc-900 dark:text-white">AI Routing Active</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Enabled
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Decisions</span>
                      <span className="font-medium text-zinc-900 dark:text-white">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Accuracy Rate</span>
                      <span className="font-medium text-zinc-900 dark:text-white">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Avg Response Time</span>
                      <span className="font-medium text-zinc-900 dark:text-white">1.2s</span>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure AI Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Routing Rules */}
            <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Route className="h-5 w-5 text-blue-500" />
                  Routing Rules
                </CardTitle>
                <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                  Manage automated routing logic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">Company Size &gt; 100</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Route to Enterprise Team</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">Budget &gt; $10k</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Route to Sales Team</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">Industry = Tech</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Route to Tech Specialist</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      Draft
                    </Badge>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 