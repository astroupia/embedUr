import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentProviderInterface, EnrichmentRequest, EnrichmentResult } from './enrichment-provider.interface';

@Injectable()
export class ApolloEnrichmentProvider implements EnrichmentProviderInterface {
  readonly name = 'APOLLO';
  readonly provider = 'APOLLO';
  private readonly logger = new Logger(ApolloEnrichmentProvider.name);

  async enrich(request: EnrichmentRequest): Promise<EnrichmentResult> {
    // Simulate a real enrichment call (for production)
    this.logger.log(`Simulating Apollo enrichment for: ${request.email || request.fullName}`);
    return {
      success: false,
      error: 'Provider APOLLO is not available in test',
    };
  }

  canHandle(request: EnrichmentRequest): boolean {
    return !!(request.email || request.linkedinUrl);
  }

  getConfig(): Record<string, any> {
    return {};
  }

  isAvailable(): boolean {
    return false;
  }
} 