import { apiClient } from './client';
import type {
  Reply,
  CreateReplyRequest,
  UpdateReplyRequest,
  QueryRepliesRequest,
  PaginatedResponse,
} from './client';

// Replies API class that uses the base client
export class RepliesAPI {
  private client = apiClient;

  /**
   * Create a new reply
   */
  async create(data: CreateReplyRequest): Promise<Reply> {
    return this.client.createReply(data);
  }

  /**
   * Get all replies with pagination and filtering
   */
  async getAll(params?: QueryRepliesRequest): Promise<PaginatedResponse<Reply>> {
    return this.client.getReplies(params);
  }

  /**
   * Get a specific reply by ID
   */
  async getById(id: string): Promise<Reply> {
    return this.client.getReply(id);
  }

  /**
   * Update a reply
   */
  async update(id: string, data: UpdateReplyRequest): Promise<Reply> {
    return this.client.updateReply(id, data);
  }

  /**
   * Delete a reply
   */
  async delete(id: string): Promise<void> {
    return this.client.deleteReply(id);
  }
}

// Export types for convenience
export type {
  Reply,
  CreateReplyRequest,
  UpdateReplyRequest,
  QueryRepliesRequest,
  PaginatedResponse,
}; 