import { apiClient } from './client';
import type {
  TargetAudienceTranslator,
  CreateTargetAudienceTranslatorRequest,
  QueryTargetAudienceTranslatorRequest,
  TargetAudienceTranslatorStats,
  PaginatedResponse,
} from './client';
import { InputFormat } from './client';

// Target Audience Translator API class that uses the base client
export class TargetAudienceTranslatorAPI {
  private client = apiClient;

  /**
   * Create a new target audience translation request
   */
  async create(data: CreateTargetAudienceTranslatorRequest): Promise<TargetAudienceTranslator> {
    return this.client.createTargetAudienceTranslator(data);
  }

  /**
   * Get all target audience translations with pagination and filtering
   */
  async getAll(params?: QueryTargetAudienceTranslatorRequest): Promise<PaginatedResponse<TargetAudienceTranslator>> {
    return this.client.getTargetAudienceTranslators(params);
  }

  /**
   * Get a specific target audience translation by ID
   */
  async getById(id: string): Promise<TargetAudienceTranslator> {
    return this.client.getTargetAudienceTranslator(id);
  }

  /**
   * Get target audience translator statistics
   */
  async getStats(): Promise<TargetAudienceTranslatorStats> {
    return this.client.getTargetAudienceTranslatorStats();
  }

  /**
   * Get target audience translations filtered by status
   */
  async getByStatus(status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'): Promise<TargetAudienceTranslator[]> {
    return this.client.getTargetAudienceTranslatorsByStatus(status);
  }

  /**
   * Get target audience translations filtered by input format
   */
  async getByFormat(format: InputFormat): Promise<TargetAudienceTranslator[]> {
    return this.client.getTargetAudienceTranslatorsByFormat(format);
  }

  /**
   * Retry a failed target audience translation
   */
  async retry(id: string): Promise<TargetAudienceTranslator> {
    return this.client.retryTargetAudienceTranslator(id);
  }

  /**
   * Poll for status updates on a translation request
   */
  async pollForCompletion(id: string, maxAttempts: number = 30, intervalMs: number = 1000): Promise<TargetAudienceTranslator> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const translation = await this.getById(id);
      
      if (translation.status === 'SUCCESS' || translation.status === 'FAILED') {
        return translation;
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }
    
    throw new Error(`Translation ${id} did not complete within the expected time`);
  }

  /**
   * Create a translation with free text input
   */
  async createWithFreeText(targetAudienceData: string, config?: Record<string, any>): Promise<TargetAudienceTranslator> {
    return this.create({
      inputFormat: InputFormat.FREE_TEXT,
      targetAudienceData,
      config,
    });
  }

  /**
   * Create a translation with structured JSON input
   */
  async createWithStructuredJson(
    targetAudienceData: string, 
    structuredData?: any, 
    config?: Record<string, any>
  ): Promise<TargetAudienceTranslator> {
    return this.create({
      inputFormat: InputFormat.STRUCTURED_JSON,
      targetAudienceData,
      structuredData,
      config,
    });
  }

  /**
   * Create a translation with CSV upload
   */
  async createWithCsvUpload(csvData: string, config?: Record<string, any>): Promise<TargetAudienceTranslator> {
    return this.create({
      inputFormat: InputFormat.CSV_UPLOAD,
      targetAudienceData: csvData,
      config,
    });
  }

  /**
   * Create a translation with form input
   */
  async createWithFormInput(formData: any, config?: Record<string, any>): Promise<TargetAudienceTranslator> {
    return this.create({
      inputFormat: InputFormat.FORM_INPUT,
      targetAudienceData: JSON.stringify(formData),
      config,
    });
  }
}

// Export types for convenience
export type {
  TargetAudienceTranslator,
  CreateTargetAudienceTranslatorRequest,
  QueryTargetAudienceTranslatorRequest,
  TargetAudienceTranslatorStats,
  InputFormat,
  PaginatedResponse,
}; 