"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { 
  Plus, 
  Search, 
  Filter, 
  Target,
  Calendar,
  Users,
  Eye,
  MoreHorizontal,
  Play,
  Edit,
  Copy,
  Trash2,
  Loader2,
  X,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Brain,
  Sparkles,
  BarChart3,
  Download,
  RefreshCw
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  targetAudienceTranslator, 
  type TargetAudienceTranslator, 
  type QueryTargetAudienceTranslatorRequest, 
  type CreateTargetAudienceTranslatorRequest,
  type TargetAudienceTranslatorStats
} from "@/lib/api";
import { InputFormat } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Status badge component
function StatusBadge({ status }: { status: TargetAudienceTranslator['status'] }) {
  const getStatusConfig = (status: TargetAudienceTranslator['status']) => {
    switch (status) {
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
          icon: Clock,
          label: "Pending"
        };
      case "PROCESSING":
        return {
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          icon: Loader2,
          label: "Processing"
        };
      case "SUCCESS":
        return {
          color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
          icon: CheckCircle,
          label: "Success"
        };
      case "FAILED":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
          icon: AlertCircle,
          label: "Failed"
        };
      default:
        return {
          color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
          icon: Clock,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border flex items-center gap-1`}>
      {status === "PROCESSING" ? (
        <Icon className="h-3 w-3 animate-spin" />
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {config.label}
    </Badge>
  );
}

// Input format badge component
function InputFormatBadge({ format }: { format: InputFormat }) {
  const getFormatConfig = (format: InputFormat) => {
    switch (format) {
      case "FREE_TEXT":
        return {
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800",
          icon: Brain,
          label: "Natural Language"
        };
      case "STRUCTURED_JSON":
        return {
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          icon: FileText,
          label: "Structured JSON"
        };
      case "CSV_UPLOAD":
        return {
          color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
          icon: Upload,
          label: "CSV Upload"
        };
      case "FORM_INPUT":
        return {
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800",
          icon: Edit,
          label: "Form Input"
        };
      default:
        return {
          color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
          icon: FileText,
          label: format
        };
    }
  };

  const config = getFormatConfig(format);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Create Translation Modal Component
function CreateTranslationModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [activeTab, setActiveTab] = useState("free-text");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTargetAudienceTranslatorRequest>({
    inputFormat: InputFormat.FREE_TEXT,
    targetAudienceData: '',
  });
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.targetAudienceData.trim()) {
      showError('Target audience data is required');
      return;
    }

    setIsLoading(true);
    try {
      await targetAudienceTranslator.create(formData);
      showSuccess('Target audience translation started successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        inputFormat: InputFormat.FREE_TEXT,
        targetAudienceData: '',
      });
      setActiveTab("free-text");
    } catch (error) {
      console.error('Failed to create translation:', error);
      showError(error instanceof Error ? error.message : 'Failed to create translation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTargetAudienceTranslatorRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormatChange = (format: InputFormat) => {
    setFormData(prev => ({
      ...prev,
      inputFormat: format,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create Target Audience Translation
          </DialogTitle>
          <DialogDescription>
            Define your target audience using AI to generate structured lead data and enrichment requirements.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="free-text">Natural Language</TabsTrigger>
              <TabsTrigger value="structured">Structured</TabsTrigger>
              <TabsTrigger value="csv">CSV Upload</TabsTrigger>
              <TabsTrigger value="form">Form</TabsTrigger>
            </TabsList>

            <TabsContent value="free-text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="free-text">Describe your target audience in natural language</Label>
                <Textarea
                  id="free-text"
                  placeholder="e.g., I want to target CTOs at B2B SaaS companies in Europe with 50-200 employees that are VC-backed..."
                  value={formData.targetAudienceData}
                  onChange={(e) => {
                    handleInputChange('targetAudienceData', e.target.value);
                    handleFormatChange(InputFormat.FREE_TEXT);
                  }}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Be as specific as possible about job titles, industries, locations, company size, and other criteria.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="structured" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="structured-json">Structured JSON data</Label>
                <Textarea
                  id="structured-json"
                  placeholder='{"jobTitles": ["CTO", "VP Engineering"], "industries": ["B2B SaaS"], "location": "Europe", "companySize": "50-200 employees", "fundingStatus": "VC-backed"}'
                  value={formData.targetAudienceData}
                  onChange={(e) => {
                    handleInputChange('targetAudienceData', e.target.value);
                    handleFormatChange(InputFormat.STRUCTURED_JSON);
                  }}
                  rows={6}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Provide structured JSON with targeting criteria.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="csv" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-data">CSV data with headers</Label>
                <Textarea
                  id="csv-data"
                  placeholder="jobTitle,industry,location,companySize&#10;CTO,B2B SaaS,London,50-200&#10;VP Engineering,Technology,Berlin,100-500"
                  value={formData.targetAudienceData}
                  onChange={(e) => {
                    handleInputChange('targetAudienceData', e.target.value);
                    handleFormatChange(InputFormat.CSV_UPLOAD);
                  }}
                  rows={6}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Include header row and at least one data row. Each column represents a targeting criterion.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="form" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-titles">Job Titles</Label>
                  <Input
                    id="job-titles"
                    placeholder="CTO, VP Engineering"
                    onChange={(e) => {
                      const formDataObj = {
                        jobTitles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      };
                      handleInputChange('targetAudienceData', JSON.stringify(formDataObj));
                      handleFormatChange(InputFormat.FORM_INPUT);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industries">Industries</Label>
                  <Input
                    id="industries"
                    placeholder="B2B SaaS, Technology"
                    onChange={(e) => {
                      const current = formData.targetAudienceData ? JSON.parse(formData.targetAudienceData) : {};
                      const formDataObj = {
                        ...current,
                        industries: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      };
                      handleInputChange('targetAudienceData', JSON.stringify(formDataObj));
                      handleFormatChange(InputFormat.FORM_INPUT);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Europe, New York"
                    onChange={(e) => {
                      const current = formData.targetAudienceData ? JSON.parse(formData.targetAudienceData) : {};
                      const formDataObj = {
                        ...current,
                        location: e.target.value
                      };
                      handleInputChange('targetAudienceData', JSON.stringify(formDataObj));
                      handleFormatChange(InputFormat.FORM_INPUT);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-size">Company Size</Label>
                  <Input
                    id="company-size"
                    placeholder="50-200 employees"
                    onChange={(e) => {
                      const current = formData.targetAudienceData ? JSON.parse(formData.targetAudienceData) : {};
                      const formDataObj = {
                        ...current,
                        companySize: e.target.value
                      };
                      handleInputChange('targetAudienceData', JSON.stringify(formDataObj));
                      handleFormatChange(InputFormat.FORM_INPUT);
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Translation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Translation Results Component
function TranslationResults({ translation }: { translation: TargetAudienceTranslator }) {
  if (!translation.leads || !translation.enrichmentSchema || !translation.interpretedCriteria) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Confidence Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Confidence Score</span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={translation.confidence ? translation.confidence * 100 : 0} className="w-24" />
          <span className="text-sm font-medium">
            {translation.confidence ? Math.round(translation.confidence * 100) : 0}%
          </span>
        </div>
      </div>

      <Separator />

      {/* Interpreted Criteria */}
      <div>
        <h4 className="text-sm font-medium mb-3">Interpreted Criteria</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {translation.interpretedCriteria.jobTitles && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Job Titles</Label>
              <div className="flex flex-wrap gap-1">
                {translation.interpretedCriteria.jobTitles.map((title, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {translation.interpretedCriteria.industries && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Industries</Label>
              <div className="flex flex-wrap gap-1">
                {translation.interpretedCriteria.industries.map((industry, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {translation.interpretedCriteria.location && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Badge variant="secondary" className="text-xs">
                {translation.interpretedCriteria.location}
              </Badge>
            </div>
          )}
          {translation.interpretedCriteria.companySize && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Company Size</Label>
              <Badge variant="secondary" className="text-xs">
                {translation.interpretedCriteria.companySize}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Generated Leads Preview */}
      <div>
        <h4 className="text-sm font-medium mb-3">Generated Leads Preview</h4>
        <div className="space-y-2">
          {translation.leads.slice(0, 3).map((lead, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{lead.fullName || `Sample Lead ${index + 1}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.jobTitle} • {lead.companyName}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {lead.location || 'Unknown'}
              </Badge>
            </div>
          ))}
          {translation.leads.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{translation.leads.length - 3} more leads generated
            </p>
          )}
        </div>
      </div>

      {/* Reasoning */}
      {translation.reasoning && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-2">AI Reasoning</h4>
            <p className="text-sm text-muted-foreground">{translation.reasoning}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function TargetAudiencePage() {
  const [translations, setTranslations] = useState<TargetAudienceTranslator[]>([]);
  const [stats, setStats] = useState<TargetAudienceTranslatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QueryTargetAudienceTranslatorRequest>({
    take: 20,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<TargetAudienceTranslator | null>(null);

  // Fetch translations and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [translationsResponse, statsResponse] = await Promise.all([
        targetAudienceTranslator.getAll({
          ...filters,
          search: searchTerm || undefined,
        }),
        targetAudienceTranslator.getStats()
      ]);
      
      setTranslations(translationsResponse.data);
      setStats(statsResponse);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [filters, searchTerm]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle status filter
  const handleStatusFilter = (status: TargetAudienceTranslator['status'] | 'ALL') => {
    setFilters(prev => ({
      ...prev,
      status: status === 'ALL' ? undefined : status,
    }));
  };

  // Handle retry
  const handleRetry = async (id: string) => {
    try {
      await targetAudienceTranslator.retry(id);
      fetchData(); // Refresh the list
    } catch (err) {
      console.error('Failed to retry translation:', err);
      setError(err instanceof Error ? err.message : 'Failed to retry translation');
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Target Audience Translator</h1>
            <p className="text-zinc-600 dark:text-zinc-400">AI-powered target audience analysis</p>
          </div>
        </div>
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              <p className="mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Target Audience Translator</h1>
          <p className="text-zinc-600 dark:text-zinc-400">AI-powered target audience analysis and lead generation</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Translation
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Translations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.successful}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                placeholder="Search translations..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status: {filters.status || 'All'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusFilter('ALL')}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter('PENDING')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter('PROCESSING')}>
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter('SUCCESS')}>
                  Success
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter('FAILED')}>
                  Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Translations List */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Translations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">Loading translations...</span>
            </div>
          ) : translations.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No translations found</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                {searchTerm || filters.status ? 'Try adjusting your search or filters.' : 'Get started by creating your first target audience translation.'}
              </p>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create Translation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {translations.map((translation) => (
                <div key={translation.id} className="flex items-center justify-between p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          Translation #{translation.id.slice(-8)}
                        </h3>
                        <StatusBadge status={translation.status} />
                        <InputFormatBadge format={translation.inputFormat} />
                        {translation.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(translation.confidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(translation.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{translation.leads?.length || 0} leads generated</span>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-2xl truncate">
                        {translation.targetAudienceData}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTranslation(translation)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {translation.status === 'FAILED' && (
                          <DropdownMenuItem onClick={() => handleRetry(translation.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Results
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Translation Modal */}
      <CreateTranslationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* View Translation Results Modal */}
      <Dialog open={!!selectedTranslation} onOpenChange={() => setSelectedTranslation(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Translation Results
            </DialogTitle>
            <DialogDescription>
              AI analysis and generated lead data
            </DialogDescription>
          </DialogHeader>
          
          {selectedTranslation && (
            <div className="space-y-6">
              {/* Translation Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <StatusBadge status={selectedTranslation.status} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Input Format</Label>
                  <InputFormatBadge format={selectedTranslation.inputFormat} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <p className="text-sm">{formatDate(selectedTranslation.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Leads Generated</Label>
                  <p className="text-sm">{selectedTranslation.leads?.length || 0}</p>
                </div>
              </div>

              <Separator />

              {/* Original Input */}
              <div>
                <Label className="text-xs text-muted-foreground">Original Input</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{selectedTranslation.targetAudienceData}</p>
                </div>
              </div>

              <Separator />

              {/* Results */}
              {selectedTranslation.status === 'SUCCESS' && (
                <TranslationResults translation={selectedTranslation} />
              )}

              {/* Error Message */}
              {selectedTranslation.status === 'FAILED' && selectedTranslation.errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">Error</span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">{selectedTranslation.errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 