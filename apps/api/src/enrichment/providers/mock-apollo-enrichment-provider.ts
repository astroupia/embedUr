import { Injectable } from '@nestjs/common';
import { EnrichmentProviderInterface, EnrichmentRequest, EnrichmentResult } from './enrichment-provider.interface';

@Injectable()
export class MockApolloEnrichmentProvider implements EnrichmentProviderInterface {
  readonly name = 'APOLLO';
  readonly provider = 'APOLLO';

  async enrich(request: EnrichmentRequest): Promise<EnrichmentResult> {
    // Always return a successful enrichment result for tests
    return {
      success: true,
      data: {
        company: 'Enriched Company',
        position: 'Senior Engineer',
        phone: '+1234567890',
        location: 'San Francisco, CA',
        industry: 'Technology',
      },
    };
  }

  canHandle(request: EnrichmentRequest): boolean {
    return true;
  }

  getConfig(): Record<string, any> {
    return {};
  }

  isAvailable(): boolean {
    return true;
  }
} 