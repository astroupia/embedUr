import { apiClient } from './client';
import type {
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
  QueryLeadsRequest,
  PaginatedResponse,
} from './client';

// Leads API class that uses the base client
export class LeadsAPI {
  private client = apiClient;

  /**
   * Create a new lead
   */
  async create(data: CreateLeadRequest): Promise<Lead> {
    return this.client.createLead(data);
  }

  /**
   * Get all leads with pagination and filtering
   */
  async getAll(params?: QueryLeadsRequest): Promise<PaginatedResponse<Lead>> {
    return this.client.getLeads(params);
  }

  /**
   * Get a specific lead by ID
   */
  async getById(id: string): Promise<Lead> {
    return this.client.getLead(id);
  }

  /**
   * Update a lead
   */
  async update(id: string, data: UpdateLeadRequest): Promise<Lead> {
    return this.client.updateLead(id, data);
  }

  /**
   * Delete a lead
   */
  async delete(id: string): Promise<void> {
    return this.client.deleteLead(id);
  }
}

// Export types for convenience
export type {
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
  QueryLeadsRequest,
  PaginatedResponse,
}; 