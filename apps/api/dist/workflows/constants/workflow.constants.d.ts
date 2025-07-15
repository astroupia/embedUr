export declare enum WorkflowType {
    LEAD_ENRICHMENT = "LEAD_ENRICHMENT",
    EMAIL_SEQUENCE = "EMAIL_SEQUENCE",
    LEAD_ROUTING = "LEAD_ROUTING",
    TARGET_AUDIENCE_TRANSLATOR = "TARGET_AUDIENCE_TRANSLATOR"
}
export declare enum WorkflowExecutionStatus {
    STARTED = "STARTED",
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    TIMEOUT = "TIMEOUT",
    CANCELLED = "CANCELLED"
}
export declare enum WorkflowSortField {
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt",
    NAME = "name",
    TYPE = "type"
}
export declare enum WorkflowSortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare const WORKFLOW_DEFAULT_PAGE_SIZE = 20;
export declare const WORKFLOW_MAX_PAGE_SIZE = 100;
export declare const WORKFLOW_BUSINESS_RULES: {
    readonly MIN_NAME_LENGTH: 1;
    readonly MAX_NAME_LENGTH: 100;
    readonly MAX_EXECUTION_DURATION_MS: 300000;
    readonly MAX_RETRY_ATTEMPTS: 3;
};
export declare const WORKFLOW_TYPE_DESCRIPTIONS: {
    readonly LEAD_ENRICHMENT: "Automated enrichment processes on lead profiles";
    readonly EMAIL_SEQUENCE: "Multi-step automated email campaigns";
    readonly LEAD_ROUTING: "Assign or route leads based on conditions/workflows";
    readonly TARGET_AUDIENCE_TRANSLATOR: "Translate and adapt content for different target audiences";
};
export declare const EXECUTION_STATUS_DESCRIPTIONS: {
    readonly STARTED: "Execution has been initiated";
    readonly RUNNING: "Execution is currently processing";
    readonly SUCCESS: "Execution completed successfully";
    readonly FAILED: "Execution failed with an error";
    readonly TIMEOUT: "Execution timed out";
    readonly CANCELLED: "Execution was cancelled";
};
