export declare class EnrichmentOutputDataDto {
    leadId: string;
    name: string;
    email: string;
    company: string;
    jobTitle: string;
    industry: string;
    companySize: string;
    emailVerified: boolean;
}
export declare class CompleteEnrichmentDto {
    workflow: string;
    leadId: string;
    companyId: string;
    status: string;
    outputData: EnrichmentOutputDataDto;
    clientId?: string;
    errorMessage?: string;
}
