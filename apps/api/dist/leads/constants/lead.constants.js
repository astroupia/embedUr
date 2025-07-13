"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEAD_DUPLICATE_THRESHOLD = exports.LEAD_SCORE_WEIGHTS = exports.LEAD_MAX_PAGE_SIZE = exports.LEAD_DEFAULT_PAGE_SIZE = exports.LeadSortOrder = exports.LeadSortField = exports.LeadStatus = void 0;
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "NEW";
    LeadStatus["CONTACTED"] = "CONTACTED";
    LeadStatus["INTERESTED"] = "INTERESTED";
    LeadStatus["NOT_INTERESTED"] = "NOT_INTERESTED";
    LeadStatus["BOOKED"] = "BOOKED";
    LeadStatus["DO_NOT_CONTACT"] = "DO_NOT_CONTACT";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var LeadSortField;
(function (LeadSortField) {
    LeadSortField["CREATED_AT"] = "createdAt";
    LeadSortField["UPDATED_AT"] = "updatedAt";
    LeadSortField["FULL_NAME"] = "fullName";
    LeadSortField["EMAIL"] = "email";
    LeadSortField["STATUS"] = "status";
})(LeadSortField || (exports.LeadSortField = LeadSortField = {}));
var LeadSortOrder;
(function (LeadSortOrder) {
    LeadSortOrder["ASC"] = "asc";
    LeadSortOrder["DESC"] = "desc";
})(LeadSortOrder || (exports.LeadSortOrder = LeadSortOrder = {}));
exports.LEAD_DEFAULT_PAGE_SIZE = 20;
exports.LEAD_MAX_PAGE_SIZE = 100;
exports.LEAD_SCORE_WEIGHTS = {
    EMAIL_VERIFIED: 10,
    LINKEDIN_URL_PRESENT: 5,
    ENRICHMENT_DATA_PRESENT: 15,
    RECENT_ACTIVITY: 20,
};
exports.LEAD_DUPLICATE_THRESHOLD = 0.8;
//# sourceMappingURL=lead.constants.js.map