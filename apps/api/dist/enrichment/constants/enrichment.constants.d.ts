export declare enum EnrichmentProvider {
    APOLLO = "APOLLO",
    DROP_CONTACT = "DROP_CONTACT",
    CLEARBIT = "CLEARBIT",
    N8N = "N8N"
}
export declare enum EnrichmentStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    TIMEOUT = "TIMEOUT",
    COMPLETED = "COMPLETED"
}
export declare enum EnrichmentSortField {
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt",
    PROVIDER = "provider",
    STATUS = "status"
}
export declare enum EnrichmentSortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare const ENRICHMENT_DEFAULT_PAGE_SIZE = 20;
export declare const ENRICHMENT_MAX_PAGE_SIZE = 100;
export declare const ENRICHMENT_BUSINESS_RULES: {
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly REQUEST_TIMEOUT_MS: 30000;
    readonly RATE_LIMIT_DELAY_MS: 1000;
    readonly MAX_CONCURRENT_REQUESTS: 5;
    readonly WORKFLOW_TIMEOUT_MS: 300000;
};
export declare const ENRICHMENT_PROVIDER_CONFIGS: {
    readonly APOLLO: {
        readonly name: "Apollo";
        readonly baseUrl: "https://api.apollo.io/v1";
        readonly rateLimit: 100;
        readonly timeout: 30000;
        readonly retryAttempts: 3;
    };
    readonly DROP_CONTACT: {
        readonly name: "DropContact";
        readonly baseUrl: "https://api.dropcontact.io";
        readonly rateLimit: 60;
        readonly timeout: 30000;
        readonly retryAttempts: 3;
    };
    readonly CLEARBIT: {
        readonly name: "Clearbit";
        readonly baseUrl: "https://person.clearbit.com/v2";
        readonly rateLimit: 50;
        readonly timeout: 30000;
        readonly retryAttempts: 3;
    };
    readonly N8N: {
        readonly name: "n8n Workflow";
        readonly baseUrl: string;
        readonly rateLimit: 1000;
        readonly timeout: 300000;
        readonly retryAttempts: 1;
    };
};
export declare const ENRICHMENT_DATA_FIELDS: {
    readonly COMPANY_NAME: "companyName";
    readonly JOB_TITLE: "jobTitle";
    readonly DEPARTMENT: "department";
    readonly LOCATION: "location";
    readonly PHONE: "phone";
    readonly LINKEDIN_URL: "linkedinUrl";
    readonly TWITTER_URL: "twitterUrl";
    readonly FACEBOOK_URL: "facebookUrl";
    readonly COMPANY_SIZE: "companySize";
    readonly COMPANY_INDUSTRY: "companyIndustry";
    readonly COMPANY_WEBSITE: "companyWebsite";
    readonly VERIFIED_EMAIL: "verifiedEmail";
    readonly VERIFIED_PHONE: "verifiedPhone";
};
export declare const ENRICHMENT_ERROR_MESSAGES: {
    readonly LEAD_NOT_FOUND: "Lead not found";
    readonly LEAD_NOT_OWNED: "Lead does not belong to your company";
    readonly PROVIDER_NOT_SUPPORTED: "Enrichment provider not supported";
    readonly PROVIDER_API_ERROR: "Enrichment provider API error";
    readonly RATE_LIMIT_EXCEEDED: "Rate limit exceeded for enrichment provider";
    readonly TIMEOUT: "Enrichment request timed out";
    readonly INVALID_INPUT: "Invalid enrichment input data";
    readonly ALREADY_ENRICHING: "Lead is already being enriched";
    readonly MAX_RETRIES_EXCEEDED: "Maximum retry attempts exceeded";
};
