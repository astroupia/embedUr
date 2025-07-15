"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionEntity = void 0;
const workflow_constants_1 = require("../constants/workflow.constants");
class WorkflowExecutionEntity {
    id;
    status;
    triggeredBy;
    startTime;
    endTime;
    inputData;
    outputData;
    durationMs;
    leadId;
    workflowId;
    companyId;
    errorMessage;
    constructor(id, status, triggeredBy, startTime, endTime, inputData, outputData, durationMs, leadId, workflowId, companyId, errorMessage) {
        this.id = id;
        this.status = status;
        this.triggeredBy = triggeredBy;
        this.startTime = startTime;
        this.endTime = endTime;
        this.inputData = inputData;
        this.outputData = outputData;
        this.durationMs = durationMs;
        this.leadId = leadId;
        this.workflowId = workflowId;
        this.companyId = companyId;
        this.errorMessage = errorMessage;
    }
    get isCompleted() {
        return this.status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS ||
            this.status === workflow_constants_1.WorkflowExecutionStatus.FAILED ||
            this.status === workflow_constants_1.WorkflowExecutionStatus.TIMEOUT ||
            this.status === workflow_constants_1.WorkflowExecutionStatus.CANCELLED;
    }
    get isRunning() {
        return this.status === workflow_constants_1.WorkflowExecutionStatus.STARTED ||
            this.status === workflow_constants_1.WorkflowExecutionStatus.RUNNING;
    }
    get isSuccessful() {
        return this.status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS;
    }
    get isFailed() {
        return this.status === workflow_constants_1.WorkflowExecutionStatus.FAILED ||
            this.status === workflow_constants_1.WorkflowExecutionStatus.TIMEOUT;
    }
    get durationSeconds() {
        return this.durationMs ? Math.round(this.durationMs / 1000) : null;
    }
    get hasError() {
        return this.errorMessage !== undefined && this.errorMessage.length > 0;
    }
    get executionTime() {
        if (!this.durationMs)
            return 'N/A';
        const seconds = Math.floor(this.durationMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${remainingSeconds}s`;
    }
    canBeRetried() {
        return this.isFailed && this.status !== workflow_constants_1.WorkflowExecutionStatus.TIMEOUT;
    }
    static create(workflowId, companyId, triggeredBy, inputData, leadId) {
        return new WorkflowExecutionEntity('', workflow_constants_1.WorkflowExecutionStatus.STARTED, triggeredBy, new Date(), null, inputData, null, null, leadId || null, workflowId, companyId);
    }
    withStatus(status, outputData, errorMessage) {
        const endTime = this.isCompleted ? new Date() : this.endTime;
        const durationMs = endTime && this.startTime
            ? endTime.getTime() - this.startTime.getTime()
            : this.durationMs;
        return new WorkflowExecutionEntity(this.id, status, this.triggeredBy, this.startTime, endTime, this.inputData, outputData || this.outputData, durationMs, this.leadId, this.workflowId, this.companyId, errorMessage);
    }
}
exports.WorkflowExecutionEntity = WorkflowExecutionEntity;
//# sourceMappingURL=workflow-execution.entity.js.map