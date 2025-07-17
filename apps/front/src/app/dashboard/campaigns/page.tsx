"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Mail, 
  Calendar,
  Users,
  Eye,
  MousePointer,
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Loader2,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { campaigns, aiPersonas, workflows, type Campaign, type QueryCampaignsRequest, type UpdateCampaignRequest, type CreateCampaignRequest, type AIPersona, type Workflow } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

// Inline Editable Campaign Name Component
function EditableCampaignName({ 
  campaign, 
  onUpdate 
}: { 
  campaign: Campaign; 
  onUpdate: () => void; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(campaign.name);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Campaign name cannot be empty');
      return;
    }

    if (name.trim() === campaign.name) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await campaigns.update(campaign.id, { name: name.trim() });
      showSuccess('Campaign name updated successfully!');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update campaign name:', error);
      showError(error instanceof Error ? error.message : 'Failed to update campaign name');
      setName(campaign.name); // Reset to original name on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(campaign.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-8 text-sm font-semibold"
          autoFocus
          disabled={isLoading}
        />
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h3 
        className="font-semibold text-zinc-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {campaign.name}
      </h3>
      <Edit className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
        onClick={() => setIsEditing(true)} />
    </div>
  );
}

// Inline Editable Campaign Description Component
function EditableCampaignDescription({ 
  campaign, 
  onUpdate 
}: { 
  campaign: Campaign; 
  onUpdate: () => void; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(campaign.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSave = async () => {
    if (description.trim() === (campaign.description || '')) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await campaigns.update(campaign.id, { description: description.trim() || undefined });
      showSuccess('Campaign description updated successfully!');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update campaign description:', error);
      showError(error instanceof Error ? error.message : 'Failed to update campaign description');
      setDescription(campaign.description || ''); // Reset to original description on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDescription(campaign.description || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="min-h-[60px] text-sm resize-none"
          placeholder="Add a description..."
          autoFocus
          disabled={isLoading}
        />
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
      </div>
    );
  }

  return (
    <div className="group">
      <span 
        className="text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {campaign.description || 'Add description...'}
      </span>
      <Edit className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-2 inline" 
        onClick={() => setIsEditing(true)} />
    </div>
  );
}

const getStatusColor = (status: Campaign['status']) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
    case "DRAFT":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
    case "PAUSED":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
  }
};

const getStatusLabel = (status: Campaign['status']) => {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "DRAFT":
      return "Draft";
    case "PAUSED":
      return "Paused";
    case "COMPLETED":
      return "Completed";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
};

// Campaign Creation Modal Component
function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiPersonasList, setAiPersonasList] = useState<AIPersona[]>([]);
  const [workflowsList, setWorkflowsList] = useState<Workflow[]>([]);
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: '',
    description: '',
    aiPersonaId: undefined,
    workflowId: undefined,
  });
  const { showSuccess, showError } = useToast();

  // Load AI personas and workflows
  useEffect(() => {
    const loadData = async () => {
      try {
        const [personasResponse, workflowsResponse] = await Promise.all([
          aiPersonas.getAll(),
          workflows.getAll({ take: 100 })
        ]);
        setAiPersonasList(personasResponse);
        setWorkflowsList(workflowsResponse.data);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('Campaign name is required');
      return;
    }

    setIsLoading(true);
    try {
      await campaigns.create(formData);
      showSuccess('Campaign created successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        aiPersonaId: undefined,
        workflowId: undefined,
      });
    } catch (error) {
      console.error('Failed to create campaign:', error);
      showError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCampaignRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new campaign to manage your outreach efforts.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your campaign"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiPersona">AI Persona</Label>
            <Select
              value={formData.aiPersonaId || ''}
              onValueChange={(value) => handleInputChange('aiPersonaId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an AI persona (optional)" />
              </SelectTrigger>
              <SelectContent>
                {aiPersonasList.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow">Workflow</Label>
            <Select
              value={formData.workflowId || ''}
              onValueChange={(value) => handleInputChange('workflowId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a workflow (optional)" />
              </SelectTrigger>
              <SelectContent>
                {workflowsList.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.name} ({workflow.typeDescription})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                'Create Campaign'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CampaignsPage() {
  const [campaignsData, setCampaignsData] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QueryCampaignsRequest>({
    take: 20,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await campaigns.getAll({
        ...filters,
        search: searchTerm || undefined,
      });
      
      setCampaignsData(response.data);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Load campaigns on component mount and when filters change
  useEffect(() => {
    fetchCampaigns();
  }, [filters, searchTerm]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle status filter
  const handleStatusFilter = (status: Campaign['status'] | 'ALL') => {
    setFilters(prev => ({
      ...prev,
      status: status === 'ALL' ? undefined : status,
    }));
  };

  // Handle campaign actions
  const handleUpdateCampaign = async (id: string, updates: { status?: Campaign['status'] }) => {
    try {
      // For now, we'll only handle status updates since that's what we need
      // The API client's UpdateCampaignRequest doesn't include status, but the backend should support it
      await campaigns.update(id, updates as any);
      fetchCampaigns(); // Refresh the list
    } catch (err) {
      console.error('Failed to update campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await campaigns.delete(id);
      fetchCampaigns(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Campaigns</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Manage your email campaigns</p>
          </div>
        </div>
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              <p className="mb-4">{error}</p>
              <Button onClick={fetchCampaigns} variant="outline">
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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Campaigns</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage your email campaigns</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status: {filters.status ? getStatusLabel(filters.status) : 'All'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusFilter('ALL')}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter('DRAFT')}>
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter('ACTIVE')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter('PAUSED')}>
                  Paused
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter('COMPLETED')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter('ARCHIVED')}>
                  Archived
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">Loading campaigns...</span>
            </div>
          ) : campaignsData.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No campaigns found</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                {searchTerm || filters.status ? 'Try adjusting your search or filters.' : 'Get started by creating your first campaign.'}
              </p>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaignsData.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <EditableCampaignName 
                          campaign={campaign} 
                          onUpdate={fetchCampaigns} 
                        />
                        <Badge className={`${getStatusColor(campaign.status)} border`}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                        {campaign.aiPersona && (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                            {campaign.aiPersona.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(campaign.createdAt)}</span>
                        </div>
                        <EditableCampaignDescription 
                          campaign={campaign} 
                          onUpdate={fetchCampaigns} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {campaign.status === 'DRAFT' && (
                          <DropdownMenuItem onClick={() => handleUpdateCampaign(campaign.id, { status: 'ACTIVE' })}>
                            <Play className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        {campaign.status === 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => handleUpdateCampaign(campaign.id, { status: 'PAUSED' })}>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteCampaign(campaign.id)}
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

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
} 