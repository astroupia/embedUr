import { InputFormat } from '../dto/target-audience-translator.dto';
export interface EnrichmentField {
    name: string;
    type: 'REQUIRED' | 'OPTIONAL' | 'CONDITIONAL';
    description?: string;
    example?: string;
}
export interface EnrichmentSchema {
    requiredFields: EnrichmentField[];
    optionalFields: EnrichmentField[];
    conditionalFields?: EnrichmentField[];
}
export interface GeneratedLead {
    fullName?: string;
    jobTitle?: string;
    companyName?: string;
    location?: string;
    linkedinUrl?: string;
    email?: string;
    additionalData?: Record<string, any>;
}
export interface InterpretedCriteria {
    jobTitles?: string[];
    industries?: string[];
    location?: string;
    companySize?: string;
    fundingStatus?: string;
    additionalCriteria?: Record<string, any>;
}
export declare class TargetAudienceTranslatorEntity {
    readonly id: string;
    readonly inputFormat: InputFormat;
    readonly targetAudienceData: string;
    readonly structuredData: Record<string, any> | null;
    readonly config: Record<string, any> | null;
    readonly leads: GeneratedLead[] | null;
    readonly enrichmentSchema: EnrichmentSchema | null;
    readonly interpretedCriteria: InterpretedCriteria | null;
    readonly reasoning: string | null;
    readonly confidence: number | null;
    readonly status: string;
    readonly errorMessage: string | null;
    readonly companyId: string;
    readonly createdBy: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, inputFormat: InputFormat, targetAudienceData: string, structuredData: Record<string, any> | null, config: Record<string, any> | null, leads: GeneratedLead[] | null, enrichmentSchema: EnrichmentSchema | null, interpretedCriteria: InterpretedCriteria | null, reasoning: string | null, confidence: number | null, status: string, errorMessage: string | null, companyId: string, createdBy: string, createdAt: Date, updatedAt: Date);
    get isCompleted(): boolean;
    get isSuccessful(): boolean;
    get isFailed(): boolean;
    get hasLeads(): boolean;
    get hasEnrichmentSchema(): boolean;
    get leadCount(): number;
    get requiredFieldsCount(): number;
    get optionalFieldsCount(): number;
    static create(inputFormat: InputFormat, targetAudienceData: string, structuredData: Record<string, any> | null, config: Record<string, any> | null, companyId: string, createdBy: string): TargetAudienceTranslatorEntity;
    withStatus(status: string, leads?: GeneratedLead[], enrichmentSchema?: EnrichmentSchema, interpretedCriteria?: InterpretedCriteria, reasoning?: string, confidence?: number, errorMessage?: string): TargetAudienceTranslatorEntity;
    withResults(leads: GeneratedLead[], enrichmentSchema: EnrichmentSchema, interpretedCriteria: InterpretedCriteria, reasoning?: string, confidence?: number): TargetAudienceTranslatorEntity;
    withError(errorMessage: string): TargetAudienceTranslatorEntity;
}
