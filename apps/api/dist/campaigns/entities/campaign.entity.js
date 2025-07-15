"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignEntity = void 0;
const campaign_constants_1 = require("../constants/campaign.constants");
class CampaignEntity {
    id;
    name;
    description;
    status;
    aiPersonaId;
    workflowId;
    companyId;
    createdAt;
    updatedAt;
    aiPersona;
    workflow;
    leadCount;
    constructor(id, name, description, status, aiPersonaId, workflowId, companyId, createdAt, updatedAt, aiPersona, workflow, leadCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.aiPersonaId = aiPersonaId;
        this.workflowId = workflowId;
        this.companyId = companyId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.aiPersona = aiPersona;
        this.workflow = workflow;
        this.leadCount = leadCount;
    }
    get score() {
        let score = 0;
        if (this.status === campaign_constants_1.CampaignStatus.ACTIVE)
            score += 10;
        if (this.aiPersonaId)
            score += 15;
        if (this.workflowId)
            score += 20;
        if (this.leadCount && this.leadCount > 0)
            score += 25;
        return score;
    }
    get isActive() {
        return this.status === campaign_constants_1.CampaignStatus.ACTIVE;
    }
    get isEditable() {
        return this.status !== campaign_constants_1.CampaignStatus.ARCHIVED && this.status !== campaign_constants_1.CampaignStatus.COMPLETED;
    }
    get isDeletable() {
        return this.status === campaign_constants_1.CampaignStatus.DRAFT || this.status === campaign_constants_1.CampaignStatus.ARCHIVED;
    }
    get hasAI() {
        return this.aiPersonaId !== null;
    }
    get hasWorkflow() {
        return this.workflowId !== null;
    }
    canTransitionTo(newStatus) {
        const validTransitions = {
            [campaign_constants_1.CampaignStatus.DRAFT]: [campaign_constants_1.CampaignStatus.ACTIVE, campaign_constants_1.CampaignStatus.ARCHIVED],
            [campaign_constants_1.CampaignStatus.ACTIVE]: [campaign_constants_1.CampaignStatus.PAUSED, campaign_constants_1.CampaignStatus.COMPLETED, campaign_constants_1.CampaignStatus.ARCHIVED],
            [campaign_constants_1.CampaignStatus.PAUSED]: [campaign_constants_1.CampaignStatus.ACTIVE, campaign_constants_1.CampaignStatus.COMPLETED, campaign_constants_1.CampaignStatus.ARCHIVED],
            [campaign_constants_1.CampaignStatus.COMPLETED]: [campaign_constants_1.CampaignStatus.ARCHIVED],
            [campaign_constants_1.CampaignStatus.ARCHIVED]: [],
        };
        return validTransitions[this.status].includes(newStatus);
    }
    canActivate() {
        return this.status === campaign_constants_1.CampaignStatus.DRAFT || this.status === campaign_constants_1.CampaignStatus.PAUSED;
    }
    canPause() {
        return this.status === campaign_constants_1.CampaignStatus.ACTIVE;
    }
    canComplete() {
        return this.status === campaign_constants_1.CampaignStatus.ACTIVE || this.status === campaign_constants_1.CampaignStatus.PAUSED;
    }
    canArchive() {
        return this.status !== campaign_constants_1.CampaignStatus.ARCHIVED;
    }
    static create(name, description, companyId, aiPersonaId, workflowId) {
        return new CampaignEntity('', name, description, campaign_constants_1.CampaignStatus.DRAFT, aiPersonaId || null, workflowId || null, companyId, new Date(), new Date());
    }
    withStatus(newStatus) {
        return new CampaignEntity(this.id, this.name, this.description, newStatus, this.aiPersonaId, this.workflowId, this.companyId, this.createdAt, new Date(), this.aiPersona, this.workflow, this.leadCount);
    }
    withRelations(aiPersona, workflow, leadCount) {
        return new CampaignEntity(this.id, this.name, this.description, this.status, this.aiPersonaId, this.workflowId, this.companyId, this.createdAt, this.updatedAt, aiPersona, workflow, leadCount);
    }
}
exports.CampaignEntity = CampaignEntity;
//# sourceMappingURL=campaign.entity.js.map