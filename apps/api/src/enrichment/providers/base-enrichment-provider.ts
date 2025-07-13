import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentProviderInterface, EnrichmentRequest, EnrichmentResult } from './enrichment-provider.interface';
import { ENRICHMENT_BUSINESS_RULES } from '../constants/enrichment.constants';

@Injectable()
export abstract class BaseEnrichmentProvider implements EnrichmentProviderInterface {
  protected readonly logger = new Logger(this.constructor.name);
  
  abstract readonly name: string;
  abstract readonly provider: string;

  /**
   * Enrich lead data using the provider's API
   */
  async enrich(request: EnrichmentRequest): Promise<EnrichmentResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting enrichment with ${this.name} for request:`, request);
      
      // Validate request
      if (!this.canHandle(request)) {
        throw new Error(`Provider ${this.name} cannot handle this request`);
      }

      // Check if provider is available
      if (!this.isAvailable()) {
        throw new Error(`Provider ${this.name} is not available`);
      }

      // Perform enrichment
      const result = await this.performEnrichment(request);
      
      const durationMs = Date.now() - startTime;
      
      this.logger.log(`Enrichment completed with ${this.name} in ${durationMs}ms`);
      
      return {
        ...result,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      
      this.logger.error(`Enrichment failed with ${this.name}:`, error);
      
      return {
        success: false,
        error: error.message,
        durationMs,
      };
    }
  }

  /**
   * Validate if the provider can handle the given request
   */
  canHandle(request: EnrichmentRequest): boolean {
    // Base validation - at least one identifier should be provided
    return !!(request.email || request.fullName || request.linkedinUrl);
  }

  /**
   * Get provider-specific configuration
   */
  getConfig(): Record<string, any> {
    return {
      name: this.name,
      provider: this.provider,
      maxRetries: ENRICHMENT_BUSINESS_RULES.MAX_RETRY_ATTEMPTS,
      timeout: ENRICHMENT_BUSINESS_RULES.REQUEST_TIMEOUT_MS,
    };
  }

  /**
   * Check if the provider is available/configured
   */
  isAvailable(): boolean {
    // Base implementation - should be overridden by specific providers
    return true;
  }

  /**
   * Abstract method to be implemented by specific providers
   */
  protected abstract performEnrichment(request: EnrichmentRequest): Promise<EnrichmentResult>;

  /**
   * Standardize enrichment data across providers
   */
  protected standardizeData(rawData: Record<string, any>): Record<string, any> {
    return {
      // Basic contact info
      fullName: rawData.fullName || rawData.name || rawData.firstName + ' ' + rawData.lastName,
      email: rawData.email,
      phone: rawData.phone || rawData.phoneNumber,
      
      // Professional info
      jobTitle: rawData.jobTitle || rawData.title || rawData.position,
      department: rawData.department,
      company: rawData.company || rawData.companyName,
      companySize: rawData.companySize,
      companyIndustry: rawData.industry || rawData.companyIndustry,
      companyWebsite: rawData.companyWebsite || rawData.website,
      
      // Location
      location: rawData.location || rawData.city + ', ' + rawData.country,
      
      // Social profiles
      linkedinUrl: rawData.linkedinUrl || rawData.linkedin,
      twitterUrl: rawData.twitterUrl || rawData.twitter,
      facebookUrl: rawData.facebookUrl || rawData.facebook,
      
      // Verification
      verifiedEmail: rawData.verifiedEmail || rawData.emailVerified,
      verifiedPhone: rawData.verifiedPhone || rawData.phoneVerified,
      
      // Raw data for debugging
      rawData,
    };
  }

  /**
   * Handle rate limiting with exponential backoff
   */
  protected async handleRateLimit(retryCount: number = 0): Promise<void> {
    if (retryCount >= ENRICHMENT_BUSINESS_RULES.MAX_RETRY_ATTEMPTS) {
      throw new Error('Maximum retry attempts exceeded');
    }

    const delay = Math.pow(2, retryCount) * ENRICHMENT_BUSINESS_RULES.RATE_LIMIT_DELAY_MS;
    this.logger.log(`Rate limited, waiting ${delay}ms before retry ${retryCount + 1}`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
} 