import { EnrichmentProviderInterface, EnrichmentRequest, EnrichmentResult } from './enrichment-provider.interface';
export declare class ApolloEnrichmentProvider implements EnrichmentProviderInterface {
    readonly name = "APOLLO";
    readonly provider = "APOLLO";
    private readonly logger;
    enrich(request: EnrichmentRequest): Promise<EnrichmentResult>;
    canHandle(request: EnrichmentRequest): boolean;
    getConfig(): Record<string, any>;
    isAvailable(): boolean;
}
