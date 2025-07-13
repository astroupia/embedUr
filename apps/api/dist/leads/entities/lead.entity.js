"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadEntity = void 0;
const lead_constants_1 = require("../constants/lead.constants");
class LeadEntity {
    id;
    fullName;
    email;
    linkedinUrl;
    enrichmentData;
    verified;
    status;
    companyId;
    campaignId;
    createdAt;
    updatedAt;
    campaign;
    constructor(id, fullName, email, linkedinUrl, enrichmentData, verified, status, companyId, campaignId, createdAt, updatedAt, campaign) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.linkedinUrl = linkedinUrl;
        this.enrichmentData = enrichmentData;
        this.verified = verified;
        this.status = status;
        this.companyId = companyId;
        this.campaignId = campaignId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.campaign = campaign;
    }
    get score() {
        let score = 0;
        if (this.verified)
            score += 10;
        if (this.linkedinUrl)
            score += 5;
        if (this.enrichmentData && Object.keys(this.enrichmentData).length > 0)
            score += 15;
        switch (this.status) {
            case lead_constants_1.LeadStatus.INTERESTED:
                score += 30;
                break;
            case lead_constants_1.LeadStatus.BOOKED:
                score += 50;
                break;
            case lead_constants_1.LeadStatus.CONTACTED:
                score += 10;
                break;
            case lead_constants_1.LeadStatus.NOT_INTERESTED:
                score -= 20;
                break;
            case lead_constants_1.LeadStatus.DO_NOT_CONTACT:
                score -= 50;
                break;
        }
        return score;
    }
    get isQualified() {
        return this.score >= 20 && this.status !== lead_constants_1.LeadStatus.DO_NOT_CONTACT;
    }
    get hasEnrichmentData() {
        return this.enrichmentData !== null && Object.keys(this.enrichmentData).length > 0;
    }
    get companyName() {
        return this.enrichmentData?.company || null;
    }
    get jobTitle() {
        return this.enrichmentData?.title || null;
    }
    get location() {
        return this.enrichmentData?.location || null;
    }
    canTransitionTo(newStatus) {
        const validTransitions = {
            [lead_constants_1.LeadStatus.NEW]: [lead_constants_1.LeadStatus.CONTACTED, lead_constants_1.LeadStatus.DO_NOT_CONTACT],
            [lead_constants_1.LeadStatus.CONTACTED]: [lead_constants_1.LeadStatus.INTERESTED, lead_constants_1.LeadStatus.NOT_INTERESTED, lead_constants_1.LeadStatus.BOOKED, lead_constants_1.LeadStatus.DO_NOT_CONTACT],
            [lead_constants_1.LeadStatus.INTERESTED]: [lead_constants_1.LeadStatus.BOOKED, lead_constants_1.LeadStatus.NOT_INTERESTED, lead_constants_1.LeadStatus.DO_NOT_CONTACT],
            [lead_constants_1.LeadStatus.NOT_INTERESTED]: [lead_constants_1.LeadStatus.DO_NOT_CONTACT],
            [lead_constants_1.LeadStatus.BOOKED]: [lead_constants_1.LeadStatus.NOT_INTERESTED, lead_constants_1.LeadStatus.DO_NOT_CONTACT],
            [lead_constants_1.LeadStatus.DO_NOT_CONTACT]: [],
        };
        return validTransitions[this.status].includes(newStatus);
    }
    static create(fullName, email, companyId, campaignId, linkedinUrl) {
        return new LeadEntity('', fullName, email, linkedinUrl || null, null, false, lead_constants_1.LeadStatus.NEW, companyId, campaignId, new Date(), new Date());
    }
}
exports.LeadEntity = LeadEntity;
//# sourceMappingURL=lead.entity.js.map