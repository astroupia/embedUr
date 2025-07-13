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
var WorkflowProgressService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowProgressService = void 0;
const common_1 = require("@nestjs/common");
const workflow_constants_1 = require("../constants/workflow.constants");
const workflow_execution_repository_1 = require("../repositories/workflow-execution.repository");
const workflow_repository_1 = require("../repositories/workflow.repository");
let WorkflowProgressService = WorkflowProgressService_1 = class WorkflowProgressService {
    workflowExecutionRepository;
    workflowRepository;
    logger = new common_1.Logger(WorkflowProgressService_1.name);
    progressCache = new Map();
    subscriptions = new Map();
    constructor(workflowExecutionRepository, workflowRepository) {
        this.workflowExecutionRepository = workflowExecutionRepository;
        this.workflowRepository = workflowRepository;
    }
    async updateProgress(progressUpdate) {
        this.logger.log(`Updating progress for execution ${progressUpdate.executionId}: ${progressUpdate.progress}%`);
        const execution = await this.workflowExecutionRepository.findOne(progressUpdate.executionId, '');
        const workflow = await this.workflowRepository.findOne(execution.workflowId, execution.companyId);
        const progress = {
            executionId: progressUpdate.executionId,
            workflowId: execution.workflowId,
            workflowName: workflow.name,
            status: workflow_constants_1.WorkflowExecutionStatus.RUNNING,
            progress: progressUpdate.progress,
            currentStep: progressUpdate.step,
            totalSteps: this.getTotalStepsForWorkflowType(workflow.type),
            estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(execution, progressUpdate.progress),
            message: progressUpdate.message,
            timestamp: new Date(),
        };
        this.progressCache.set(progressUpdate.executionId, progress);
        await this.notifySubscribers(progress);
    }
    async subscribeToProgress(userId, companyId, executionIds, socketId) {
        this.logger.log(`User ${userId} subscribing to progress for executions: ${executionIds.join(', ')}`);
        const subscription = {
            userId,
            companyId,
            executionIds,
            socketId,
        };
        this.subscriptions.set(socketId, subscription);
        for (const executionId of executionIds) {
            const progress = this.progressCache.get(executionId);
            if (progress) {
                this.logger.log(`Sending progress update to ${socketId}: ${progress.progress}%`);
            }
        }
    }
    async unsubscribeFromProgress(socketId) {
        this.logger.log(`Unsubscribing socket ${socketId} from progress updates`);
        this.subscriptions.delete(socketId);
    }
    async getProgressHistory(executionId) {
        const progress = this.progressCache.get(executionId);
        return progress ? [progress] : [];
    }
    async getWorkflowAnalytics(workflowId) {
        const executions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(workflowId, { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() });
        const totalExecutions = executions.length;
        const completedExecutions = executions.filter(e => e.status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS).length;
        const failedExecutions = executions.filter(e => e.status === workflow_constants_1.WorkflowExecutionStatus.FAILED).length;
        const averageProgress = totalExecutions > 0
            ? (completedExecutions * 100 + failedExecutions * 0) / totalExecutions
            : 0;
        const completedExecutionsWithDuration = executions.filter(e => e.status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS && e.durationMs);
        const averageDuration = completedExecutionsWithDuration.length > 0
            ? completedExecutionsWithDuration.reduce((sum, e) => sum + (e.durationMs || 0), 0) / completedExecutionsWithDuration.length
            : 0;
        return {
            totalExecutions,
            completedExecutions,
            failedExecutions,
            averageProgress,
            averageDuration,
        };
    }
    async getProgress(executionId) {
        return this.progressCache.get(executionId) || null;
    }
    calculateProgress(execution) {
        let progress = 0;
        let currentStep = '';
        let totalSteps = 1;
        let estimatedTimeRemaining;
        switch (execution.status) {
            case workflow_constants_1.WorkflowExecutionStatus.STARTED:
                progress = 10;
                currentStep = 'Started';
                break;
            case workflow_constants_1.WorkflowExecutionStatus.RUNNING:
                const elapsedMs = Date.now() - execution.startTime.getTime();
                const estimatedTotalMs = this.getEstimatedDuration(execution);
                progress = Math.min(90, Math.floor((elapsedMs / estimatedTotalMs) * 100));
                currentStep = 'Processing';
                estimatedTimeRemaining = Math.max(0, Math.floor((estimatedTotalMs - elapsedMs) / 1000));
                break;
            case workflow_constants_1.WorkflowExecutionStatus.SUCCESS:
                progress = 100;
                currentStep = 'Completed';
                break;
            case workflow_constants_1.WorkflowExecutionStatus.FAILED:
                progress = 0;
                currentStep = 'Failed';
                break;
            default:
                progress = 0;
                currentStep = 'Unknown';
        }
        return {
            executionId: execution.id,
            workflowId: execution.workflowId,
            workflowName: 'Unknown Workflow',
            status: execution.status,
            progress,
            currentStep,
            totalSteps,
            estimatedTimeRemaining,
            message: this.getProgressMessage(execution),
            timestamp: new Date(),
        };
    }
    async notifySubscribers(progress) {
        const subscribers = Array.from(this.subscriptions.values()).filter(sub => sub.executionIds.includes(progress.executionId));
        for (const subscriber of subscribers) {
            try {
                this.logger.log(`Notifying subscriber ${subscriber.socketId} about progress: ${progress.progress}%`);
            }
            catch (error) {
                this.logger.error(`Failed to notify subscriber ${subscriber.socketId}:`, error);
            }
        }
    }
    getEstimatedDuration(execution) {
        const estimates = {
            TARGET_AUDIENCE_TRANSLATOR: 30000,
            LEAD_ENRICHMENT: 45000,
            EMAIL_SEQUENCE: 15000,
            LEAD_ROUTING: 20000,
        };
        return estimates['TARGET_AUDIENCE_TRANSLATOR'] || 30000;
    }
    getTotalStepsForWorkflowType(workflowType) {
        const stepCounts = {
            TARGET_AUDIENCE_TRANSLATOR: 3,
            LEAD_ENRICHMENT: 4,
            EMAIL_SEQUENCE: 2,
            LEAD_ROUTING: 3,
        };
        return stepCounts[workflowType] || 1;
    }
    calculateEstimatedTimeRemaining(execution, currentProgress) {
        if (currentProgress <= 0)
            return 0;
        const elapsedMs = Date.now() - execution.startTime.getTime();
        const estimatedTotalMs = (elapsedMs / currentProgress) * 100;
        const remainingMs = estimatedTotalMs - elapsedMs;
        return Math.max(0, Math.floor(remainingMs / 1000));
    }
    getProgressMessage(execution) {
        switch (execution.status) {
            case workflow_constants_1.WorkflowExecutionStatus.STARTED:
                return 'Workflow execution has started';
            case workflow_constants_1.WorkflowExecutionStatus.RUNNING:
                return 'Workflow is currently processing';
            case workflow_constants_1.WorkflowExecutionStatus.SUCCESS:
                return 'Workflow completed successfully';
            case workflow_constants_1.WorkflowExecutionStatus.FAILED:
                return `Workflow failed: ${execution.outputData?.error || 'Unknown error'}`;
            default:
                return 'Workflow status unknown';
        }
    }
    async cleanupOldProgress(maxAgeMs = 24 * 60 * 60 * 1000) {
        const cutoff = Date.now() - maxAgeMs;
        for (const [executionId, progress] of this.progressCache.entries()) {
            if (progress.timestamp.getTime() < cutoff) {
                this.progressCache.delete(executionId);
            }
        }
    }
};
exports.WorkflowProgressService = WorkflowProgressService;
exports.WorkflowProgressService = WorkflowProgressService = WorkflowProgressService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_execution_repository_1.WorkflowExecutionRepository,
        workflow_repository_1.WorkflowRepository])
], WorkflowProgressService);
//# sourceMappingURL=workflow-progress.service.js.map