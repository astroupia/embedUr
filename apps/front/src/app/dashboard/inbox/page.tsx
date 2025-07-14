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
  Mail, 
  Reply, 
  Forward, 
  Archive, 
  Trash2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building2,
  Calendar,
  MessageSquare,
  Bot,
  MoreHorizontal,
  Eye,
  Edit,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for demonstration
const mockMessages = [
  {
    id: 1,
    from: "John Smith",
    fromEmail: "john.smith@techcorp.com",
    company: "TechCorp Inc",
    subject: "Re: Your proposal looks interesting",
    preview: "Thanks for reaching out! I'd love to schedule a call to discuss this further. When would you be available?",
    timestamp: "2024-01-15T10:30:00Z",
    status: "unread",
    type: "reply",
    aiHandled: false,
    sentiment: "positive",
    threadId: "thread_1",
    campaignId: "campaign_1"
  },
  {
    id: 2,
    from: "Sarah Johnson",
    fromEmail: "sarah.j@startupxyz.com",
    company: "StartupXYZ",
    subject: "Re: Quick question about your services",
    preview: "This sounds exactly like what we need. Can you send over some case studies?",
    timestamp: "2024-01-15T09:15:00Z",
    status: "read",
    type: "reply",
    aiHandled: true,
    sentiment: "positive",
    threadId: "thread_2",
    campaignId: "campaign_1"
  },
  {
    id: 3,
    from: "Mike Chen",
    fromEmail: "mike.chen@enterprise.com",
    company: "Enterprise Solutions",
    subject: "Not interested at this time",
    preview: "Thanks but we're not looking for this type of solution right now.",
    timestamp: "2024-01-15T08:45:00Z",
    status: "read",
    type: "reply",
    aiHandled: true,
    sentiment: "negative",
    threadId: "thread_3",
    campaignId: "campaign_2"
  },
  {
    id: 4,
    from: "Emily Davis",
    fromEmail: "emily.davis@innovate.com",
    company: "Innovate Labs",
    subject: "Re: Let's connect",
    preview: "I'd be happy to hop on a call. What's your availability like this week?",
    timestamp: "2024-01-14T16:20:00Z",
    status: "read",
    type: "reply",
    aiHandled: false,
    sentiment: "positive",
    threadId: "thread_4",
    campaignId: "campaign_1"
  },
  {
    id: 5,
    from: "David Wilson",
    fromEmail: "david.wilson@scaleup.com",
    company: "ScaleUp Ventures",
    subject: "Re: Partnership opportunity",
    preview: "This could be a great fit. Can you tell me more about your pricing?",
    timestamp: "2024-01-14T14:30:00Z",
    status: "read",
    type: "reply",
    aiHandled: true,
    sentiment: "positive",
    threadId: "thread_5",
    campaignId: "campaign_3"
  }
];

const statusColors = {
  unread: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  read: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
};

const sentimentColors = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
};

export default function InboxPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<typeof mockMessages[0] | null>(null);

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = 
      message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || message.status === selectedStatus;
    const matchesSentiment = selectedSentiment === "all" || message.sentiment === selectedSentiment;
    
    return matchesSearch && matchesStatus && matchesSentiment;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Inbox</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage email replies and conversations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Replies</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">1,247</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">AI Handled</p>
                <p className="text-2xl font-bold text-green-600">892</p>
              </div>
              <Bot className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Positive</p>
                <p className="text-2xl font-bold text-green-600">734</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Unread</p>
                <p className="text-2xl font-bold text-blue-600">23</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-sm"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-sm"
            >
              <option value="all">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                Messages
              </CardTitle>
              <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                {filteredMessages.length} messages
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {message.from.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-white truncate">
                            {message.from}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {message.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {message.aiHandled && (
                          <Bot className="h-3 w-3 text-green-500" />
                        )}
                        <Badge className={statusColors[message.status as keyof typeof statusColors]}>
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="font-medium text-sm text-zinc-900 dark:text-white mb-1">
                      {message.subject}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                      {message.preview}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={sentimentColors[message.sentiment as keyof typeof sentimentColors]}>
                        {message.sentiment}
                      </Badge>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {selectedMessage.subject}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {selectedMessage.from} ({selectedMessage.fromEmail})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {selectedMessage.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {new Date(selectedMessage.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={sentimentColors[selectedMessage.sentiment as keyof typeof sentimentColors]}>
                      {selectedMessage.sentiment}
                    </Badge>
                    {selectedMessage.aiHandled && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        AI Handled
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-zinc-900 dark:text-white leading-relaxed">
                    {selectedMessage.preview}
                  </p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-medium text-zinc-900 dark:text-white">Actions</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      <Forward className="h-4 w-4 mr-2" />
                      Forward
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      Star
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                    Select a message
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Choose a message from the list to view its details
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 