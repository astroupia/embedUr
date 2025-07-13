import { Logger } from '@nestjs/common';
import { EnrichmentProviderInterface, EnrichmentRequest, EnrichmentResult } from './enrichment-provider.interface';
export declare abstract class BaseEnrichmentProvider implements EnrichmentProviderInterface {
    protected readonly logger: Logger;
    abstract readonly name: string;
    abstract readonly provider: string;
    enrich(request: EnrichmentRequest): Promise<EnrichmentResult>;
    canHandle(request: EnrichmentRequest): boolean;
    getConfig(): Record<string, any>;
    isAvailable(): boolean;
    protected abstract performEnrichment(request: EnrichmentRequest): Promise<EnrichmentResult>;
    protected standardizeData(rawData: Record<string, any>): Record<string, any>;
    protected handleRateLimit(retryCount?: number): Promise<void>;
}
