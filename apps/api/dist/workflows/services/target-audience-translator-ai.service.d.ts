import { HttpService } from '@nestjs/axios';
import { InputFormat, StructuredTargetingData, EnrichmentSchema, GeneratedLead, InterpretedCriteria } from '../dto/target-audience-translator.dto';
export declare class TargetAudienceTranslatorAiService {
    private readonly httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    processTargetAudience(inputFormat: InputFormat, targetAudienceData: string, structuredData?: StructuredTargetingData, config?: Record<string, any>): Promise<{
        leads: GeneratedLead[];
        enrichmentSchema: EnrichmentSchema;
        interpretedCriteria: InterpretedCriteria;
        reasoning: string;
        confidence: number;
    }>;
    private interpretFreeText;
    private interpretStructuredJson;
    private interpretCsvData;
    private interpretFormInput;
    private generateEnrichmentSchema;
    private generateSampleLeads;
    private calculateConfidence;
    private callAiService;
}
