export declare enum WorkflowCompletionStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    TIMEOUT = "TIMEOUT"
}
export declare class WorkflowCompletionPayloadDto {
    workflowId: string;
    leadId: string;
    companyId: string;
    status: WorkflowCompletionStatus;
    outputData?: Record<string, any>;
    errorMessage?: string;
    workflowName?: string;
}
export declare class WorkflowLogPayloadDto {
    leadId: string;
    companyId: string;
    nodeName: string;
    outputData: Record<string, any>;
    timestamp: string;
}
export declare class SmartleadReplyPayloadDto {
    leadId: string;
    emailId: string;
    content: string;
    companyId: string;
    replyId?: string;
}
export declare class ReplyHandlingCompletionPayloadDto {
    leadId: string;
    replyId: string;
    companyId: string;
    outputData: Record<string, any>;
}
export declare class CredentialsDto {
    airtableApiKey?: string;
    openRouterApiKey?: string;
    scrapingBeeApiKey?: string;
    emailVerificationApiKey?: string;
    clearbitApiKey?: string;
    smartleadApiKey?: string;
    calendlyApiKey?: string;
    apolloApiKey?: string;
    dropContactApiKey?: string;
    linkedinScraperApiKey?: string;
    hunterApiKey?: string;
    snovApiKey?: string;
    gmailApiKey?: string;
    outlookApiKey?: string;
}
export declare class ConfigDto {
    airtableBaseId: string;
    airtableTableName: string;
    backendLogUrl: string;
    backendCompleteUrl: string;
    smartleadCampaignId?: string;
    calendlyEventTypeId?: string;
    apolloCompanyId?: string;
    dropContactCompanyId?: string;
    clearbitCompanyId?: string;
    linkedinScraperCompanyId?: string;
    hunterCompanyId?: string;
    snovCompanyId?: string;
    smartleadCompanyId?: string;
    gmailCompanyId?: string;
    outlookCompanyId?: string;
    emailTemplateId?: string;
}
export declare class PromptsDto {
    structureDataPrompt?: string;
    enrichmentPrompt?: string;
    emailDraftPrompt?: string;
    classifyReplyPrompt?: string;
    meetingPrompt?: string;
    validationPrompt?: string;
    scrapingPrompt?: string;
    verificationPrompt?: string;
    scoringPrompt?: string;
    draftingPrompt?: string;
    personalizationPrompt?: string;
    subjectPrompt?: string;
    followUpPrompt?: string;
}
export declare class AiPersonaDto {
    id: string;
    name: string;
    description?: string;
    prompt: string;
    parameters?: Record<string, any>;
}
export declare class LeadValidationInputDto {
    linkedinUrl: string;
    leadId: string;
    name: string;
    clientId?: string;
    credentials: CredentialsDto;
    config: ConfigDto;
    prompts: PromptsDto;
}
export declare class LeadValidationOutputDto {
    workflow: string;
    leadId: string;
    status: string;
    outputData: {
        leadId: string;
        name: string;
        email?: string;
        company?: string;
        jobTitle?: string;
    };
    clientId?: string;
}
export declare class LeadEnrichmentInputDto {
    leadId: string;
    name: string;
    email?: string;
    company?: string;
    jobTitle?: string;
    clientId?: string;
    credentials: CredentialsDto;
    config: ConfigDto;
    prompts: PromptsDto;
}
export declare class LeadEnrichmentOutputDto {
    workflow: string;
    leadId: string;
    status: string;
    outputData: {
        leadId: string;
        name: string;
        email?: string;
        company?: string;
        jobTitle?: string;
        industry?: string;
        companySize?: string;
        emailVerified?: boolean;
    };
    clientId?: string;
}
export declare class EmailDraftingInputDto {
    leadId: string;
    name: string;
    email: string;
    company?: string;
    jobTitle?: string;
    industry?: string;
    companySize?: string;
    emailVerified?: boolean;
    clientId?: string;
    credentials: CredentialsDto;
    config: ConfigDto;
    prompts: PromptsDto;
    aiPersona?: AiPersonaDto;
}
export declare class EmailDraftingOutputDto {
    workflow: string;
    leadId: string;
    status: string;
    outputData: {
        emailSent: boolean;
        emailId: string;
        leadId: string;
    };
    clientId?: string;
}
export declare class ReplyHandlingInputDto {
    leadId: string;
    emailId: string;
    replyContent: string;
    clientId?: string;
    credentials: CredentialsDto;
    config: ConfigDto;
    prompts: PromptsDto;
}
export declare class ReplyHandlingOutputDto {
    workflow: string;
    leadId: string;
    status: string;
    outputData: {
        leadId: string;
        emailId: string;
        replySentiment: string;
        meetingLink?: string;
    };
    clientId?: string;
}
export declare class LeadValidationPayloadDto {
    leadId: string;
    fullName: string;
    email: string;
    linkedinUrl?: string;
    companyId: string;
    credentials: CredentialsDto;
    config: ConfigDto;
    prompts: PromptsDto;
}
export declare class LeadEnrichmentPayloadDto {
    leadId: string;
    fullName: string;
    email: string;
    linkedinUrl?: string;
    companyId: string;
    credentials: CredentialsDto;
    config: ConfigDto;
    prompts: PromptsDto;
}
export declare class EmailDraftingPayloadDto {
    leadId: string;
    fullName: string;
    email: string;
    linkedinUrl?: string;
    enrichmentData?: Record<string, any>;
    companyId: string;
    campaignId: string;
    aiPersona: AiPersonaDto;
    credentials: CredentialsDto;
    config: ConfigDto;
    prompts: PromptsDto;
}
