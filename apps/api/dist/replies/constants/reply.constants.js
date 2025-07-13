"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOOKING_WORKFLOW_CONFIG = exports.REPLY_WORKFLOW_CONFIG = exports.BOOKING_VALIDATION_RULES = exports.REPLY_VALIDATION_RULES = exports.BOOKING_STATUS_LABELS = exports.REPLY_CLASSIFICATION_LABELS = exports.ReplySource = exports.BookingStatus = exports.ReplyClassification = void 0;
var ReplyClassification;
(function (ReplyClassification) {
    ReplyClassification["INTERESTED"] = "INTERESTED";
    ReplyClassification["NOT_INTERESTED"] = "NOT_INTERESTED";
    ReplyClassification["AUTO_REPLY"] = "AUTO_REPLY";
    ReplyClassification["UNSUBSCRIBE"] = "UNSUBSCRIBE";
    ReplyClassification["QUESTION"] = "QUESTION";
    ReplyClassification["NEUTRAL"] = "NEUTRAL";
})(ReplyClassification || (exports.ReplyClassification = ReplyClassification = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["BOOKED"] = "BOOKED";
    BookingStatus["RESCHEDULED"] = "RESCHEDULED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["PENDING"] = "PENDING";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var ReplySource;
(function (ReplySource) {
    ReplySource["SMARTLEAD"] = "SMARTLEAD";
    ReplySource["MANUAL"] = "MANUAL";
    ReplySource["WEBHOOK"] = "WEBHOOK";
})(ReplySource || (exports.ReplySource = ReplySource = {}));
exports.REPLY_CLASSIFICATION_LABELS = {
    [ReplyClassification.INTERESTED]: 'Interested',
    [ReplyClassification.NOT_INTERESTED]: 'Not Interested',
    [ReplyClassification.AUTO_REPLY]: 'Auto Reply',
    [ReplyClassification.UNSUBSCRIBE]: 'Unsubscribe',
    [ReplyClassification.QUESTION]: 'Question',
    [ReplyClassification.NEUTRAL]: 'Neutral',
};
exports.BOOKING_STATUS_LABELS = {
    [BookingStatus.BOOKED]: 'Booked',
    [BookingStatus.RESCHEDULED]: 'Rescheduled',
    [BookingStatus.CANCELLED]: 'Cancelled',
    [BookingStatus.COMPLETED]: 'Completed',
    [BookingStatus.PENDING]: 'Pending',
};
exports.REPLY_VALIDATION_RULES = {
    MAX_CONTENT_LENGTH: 10000,
    MIN_CONTENT_LENGTH: 1,
    MAX_SUBJECT_LENGTH: 200,
};
exports.BOOKING_VALIDATION_RULES = {
    MAX_CALENDLY_LINK_LENGTH: 500,
    MIN_SCHEDULED_TIME_OFFSET: 15 * 60 * 1000,
    MAX_SCHEDULED_TIME_OFFSET: 365 * 24 * 60 * 60 * 1000,
};
exports.REPLY_WORKFLOW_CONFIG = {
    WORKFLOW_TYPE: 'LEAD_ROUTING',
    TRIGGERED_BY: 'ReplyService',
    TIMEOUT_MS: 300000,
    MAX_RETRIES: 3,
};
exports.BOOKING_WORKFLOW_CONFIG = {
    WORKFLOW_TYPE: 'LEAD_ROUTING',
    TRIGGERED_BY: 'BookingService',
    TIMEOUT_MS: 60000,
    MAX_RETRIES: 2,
};
//# sourceMappingURL=reply.constants.js.map