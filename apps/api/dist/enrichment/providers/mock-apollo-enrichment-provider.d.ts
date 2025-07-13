import { EnrichmentProviderInterface, EnrichmentRequest, EnrichmentResult } from './enrichment-provider.interface';
export declare class MockApolloEnrichmentProvider implements EnrichmentProviderInterface {
    readonly name = "APOLLO";
    readonly provider = "APOLLO";
    enrich(request: EnrichmentRequest): Promise<EnrichmentResult>;
    canHandle(request: EnrichmentRequest): boolean;
    getConfig(): Record<string, any>;
    isAvailable(): boolean;
}
