"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENRICHMENT_ERROR_MESSAGES = exports.ENRICHMENT_DATA_FIELDS = exports.ENRICHMENT_PROVIDER_CONFIGS = exports.ENRICHMENT_BUSINESS_RULES = exports.ENRICHMENT_MAX_PAGE_SIZE = exports.ENRICHMENT_DEFAULT_PAGE_SIZE = exports.EnrichmentSortOrder = exports.EnrichmentSortField = exports.EnrichmentStatus = exports.EnrichmentProvider = void 0;
var EnrichmentProvider;
(function (EnrichmentProvider) {
    EnrichmentProvider["APOLLO"] = "APOLLO";
    EnrichmentProvider["DROP_CONTACT"] = "DROP_CONTACT";
    EnrichmentProvider["CLEARBIT"] = "CLEARBIT";
    EnrichmentProvider["N8N"] = "N8N";
})(EnrichmentProvider || (exports.EnrichmentProvider = EnrichmentProvider = {}));
var EnrichmentStatus;
(function (EnrichmentStatus) {
    EnrichmentStatus["PENDING"] = "PENDING";
    EnrichmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    EnrichmentStatus["SUCCESS"] = "SUCCESS";
    EnrichmentStatus["FAILED"] = "FAILED";
    EnrichmentStatus["TIMEOUT"] = "TIMEOUT";
    EnrichmentStatus["COMPLETED"] = "COMPLETED";
})(EnrichmentStatus || (exports.EnrichmentStatus = EnrichmentStatus = {}));
var EnrichmentSortField;
(function (EnrichmentSortField) {
    EnrichmentSortField["CREATED_AT"] = "createdAt";
    EnrichmentSortField["UPDATED_AT"] = "updatedAt";
    EnrichmentSortField["PROVIDER"] = "provider";
    EnrichmentSortField["STATUS"] = "status";
})(EnrichmentSortField || (exports.EnrichmentSortField = EnrichmentSortField = {}));
var EnrichmentSortOrder;
(function (EnrichmentSortOrder) {
    EnrichmentSortOrder["ASC"] = "asc";
    EnrichmentSortOrder["DESC"] = "desc";
})(EnrichmentSortOrder || (exports.EnrichmentSortOrder = EnrichmentSortOrder = {}));
exports.ENRICHMENT_DEFAULT_PAGE_SIZE = 20;
exports.ENRICHMENT_MAX_PAGE_SIZE = 100;
exports.ENRICHMENT_BUSINESS_RULES = {
    MAX_RETRY_ATTEMPTS: 3,
    REQUEST_TIMEOUT_MS: 30000,
    RATE_LIMIT_DELAY_MS: 1000,
    MAX_CONCURRENT_REQUESTS: 5,
    WORKFLOW_TIMEOUT_MS: 300000,
};
exports.ENRICHMENT_PROVIDER_CONFIGS = {
    [EnrichmentProvider.APOLLO]: {
        name: 'Apollo',
        baseUrl: 'https://api.apollo.io/v1',
        rateLimit: 100,
        timeout: 30000,
        retryAttempts: 3,
    },
    [EnrichmentProvider.DROP_CONTACT]: {
        name: 'DropContact',
        baseUrl: 'https://api.dropcontact.io',
        rateLimit: 60,
        timeout: 30000,
        retryAttempts: 3,
    },
    [EnrichmentProvider.CLEARBIT]: {
        name: 'Clearbit',
        baseUrl: 'https://person.clearbit.com/v2',
        rateLimit: 50,
        timeout: 30000,
        retryAttempts: 3,
    },
    [EnrichmentProvider.N8N]: {
        name: 'n8n Workflow',
        baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
        rateLimit: 1000,
        timeout: 300000,
        retryAttempts: 1,
    },
};
exports.ENRICHMENT_DATA_FIELDS = {
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
};
exports.ENRICHMENT_ERROR_MESSAGES = {
    LEAD_NOT_FOUND: 'Lead not found',
    LEAD_NOT_OWNED: 'Lead does not belong to your company',
    PROVIDER_NOT_SUPPORTED: 'Enrichment provider not supported',
    PROVIDER_API_ERROR: 'Enrichment provider API error',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded for enrichment provider',
    TIMEOUT: 'Enrichment request timed out',
    INVALID_INPUT: 'Invalid enrichment input data',
    ALREADY_ENRICHING: 'Lead is already being enriched',
    MAX_RETRIES_EXCEEDED: 'Maximum retry attempts exceeded',
};
//# sourceMappingURL=enrichment.constants.js.map