export declare enum LeadStatus {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    INTERESTED = "INTERESTED",
    NOT_INTERESTED = "NOT_INTERESTED",
    BOOKED = "BOOKED",
    DO_NOT_CONTACT = "DO_NOT_CONTACT"
}
export declare enum LeadSortField {
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt",
    FULL_NAME = "fullName",
    EMAIL = "email",
    STATUS = "status"
}
export declare enum LeadSortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare const LEAD_DEFAULT_PAGE_SIZE = 20;
export declare const LEAD_MAX_PAGE_SIZE = 100;
export declare const LEAD_SCORE_WEIGHTS: {
    readonly EMAIL_VERIFIED: 10;
    readonly LINKEDIN_URL_PRESENT: 5;
    readonly ENRICHMENT_DATA_PRESENT: 15;
    readonly RECENT_ACTIVITY: 20;
};
export declare const LEAD_DUPLICATE_THRESHOLD = 0.8;
