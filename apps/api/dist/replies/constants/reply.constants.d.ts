export declare enum ReplyClassification {
    INTERESTED = "INTERESTED",
    NOT_INTERESTED = "NOT_INTERESTED",
    AUTO_REPLY = "AUTO_REPLY",
    UNSUBSCRIBE = "UNSUBSCRIBE",
    QUESTION = "QUESTION",
    NEUTRAL = "NEUTRAL"
}
export declare enum BookingStatus {
    BOOKED = "BOOKED",
    RESCHEDULED = "RESCHEDULED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
    PENDING = "PENDING"
}
export declare enum ReplySource {
    SMARTLEAD = "SMARTLEAD",
    MANUAL = "MANUAL",
    WEBHOOK = "WEBHOOK"
}
export declare const REPLY_CLASSIFICATION_LABELS: {
    INTERESTED: string;
    NOT_INTERESTED: string;
    AUTO_REPLY: string;
    UNSUBSCRIBE: string;
    QUESTION: string;
    NEUTRAL: string;
};
export declare const BOOKING_STATUS_LABELS: {
    BOOKED: string;
    RESCHEDULED: string;
    CANCELLED: string;
    COMPLETED: string;
    PENDING: string;
};
export declare const REPLY_VALIDATION_RULES: {
    MAX_CONTENT_LENGTH: number;
    MIN_CONTENT_LENGTH: number;
    MAX_SUBJECT_LENGTH: number;
};
export declare const BOOKING_VALIDATION_RULES: {
    MAX_CALENDLY_LINK_LENGTH: number;
    MIN_SCHEDULED_TIME_OFFSET: number;
    MAX_SCHEDULED_TIME_OFFSET: number;
};
export declare const REPLY_WORKFLOW_CONFIG: {
    WORKFLOW_TYPE: string;
    TRIGGERED_BY: string;
    TIMEOUT_MS: number;
    MAX_RETRIES: number;
};
export declare const BOOKING_WORKFLOW_CONFIG: {
    WORKFLOW_TYPE: string;
    TRIGGERED_BY: string;
    TIMEOUT_MS: number;
    MAX_RETRIES: number;
};
