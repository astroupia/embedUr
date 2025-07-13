"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkflowExecutionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionService = void 0;
const common_1 = require("@nestjs/common");
const workflow_execution_repository_1 = require("../repositories/workflow-execution.repository");
const workflow_constants_1 = require("../constants/workflow.constants");
let WorkflowExecutionService = WorkflowExecutionService_1 = class WorkflowExecutionService {
    workflowExecutionRepository;
    logger = new common_1.Logger(WorkflowExecutionService_1.name);
    constructor(workflowExecutionRepository) {
        this.workflowExecutionRepository = workflowExecutionRepository;
    }
    async createExecutionRecord(data) {
        this.logger.log(`Creating workflow execution for ${data.type} workflow ${data.workflowId}`);
        const execution = await this.workflowExecutionRepository.create({
            workflowId: data.workflowId,
            leadId: data.leadId,
            companyId: data.companyId,
            status: workflow_constants_1.WorkflowExecutionStatus.STARTED,
            triggeredBy: data.triggeredBy,
            startTime: new Date(),
            inputData: data.inputData,
        });
        this.logger.log(`Workflow execution created: ${execution.id}`);
        return execution;
    }
    async updateExecutionStatus(id, status, outputData, errorMessage) {
        this.logger.log(`Updating execution ${id} status to ${status}`);
        const isCompleted = status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS ||
            status === workflow_constants_1.WorkflowExecutionStatus.FAILED ||
            status === workflow_constants_1.WorkflowExecutionStatus.TIMEOUT;
        let endTime;
        let durationMs;
        if (isCompleted) {
            endTime = new Date();
            const execution = await this.workflowExecutionRepository.findOneForDuration(id);
            if (execution) {
                durationMs = endTime.getTime() - execution.startTime.getTime();
            }
        }
        return this.workflowExecutionRepository.updateStatus(id, status, outputData, errorMessage, endTime, durationMs);
    }
    async findExecution(id, companyId) {
        return this.workflowExecutionRepository.findOne(id, companyId);
    }
    async findPendingExecutions(leadId, companyId) {
        return this.workflowExecutionRepository.findPendingByLead(leadId, companyId);
    }
    async findExecutionsByType(type, companyId, limit = 50) {
        return this.workflowExecutionRepository.findByType(type, companyId, limit);
    }
    async findByWorkflowLeadAndCompany(workflowId, leadId, companyId) {
        return this.workflowExecutionRepository.findByWorkflowLeadAndCompany(workflowId, leadId, companyId);
    }
    async getExecutionStats(companyId) {
        return this.workflowExecutionRepository.getStats(companyId);
    }
    async retryExecution(executionId, companyId) {
        this.logger.log(`Retrying execution ${executionId}`);
        const originalExecution = await this.workflowExecutionRepository.findOne(executionId, companyId);
        if (originalExecution.status !== workflow_constants_1.WorkflowExecutionStatus.FAILED) {
            throw new Error('Only failed executions can be retried');
        }
        const newExecution = await this.workflowExecutionRepository.create({
            workflowId: originalExecution.workflowId,
            leadId: originalExecution.leadId || '',
            companyId: originalExecution.companyId,
            status: workflow_constants_1.WorkflowExecutionStatus.STARTED,
            triggeredBy: `${originalExecution.triggeredBy} (retry)`,
            startTime: new Date(),
            inputData: originalExecution.inputData || {},
        });
        this.logger.log(`Execution retry created: ${newExecution.id}`);
        return newExecution;
    }
    async cleanupOldExecutions(daysOld = 30) {
        this.logger.log(`Cleaning up workflow executions older than ${daysOld} days`);
        const deletedCount = await this.workflowExecutionRepository.cleanupOld(daysOld);
        this.logger.log(`Cleaned up ${deletedCount} old workflow executions`);
        return deletedCount;
    }
};
exports.WorkflowExecutionService = WorkflowExecutionService;
exports.WorkflowExecutionService = WorkflowExecutionService = WorkflowExecutionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_execution_repository_1.WorkflowExecutionRepository])
], WorkflowExecutionService);
//# sourceMappingURL=workflow-execution.service.js.map