export declare enum CampaignStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED",
    ARCHIVED = "ARCHIVED"
}
export declare enum CampaignSortField {
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt",
    NAME = "name",
    STATUS = "status"
}
export declare enum CampaignSortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare const CAMPAIGN_DEFAULT_PAGE_SIZE = 20;
export declare const CAMPAIGN_MAX_PAGE_SIZE = 100;
export declare const VALID_STATUS_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]>;
export declare const CAMPAIGN_BUSINESS_RULES: {
    readonly MIN_NAME_LENGTH: 1;
    readonly MAX_NAME_LENGTH: 100;
    readonly MIN_DESCRIPTION_LENGTH: 0;
    readonly MAX_DESCRIPTION_LENGTH: 500;
};
export declare const CAMPAIGN_SCORE_WEIGHTS: {
    readonly ACTIVE_STATUS: 10;
    readonly HAS_AI_PERSONA: 15;
    readonly HAS_WORKFLOW: 20;
    readonly HAS_LEADS: 25;
};
