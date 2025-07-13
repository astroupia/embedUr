export declare enum N8nWebhookSource {
    N8N = "N8N",
    SMARTLEAD = "SMARTLEAD",
    CALENDLY = "CALENDLY",
    APOLLO = "APOLLO",
    CLEARBIT = "CLEARBIT"
}
export declare enum N8nWorkflowType {
    LEAD_VALIDATION = "LEAD_VALIDATION",
    LEAD_ENRICHMENT = "LEAD_ENRICHMENT",
    EMAIL_DRAFTING = "EMAIL_DRAFTING",
    REPLY_HANDLING = "REPLY_HANDLING",
    CAMPAIGN_COMPLETION = "CAMPAIGN_COMPLETION",
    LEAD_ASSIGNMENT = "LEAD_ASSIGNMENT"
}
export declare enum N8nNotificationLevel {
    INFO = "INFO",
    SUCCESS = "SUCCESS",
    WARNING = "WARNING",
    ERROR = "ERROR"
}
export declare const N8N_CONSTANTS: {
    readonly WEBHOOK_TIMEOUT_MS: 30000;
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY_MS: 5000;
    readonly CLEANUP_RETENTION_DAYS: {
        readonly WEBHOOK_EVENTS: 30;
        readonly USAGE_METRICS: 90;
        readonly SYSTEM_NOTIFICATIONS: 60;
    };
    readonly DEFAULT_LIMITS: {
        readonly WEBHOOK_EVENTS: 50;
        readonly SYSTEM_NOTIFICATIONS: 50;
        readonly USAGE_METRICS: 100;
    };
};
export declare const N8N_ENDPOINTS: {
    readonly COMPLETE: "/api/n8n/complete";
    readonly LOG: "/api/n8n/log";
    readonly REPLIES: "/api/n8n/replies";
    readonly REPLIES_COMPLETE: "/api/n8n/replies/complete";
};
