import { apiClient } from './client';
import type {
  AIPersona,
  CreateAIPersonaRequest,
  UpdateAIPersonaRequest,
} from './client';

// AI Personas API class that uses the base client
export class AIPersonasAPI {
  private client = apiClient;

  /**
   * Create a new AI persona
   */
  async create(data: CreateAIPersonaRequest): Promise<AIPersona> {
    return this.client.createAIPersona(data);
  }

  /**
   * Get all AI personas for the company
   */
  async getAll(): Promise<AIPersona[]> {
    return this.client.getAIPersonas();
  }

  /**
   * Get a specific AI persona by ID
   */
  async getById(id: string): Promise<AIPersona> {
    return this.client.getAIPersona(id);
  }

  /**
   * Update an AI persona
   */
  async update(id: string, data: UpdateAIPersonaRequest): Promise<AIPersona> {
    return this.client.updateAIPersona(id, data);
  }

  /**
   * Delete an AI persona
   */
  async delete(id: string): Promise<void> {
    return this.client.deleteAIPersona(id);
  }
}

// Export types for convenience
export type {
  AIPersona,
  CreateAIPersonaRequest,
  UpdateAIPersonaRequest,
}; 