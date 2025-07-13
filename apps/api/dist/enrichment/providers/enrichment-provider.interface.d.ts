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
    enrich(request: EnrichmentRequest): Promise<EnrichmentResult>;
    canHandle(request: EnrichmentRequest): boolean;
    getConfig(): Record<string, any>;
    isAvailable(): boolean;
}
