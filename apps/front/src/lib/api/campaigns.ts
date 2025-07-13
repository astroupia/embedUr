import { apiClient } from './client';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  targetAudience: string;
  emailTemplate: string;
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
  };
  settings: {
    maxEmailsPerDay: number;
    delayBetweenEmails: number;
    followUpSequence: boolean;
  };
  metrics: {
    totalLeads: number;
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    replies: number;
    bounces: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  targetAudience: string;
  emailTemplate: string;
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
  };
  settings: {
    maxEmailsPerDay: number;
    delayBetweenEmails: number;
    followUpSequence: boolean;
  };
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  id: string;
}

export interface CampaignFilters {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CampaignAnalytics {
  id: string;
  metrics: {
    totalLeads: number;
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    replies: number;
    bounces: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  };
  dailyStats: Array<{
    date: string;
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    replies: number;
  }>;
  leadStats: Array<{
    status: string;
    count: number;
  }>;
}

export const campaignsApi = {
  // Get all campaigns with pagination and filters
  async getCampaigns(filters?: CampaignFilters): Promise<{
    campaigns: Campaign[];
    total: number;
    page: number;
    limit: number;
  }> {
    return apiClient.get('/campaigns', filters);
  },

  // Get single campaign by ID
  async getCampaign(id: string): Promise<Campaign> {
    return apiClient.get(`/campaigns/${id}`);
  },

  // Create new campaign
  async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    return apiClient.post('/campaigns', data);
  },

  // Update campaign
  async updateCampaign(data: UpdateCampaignData): Promise<Campaign> {
    const { id, ...updateData } = data;
    return apiClient.put(`/campaigns/${id}`, updateData);
  },

  // Delete campaign
  async deleteCampaign(id: string): Promise<void> {
    return apiClient.delete(`/campaigns/${id}`);
  },

  // Activate campaign
  async activateCampaign(id: string): Promise<Campaign> {
    return apiClient.post(`/campaigns/${id}/activate`);
  },

  // Pause campaign
  async pauseCampaign(id: string): Promise<Campaign> {
    return apiClient.post(`/campaigns/${id}/pause`);
  },

  // Get campaign analytics
  async getCampaignAnalytics(id: string): Promise<CampaignAnalytics> {
    return apiClient.get(`/campaigns/${id}/analytics`);
  },

  // Get campaign leads
  async getCampaignLeads(id: string, filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    leads: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    return apiClient.get(`/campaigns/${id}/leads`, filters);
  },

  // Duplicate campaign
  async duplicateCampaign(id: string, name: string): Promise<Campaign> {
    return apiClient.post(`/campaigns/${id}/duplicate`, { name });
  },
}; 