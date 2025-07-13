export declare enum InputFormat {
    FREE_TEXT = "FREE_TEXT",
    STRUCTURED_JSON = "STRUCTURED_JSON",
    CSV_UPLOAD = "CSV_UPLOAD",
    FORM_INPUT = "FORM_INPUT"
}
export declare enum EnrichmentFieldType {
    REQUIRED = "REQUIRED",
    OPTIONAL = "OPTIONAL",
    CONDITIONAL = "CONDITIONAL"
}
export declare class EnrichmentField {
    name: string;
    type: EnrichmentFieldType;
    description?: string;
    example?: string;
}
export declare class EnrichmentSchema {
    requiredFields: EnrichmentField[];
    optionalFields: EnrichmentField[];
    conditionalFields?: EnrichmentField[];
}
export declare class StructuredTargetingData {
    jobTitles?: string[];
    industries?: string[];
    location?: string;
    companySize?: string;
    fundingStatus?: string;
    additionalCriteria?: Record<string, any>;
}
export declare class GeneratedLead {
    fullName?: string;
    jobTitle?: string;
    companyName?: string;
    location?: string;
    linkedinUrl?: string;
    email?: string;
    additionalData?: Record<string, any>;
}
export declare class InterpretedCriteria {
    jobTitles?: string[];
    industries?: string[];
    location?: string;
    companySize?: string;
    fundingStatus?: string;
    additionalCriteria?: Record<string, any>;
}
export declare class CreateTargetAudienceTranslatorDto {
    inputFormat: InputFormat;
    targetAudienceData: string;
    structuredData?: StructuredTargetingData;
    config?: Record<string, any>;
}
export declare class TargetAudienceTranslatorResponseDto {
    leads: GeneratedLead[];
    enrichmentSchema: EnrichmentSchema;
    interpretedCriteria: Record<string, any>;
    reasoning?: string;
    confidence?: number;
}
export declare class QueryTargetAudienceTranslatorCursorDto {
    cursor?: string;
    take?: number;
    search?: string;
    inputFormat?: InputFormat;
}
