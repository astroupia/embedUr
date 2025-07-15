"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAMPAIGN_SCORE_WEIGHTS = exports.CAMPAIGN_BUSINESS_RULES = exports.VALID_STATUS_TRANSITIONS = exports.CAMPAIGN_MAX_PAGE_SIZE = exports.CAMPAIGN_DEFAULT_PAGE_SIZE = exports.CampaignSortOrder = exports.CampaignSortField = exports.CampaignStatus = void 0;
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["DRAFT"] = "DRAFT";
    CampaignStatus["ACTIVE"] = "ACTIVE";
    CampaignStatus["PAUSED"] = "PAUSED";
    CampaignStatus["COMPLETED"] = "COMPLETED";
    CampaignStatus["ARCHIVED"] = "ARCHIVED";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
var CampaignSortField;
(function (CampaignSortField) {
    CampaignSortField["CREATED_AT"] = "createdAt";
    CampaignSortField["UPDATED_AT"] = "updatedAt";
    CampaignSortField["NAME"] = "name";
    CampaignSortField["STATUS"] = "status";
})(CampaignSortField || (exports.CampaignSortField = CampaignSortField = {}));
var CampaignSortOrder;
(function (CampaignSortOrder) {
    CampaignSortOrder["ASC"] = "asc";
    CampaignSortOrder["DESC"] = "desc";
})(CampaignSortOrder || (exports.CampaignSortOrder = CampaignSortOrder = {}));
exports.CAMPAIGN_DEFAULT_PAGE_SIZE = 20;
exports.CAMPAIGN_MAX_PAGE_SIZE = 100;
exports.VALID_STATUS_TRANSITIONS = {
    [CampaignStatus.DRAFT]: [CampaignStatus.ACTIVE, CampaignStatus.ARCHIVED],
    [CampaignStatus.ACTIVE]: [CampaignStatus.PAUSED, CampaignStatus.COMPLETED, CampaignStatus.ARCHIVED],
    [CampaignStatus.PAUSED]: [CampaignStatus.ACTIVE, CampaignStatus.COMPLETED, CampaignStatus.ARCHIVED],
    [CampaignStatus.COMPLETED]: [CampaignStatus.ARCHIVED],
    [CampaignStatus.ARCHIVED]: [],
};
exports.CAMPAIGN_BUSINESS_RULES = {
    MIN_NAME_LENGTH: 1,
    MAX_NAME_LENGTH: 100,
    MIN_DESCRIPTION_LENGTH: 0,
    MAX_DESCRIPTION_LENGTH: 500,
};
exports.CAMPAIGN_SCORE_WEIGHTS = {
    ACTIVE_STATUS: 10,
    HAS_AI_PERSONA: 15,
    HAS_WORKFLOW: 20,
    HAS_LEADS: 25,
};
//# sourceMappingURL=campaign.constants.js.map