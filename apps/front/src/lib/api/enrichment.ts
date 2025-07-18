import { apiClient } from './client';
import type {
  EnrichmentRequest,
  TriggerEnrichmentRequest,
  RetryEnrichmentRequest,
  QueryEnrichmentRequest,
  PaginatedResponse,
} from './client';

// Enrichment API class that uses the base client
export class EnrichmentAPI {
  private client = apiClient;

  /**
   * Trigger enrichment for a lead
   */
  async trigger(data: TriggerEnrichmentRequest): Promise<EnrichmentRequest> {
    return this.client.triggerEnrichment(data);
  }

  /**
   * Get all enrichment requests with pagination and filtering
   */
  async getAll(params?: QueryEnrichmentRequest): Promise<PaginatedResponse<EnrichmentRequest>> {
    return this.client.getEnrichmentRequests(params);
  }

  /**
   * Get a specific enrichment request by ID
   */
  async getById(id: string): Promise<EnrichmentRequest> {
    return this.client.getEnrichmentRequest(id);
  }

  /**
   * Retry a failed enrichment request
   */
  async retry(data: RetryEnrichmentRequest): Promise<EnrichmentRequest> {
    return this.client.retryEnrichment(data);
  }
}


// Export types for convenience
export type {
  EnrichmentRequest,
  TriggerEnrichmentRequest,
  RetryEnrichmentRequest,
  QueryEnrichmentRequest,
  PaginatedResponse,
}; 