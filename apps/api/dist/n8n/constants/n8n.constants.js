"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8N_ENDPOINTS = exports.N8N_CONSTANTS = exports.N8nNotificationLevel = exports.N8nWorkflowType = exports.N8nWebhookSource = void 0;
var N8nWebhookSource;
(function (N8nWebhookSource) {
    N8nWebhookSource["N8N"] = "N8N";
    N8nWebhookSource["SMARTLEAD"] = "SMARTLEAD";
    N8nWebhookSource["CALENDLY"] = "CALENDLY";
    N8nWebhookSource["APOLLO"] = "APOLLO";
    N8nWebhookSource["CLEARBIT"] = "CLEARBIT";
})(N8nWebhookSource || (exports.N8nWebhookSource = N8nWebhookSource = {}));
var N8nWorkflowType;
(function (N8nWorkflowType) {
    N8nWorkflowType["LEAD_VALIDATION"] = "LEAD_VALIDATION";
    N8nWorkflowType["LEAD_ENRICHMENT"] = "LEAD_ENRICHMENT";
    N8nWorkflowType["EMAIL_DRAFTING"] = "EMAIL_DRAFTING";
    N8nWorkflowType["REPLY_HANDLING"] = "REPLY_HANDLING";
    N8nWorkflowType["CAMPAIGN_COMPLETION"] = "CAMPAIGN_COMPLETION";
    N8nWorkflowType["LEAD_ASSIGNMENT"] = "LEAD_ASSIGNMENT";
})(N8nWorkflowType || (exports.N8nWorkflowType = N8nWorkflowType = {}));
var N8nNotificationLevel;
(function (N8nNotificationLevel) {
    N8nNotificationLevel["INFO"] = "INFO";
    N8nNotificationLevel["SUCCESS"] = "SUCCESS";
    N8nNotificationLevel["WARNING"] = "WARNING";
    N8nNotificationLevel["ERROR"] = "ERROR";
})(N8nNotificationLevel || (exports.N8nNotificationLevel = N8nNotificationLevel = {}));
exports.N8N_CONSTANTS = {
    WEBHOOK_TIMEOUT_MS: 30000,
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 5000,
    CLEANUP_RETENTION_DAYS: {
        WEBHOOK_EVENTS: 30,
        USAGE_METRICS: 90,
        SYSTEM_NOTIFICATIONS: 60,
    },
    DEFAULT_LIMITS: {
        WEBHOOK_EVENTS: 50,
        SYSTEM_NOTIFICATIONS: 50,
        USAGE_METRICS: 100,
    },
};
exports.N8N_ENDPOINTS = {
    COMPLETE: '/api/n8n/complete',
    LOG: '/api/n8n/log',
    REPLIES: '/api/n8n/replies',
    REPLIES_COMPLETE: '/api/n8n/replies/complete',
};
//# sourceMappingURL=n8n.constants.js.map