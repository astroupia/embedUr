export enum EnrichmentProvider {
  APOLLO = 'APOLLO',
  DROP_CONTACT = 'DROP_CONTACT',
  CLEARBIT = 'CLEARBIT',
  N8N = 'N8N',
}

export enum EnrichmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  COMPLETED = 'COMPLETED',
}

export enum EnrichmentSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  PROVIDER = 'provider',
  STATUS = 'status',
}

export enum EnrichmentSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export const ENRICHMENT_DEFAULT_PAGE_SIZE = 20;
export const ENRICHMENT_MAX_PAGE_SIZE = 100;

// Business rules
export const ENRICHMENT_BUSINESS_RULES = {
  MAX_RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds
  RATE_LIMIT_DELAY_MS: 1000, // 1 second between requests
  MAX_CONCURRENT_REQUESTS: 5,
  WORKFLOW_TIMEOUT_MS: 300000, // 5 minutes for n8n workflows
} as const;

// Provider-specific configurations
export const ENRICHMENT_PROVIDER_CONFIGS = {
  [EnrichmentProvider.APOLLO]: {
    name: 'Apollo',
    baseUrl: 'https://api.apollo.io/v1',
    rateLimit: 100, // requests per minute
    timeout: 30000,
    retryAttempts: 3,
  },
  [EnrichmentProvider.DROP_CONTACT]: {
    name: 'DropContact',
    baseUrl: 'https://api.dropcontact.io',
    rateLimit: 60, // requests per minute
    timeout: 30000,
    retryAttempts: 3,
  },
  [EnrichmentProvider.CLEARBIT]: {
    name: 'Clearbit',
    baseUrl: 'https://person.clearbit.com/v2',
    rateLimit: 50, // requests per minute
    timeout: 30000,
    retryAttempts: 3,
  },
  [EnrichmentProvider.N8N]: {
    name: 'n8n Workflow',
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    rateLimit: 1000, // high rate limit for internal workflows
    timeout: 300000, // 5 minutes for workflow execution
    retryAttempts: 1, // workflows handle their own retries
  },
} as const;

// Enrichment data fields that can be updated
export const ENRICHMENT_DATA_FIELDS = {
  COMPANY_NAME: 'companyName',
  JOB_TITLE: 'jobTitle',
  DEPARTMENT: 'department',
  LOCATION: 'location',
  PHONE: 'phone',
  LINKEDIN_URL: 'linkedinUrl',
  TWITTER_URL: 'twitterUrl',
  FACEBOOK_URL: 'facebookUrl',
  COMPANY_SIZE: 'companySize',
  COMPANY_INDUSTRY: 'companyIndustry',
  COMPANY_WEBSITE: 'companyWebsite',
  VERIFIED_EMAIL: 'verifiedEmail',
  VERIFIED_PHONE: 'verifiedPhone',
} as const;

// Error messages
export const ENRICHMENT_ERROR_MESSAGES = {
  LEAD_NOT_FOUND: 'Lead not found',
  LEAD_NOT_OWNED: 'Lead does not belong to your company',
  PROVIDER_NOT_SUPPORTED: 'Enrichment provider not supported',
  PROVIDER_API_ERROR: 'Enrichment provider API error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded for enrichment provider',
  TIMEOUT: 'Enrichment request timed out',
  INVALID_INPUT: 'Invalid enrichment input data',
  ALREADY_ENRICHING: 'Lead is already being enriched',
  MAX_RETRIES_EXCEEDED: 'Maximum retry attempts exceeded',
} as const; 