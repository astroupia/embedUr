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
  Bot, 
  Calendar,
  Edit,
  Copy,
  Trash2,
  Loader2,
  Eye,
  MoreHorizontal,
  Sparkles,
  Settings,
  MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { aiPersonas, type AIPersona, type CreateAIPersonaRequest, type UpdateAIPersonaRequest } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

// Inline Editable AI Persona Name Component
function EditableAIPersonaName({ 
  persona, 
  onUpdate 
}: { 
  persona: AIPersona; 
  onUpdate: () => void; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(persona.name);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      showError('AI Persona name cannot be empty');
      return;
    }

    if (name.trim() === persona.name) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await aiPersonas.update(persona.id, { name: name.trim() });
      showSuccess('AI Persona name updated successfully!');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update AI persona name:', error);
      showError(error instanceof Error ? error.message : 'Failed to update AI persona name');
      setName(persona.name); // Reset to original name on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(persona.name);
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
        {persona.name}
      </h3>
      <Edit className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
        onClick={() => setIsEditing(true)} />
    </div>
  );
}

// Inline Editable AI Persona Description Component
function EditableAIPersonaDescription({ 
  persona, 
  onUpdate 
}: { 
  persona: AIPersona; 
  onUpdate: () => void; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(persona.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSave = async () => {
    if (description.trim() === (persona.description || '')) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await aiPersonas.update(persona.id, { description: description.trim() || undefined });
      showSuccess('AI Persona description updated successfully!');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update AI persona description:', error);
      showError(error instanceof Error ? error.message : 'Failed to update AI persona description');
      setDescription(persona.description || ''); // Reset to original description on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDescription(persona.description || '');
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
        {persona.description || 'Add description...'}
      </span>
      <Edit className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-2 inline" 
        onClick={() => setIsEditing(true)} />
    </div>
  );
}

// AI Persona Creation Modal Component
function CreateAIPersonaModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAIPersonaRequest>({
    name: '',
    description: '',
    prompt: '',
    parameters: {},
  });
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('AI Persona name is required');
      return;
    }

    if (!formData.prompt.trim()) {
      showError('AI Persona prompt is required');
      return;
    }

    setIsLoading(true);
    try {
      await aiPersonas.create(formData);
      showSuccess('AI Persona created successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        prompt: '',
        parameters: {},
      });
    } catch (error) {
      console.error('Failed to create AI persona:', error);
      showError(error instanceof Error ? error.message : 'Failed to create AI persona');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateAIPersonaRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New AI Persona</DialogTitle>
          <DialogDescription>
            Create a new AI persona to define how your AI should behave in conversations.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Persona Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter persona name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe this AI persona"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">AI Prompt *</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              placeholder="Define how the AI should behave, respond, and interact..."
              rows={8}
              required
              className="font-mono text-sm"
            />
            <p className="text-xs text-zinc-500">
              This prompt defines the personality, tone, and behavior of your AI persona.
            </p>
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
                'Create AI Persona'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// AI Persona Detail Modal Component
function AIPersonaDetailModal({ 
  persona, 
  isOpen, 
  onClose 
}: { 
  persona: AIPersona | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  if (!persona) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {persona.name}
          </DialogTitle>
          <DialogDescription>
            AI Persona Details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {persona.description || 'No description provided'}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">AI Prompt</Label>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
              <pre className="text-sm font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {persona.prompt}
              </pre>
            </div>
          </div>

          {persona.parameters && Object.keys(persona.parameters).length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Parameters</Label>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                <pre className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  {JSON.stringify(persona.parameters, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(persona.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>Updated {new Date(persona.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AIPersonasPage() {
  const [personasData, setPersonasData] = useState<AIPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch AI personas
  const fetchPersonas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiPersonas.getAll();
      setPersonasData(response);
    } catch (err) {
      console.error('Failed to fetch AI personas:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch AI personas');
    } finally {
      setLoading(false);
    }
  };

  // Load personas on component mount
  useEffect(() => {
    fetchPersonas();
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Filter personas based on search
  const filteredPersonas = personasData.filter(persona =>
    persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (persona.description && persona.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle persona actions
  const handleDeletePersona = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI persona?')) return;
    
    try {
      await aiPersonas.delete(id);
      fetchPersonas(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete AI persona:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete AI persona');
    }
  };

  const handleDuplicatePersona = async (persona: AIPersona) => {
    try {
      const duplicateData: CreateAIPersonaRequest = {
        name: `${persona.name} (Copy)`,
        description: persona.description,
        prompt: persona.prompt,
        parameters: persona.parameters,
      };
      
      await aiPersonas.create(duplicateData);
      fetchPersonas(); // Refresh the list
    } catch (err) {
      console.error('Failed to duplicate AI persona:', err);
      setError(err instanceof Error ? err.message : 'Failed to duplicate AI persona');
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
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">AI Personas</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Manage your AI personas</p>
          </div>
        </div>
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              <p className="mb-4">{error}</p>
              <Button onClick={fetchPersonas} variant="outline">
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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">AI Personas</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage your AI personas and their behavior</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New AI Persona
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              placeholder="Search AI personas..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Personas List */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle>All AI Personas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">Loading AI personas...</span>
            </div>
          ) : filteredPersonas.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No AI personas found</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                {searchTerm ? 'Try adjusting your search.' : 'Get started by creating your first AI persona.'}
              </p>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create AI Persona
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPersonas.map((persona) => (
                <div key={persona.id} className="flex items-center justify-between p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <EditableAIPersonaName 
                          persona={persona} 
                          onUpdate={fetchPersonas} 
                        />
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                          AI Persona
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(persona.createdAt)}</span>
                        </div>
                        <EditableAIPersonaDescription 
                          persona={persona} 
                          onUpdate={fetchPersonas} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPersona(persona);
                        setIsDetailModalOpen(true);
                      }}
                      className="rounded-lg"
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
                        <DropdownMenuItem onClick={() => handleDuplicatePersona(persona)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeletePersona(persona.id)}
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

      {/* Create AI Persona Modal */}
      <CreateAIPersonaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPersonas}
      />

      {/* AI Persona Detail Modal */}
      <AIPersonaDetailModal
        persona={selectedPersona}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPersona(null);
        }}
      />
    </div>
  );
} 