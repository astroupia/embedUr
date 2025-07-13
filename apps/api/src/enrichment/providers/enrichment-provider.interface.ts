export interface EnrichmentResult {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  durationMs?: number;
}

export interface EnrichmentRequest {
  email?: string;
  fullName?: string;
  company?: string;
  linkedinUrl?: string;
  [key: string]: any;
}

export interface EnrichmentProviderInterface {
  readonly name: string;
  readonly provider: string;
  
  /**
   * Enrich lead data using the provider's API
   */
  enrich(request: EnrichmentRequest): Promise<EnrichmentResult>;
  
  /**
   * Validate if the provider can handle the given request
   */
  canHandle(request: EnrichmentRequest): boolean;
  
  /**
   * Get provider-specific configuration
   */
  getConfig(): Record<string, any>;
  
  /**
   * Check if the provider is available/configured
   */
  isAvailable(): boolean;
} 