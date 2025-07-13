"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEntity = void 0;
const workflow_constants_1 = require("../constants/workflow.constants");
class WorkflowEntity {
    id;
    name;
    type;
    n8nWorkflowId;
    companyId;
    createdAt;
    updatedAt;
    executionCount;
    lastExecution;
    constructor(id, name, type, n8nWorkflowId, companyId, createdAt, updatedAt, executionCount, lastExecution) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.n8nWorkflowId = n8nWorkflowId;
        this.companyId = companyId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.executionCount = executionCount;
        this.lastExecution = lastExecution;
    }
    get isActive() {
        return this.executionCount !== undefined && this.executionCount > 0;
    }
    get typeDescription() {
        const descriptions = {
            [workflow_constants_1.WorkflowType.TARGET_AUDIENCE_TRANSLATOR]: 'Target Audience Translator',
            [workflow_constants_1.WorkflowType.LEAD_ENRICHMENT]: 'Lead Enrichment',
            [workflow_constants_1.WorkflowType.EMAIL_SEQUENCE]: 'Email Sequence',
            [workflow_constants_1.WorkflowType.LEAD_ROUTING]: 'Lead Routing',
        };
        return descriptions[this.type];
    }
    get canBeDeleted() {
        if (!this.lastExecution)
            return true;
        if (!this.lastExecution.endTime)
            return false;
        return Date.now() - this.lastExecution.endTime.getTime() > 24 * 60 * 60 * 1000;
    }
    get isTargetAudienceTranslatorWorkflow() {
        return this.type === workflow_constants_1.WorkflowType.TARGET_AUDIENCE_TRANSLATOR;
    }
    get isEnrichmentWorkflow() {
        return this.type === workflow_constants_1.WorkflowType.LEAD_ENRICHMENT;
    }
    get isEmailSequenceWorkflow() {
        return this.type === workflow_constants_1.WorkflowType.EMAIL_SEQUENCE;
    }
    get isRoutingWorkflow() {
        return this.type === workflow_constants_1.WorkflowType.LEAD_ROUTING;
    }
    canExecuteWithInput(inputData) {
        switch (this.type) {
            case workflow_constants_1.WorkflowType.TARGET_AUDIENCE_TRANSLATOR:
                return inputData.targetAudienceData !== undefined || inputData.inputFormat !== undefined;
            case workflow_constants_1.WorkflowType.LEAD_ENRICHMENT:
                return inputData.leadId !== undefined || inputData.email !== undefined;
            case workflow_constants_1.WorkflowType.EMAIL_SEQUENCE:
                return inputData.campaignId !== undefined && inputData.leadId !== undefined;
            case workflow_constants_1.WorkflowType.LEAD_ROUTING:
                return inputData.leadId !== undefined;
            default:
                return true;
        }
    }
    static create(name, type, n8nWorkflowId, companyId) {
        return new WorkflowEntity('', name, type, n8nWorkflowId, companyId, new Date(), new Date());
    }
    withExecutionSummary(executionCount, lastExecution) {
        return new WorkflowEntity(this.id, this.name, this.type, this.n8nWorkflowId, this.companyId, this.createdAt, this.updatedAt, executionCount, lastExecution);
    }
}
exports.WorkflowEntity = WorkflowEntity;
//# sourceMappingURL=workflow.entity.js.map