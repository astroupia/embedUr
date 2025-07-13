import { apiClient } from './client';

export interface Lead {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  phone?: string;
  linkedinUrl?: string;
  status: 'NEW' | 'CONTACTED' | 'RESPONDED' | 'QUALIFIED' | 'UNQUALIFIED' | 'BOUNCED';
  source: string;
  enrichmentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  enrichedData?: {
    companyName?: string;
    companySize?: string;
    industry?: string;
    location?: string;
    socialProfiles?: string[];
  };
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  phone?: string;
  linkedinUrl?: string;
  source?: string;
  campaignId?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  id: string;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  campaignId?: string;
  enrichmentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BulkUploadResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

export interface EnrichmentRequest {
  id: string;
  leadId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  provider: string;
  createdAt: string;
  completedAt?: string;
}

export const leadsApi = {
  // Get all leads with pagination and filters
  async getLeads(filters?: LeadFilters): Promise<{
    leads: Lead[];
    total: number;
    page: number;
    limit: number;
  }> {
    return apiClient.get('/leads', filters);
  },

  // Get single lead by ID
  async getLead(id: string): Promise<Lead> {
    return apiClient.get(`/leads/${id}`);
  },

  // Create new lead
  async createLead(data: CreateLeadData): Promise<Lead> {
    return apiClient.post('/leads', data);
  },

  // Update lead
  async updateLead(data: UpdateLeadData): Promise<Lead> {
    const { id, ...updateData } = data;
    return apiClient.put(`/leads/${id}`, updateData);
  },

  // Delete lead
  async deleteLead(id: string): Promise<void> {
    return apiClient.delete(`/leads/${id}`);
  },

  // Bulk upload leads from CSV/Excel
  async bulkUpload(file: File, campaignId?: string): Promise<BulkUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (campaignId) {
      formData.append('campaignId', campaignId);
    }

    return apiClient.post('/leads/upload', formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
    });
  },

  // Import leads from external source
  async importLeads(source: string, data: any): Promise<BulkUploadResult> {
    return apiClient.post('/leads/import', { source, data });
  },

  // Export leads to CSV
  async exportLeads(filters?: LeadFilters): Promise<Blob> {
    const response = await apiClient.get('/leads/export', filters);
    return new Blob([response], { type: 'text/csv' });
  },

  // Request lead enrichment
  async requestEnrichment(leadId: string): Promise<EnrichmentRequest> {
    return apiClient.post(`/leads/${leadId}/enrich`);
  },

  // Get enrichment status
  async getEnrichmentStatus(leadId: string): Promise<EnrichmentRequest> {
    return apiClient.get(`/leads/${leadId}/enrichment`);
  },

  // Update lead status
  async updateLeadStatus(leadId: string, status: Lead['status']): Promise<Lead> {
    return apiClient.patch(`/leads/${leadId}/status`, { status });
  },

  // Get lead replies
  async getLeadReplies(leadId: string): Promise<{
    replies: any[];
    total: number;
  }> {
    return apiClient.get(`/leads/${leadId}/replies`);
  },

  // Add lead to campaign
  async addToCampaign(leadId: string, campaignId: string): Promise<void> {
    return apiClient.post(`/leads/${leadId}/campaigns`, { campaignId });
  },

  // Remove lead from campaign
  async removeFromCampaign(leadId: string, campaignId: string): Promise<void> {
    return apiClient.delete(`/leads/${leadId}/campaigns/${campaignId}`);
  },
}; 