import { apiClient } from './client';
import type {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  QueryCampaignsRequest,
  PaginatedResponse,
} from './client';

// Campaigns API class that uses the base client
export class CampaignsAPI {
  private client = apiClient;

  /**
   * Create a new campaign
   */
  async create(data: CreateCampaignRequest): Promise<Campaign> {
    return this.client.createCampaign(data);
  }

  /**
   * Get all campaigns with pagination and filtering
   */
  async getAll(params?: QueryCampaignsRequest): Promise<PaginatedResponse<Campaign>> {
    return this.client.getCampaigns(params);
  }

  /**
   * Get a specific campaign by ID
   */
  async getById(id: string): Promise<Campaign> {
    return this.client.getCampaign(id);
  }

  /**
   * Update a campaign
   */
  async update(id: string, data: UpdateCampaignRequest): Promise<Campaign> {
    return this.client.updateCampaign(id, data);
  }

  /**
   * Delete a campaign
   */
  async delete(id: string): Promise<void> {
    return this.client.deleteCampaign(id);
  }
}

// Export types for convenience
export type {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  QueryCampaignsRequest,
  PaginatedResponse,
}; 