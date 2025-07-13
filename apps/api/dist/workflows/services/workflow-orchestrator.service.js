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
var WorkflowOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const workflow_service_1 = require("./workflow.service");
const workflow_constants_1 = require("../constants/workflow.constants");
let WorkflowOrchestratorService = WorkflowOrchestratorService_1 = class WorkflowOrchestratorService {
    workflowService;
    logger = new common_1.Logger(WorkflowOrchestratorService_1.name);
    constructor(workflowService) {
        this.workflowService = workflowService;
    }
    async executeChain(chain, inputData, companyId, triggeredBy) {
        this.logger.log(`Executing workflow chain ${chain.id} for company ${companyId}`);
        const chainExecution = {
            id: this.generateId(),
            chainId: chain.id,
            companyId,
            triggeredBy,
            status: 'PENDING',
            currentStep: 0,
            stepExecutions: [],
            inputData,
            startTime: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setTimeout(() => {
            this.executeChainSteps(chain, chainExecution).catch(error => {
                this.logger.error(`Chain execution failed for ${chain.id}:`, error);
            });
        }, 100);
        return chainExecution;
    }
    async executeChainSteps(chain, execution) {
        try {
            execution.status = 'RUNNING';
            execution.updatedAt = new Date();
            const sortedSteps = this.sortStepsByDependencies(chain.steps);
            for (let i = 0; i < sortedSteps.length; i++) {
                const step = sortedSteps[i];
                execution.currentStep = i + 1;
                if (!this.shouldExecuteStep(step, execution)) {
                    this.logger.log(`Skipping step ${step.id} due to condition`);
                    continue;
                }
                const stepInput = this.prepareStepInput(step, execution);
                const stepExecution = await this.executeWorkflowStep(step, stepInput, execution);
                execution.stepExecutions.push(stepExecution);
                if (stepExecution.status === 'FAILED') {
                    execution.status = 'FAILED';
                    execution.errorMessage = stepExecution.errorMessage;
                    execution.endTime = new Date();
                    execution.updatedAt = new Date();
                    return;
                }
                if (stepExecution.outputData) {
                    execution.outputData = {
                        ...execution.outputData,
                        [`step_${step.id}`]: stepExecution.outputData,
                    };
                }
            }
            execution.status = 'COMPLETED';
            execution.endTime = new Date();
            execution.updatedAt = new Date();
            this.logger.log(`Chain execution ${execution.id} completed successfully`);
        }
        catch (error) {
            execution.status = 'FAILED';
            execution.errorMessage = error.message;
            execution.endTime = new Date();
            execution.updatedAt = new Date();
            this.logger.error(`Chain execution ${execution.id} failed:`, error);
        }
    }
    async executeWorkflowStep(step, inputData, chainExecution) {
        const stepExecution = {
            id: this.generateId(),
            stepId: step.id,
            workflowExecutionId: '',
            status: workflow_constants_1.WorkflowExecutionStatus.STARTED,
            inputData,
            startTime: new Date(),
            retryCount: 0,
        };
        let lastError = null;
        for (let attempt = 0; attempt <= (step.retryConfig?.maxRetries || 0); attempt++) {
            try {
                stepExecution.retryCount = attempt;
                const workflowExecution = await this.workflowService.executeWorkflow(step.workflowId, chainExecution.companyId, { inputData }, chainExecution.triggeredBy);
                stepExecution.workflowExecutionId = workflowExecution.id;
                stepExecution.status = workflowExecution.status;
                stepExecution.outputData = workflowExecution.outputData || undefined;
                stepExecution.endTime = new Date();
                if (workflowExecution.status === 'SUCCESS') {
                    return stepExecution;
                }
                else if (workflowExecution.status === 'FAILED') {
                    lastError = new Error(workflowExecution.outputData?.error || 'Workflow execution failed');
                }
                if (attempt < (step.retryConfig?.maxRetries || 0) && step.retryConfig?.backoffMs) {
                    await this.delay(step.retryConfig.backoffMs * Math.pow(2, attempt));
                }
            }
            catch (error) {
                lastError = error;
                if (attempt < (step.retryConfig?.maxRetries || 0)) {
                    await this.delay(step.retryConfig?.backoffMs || 1000);
                }
            }
        }
        stepExecution.status = workflow_constants_1.WorkflowExecutionStatus.FAILED;
        stepExecution.errorMessage = lastError?.message || 'Step execution failed';
        stepExecution.endTime = new Date();
        return stepExecution;
    }
    prepareStepInput(step, execution) {
        const stepInput = {};
        for (const [targetKey, sourcePath] of Object.entries(step.inputMapping)) {
            const value = this.getNestedValue(execution.outputData || execution.inputData, sourcePath);
            if (value !== undefined) {
                stepInput[targetKey] = value;
            }
        }
        return stepInput;
    }
    shouldExecuteStep(step, execution) {
        if (!step.condition) {
            return true;
        }
        try {
            const context = {
                ...execution.outputData,
                ...execution.inputData,
                step: execution.currentStep,
            };
            return this.evaluateCondition(step.condition, context);
        }
        catch (error) {
            this.logger.warn(`Failed to evaluate condition for step ${step.id}:`, error);
            return true;
        }
    }
    sortStepsByDependencies(steps) {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();
        const visit = (step) => {
            if (visiting.has(step.id)) {
                throw new Error(`Circular dependency detected in workflow chain`);
            }
            if (visited.has(step.id)) {
                return;
            }
            visiting.add(step.id);
            if (step.dependsOn) {
                for (const depId of step.dependsOn) {
                    const depStep = steps.find(s => s.id === depId);
                    if (depStep) {
                        visit(depStep);
                    }
                }
            }
            visiting.delete(step.id);
            visited.add(step.id);
            sorted.push(step);
        };
        for (const step of steps) {
            if (!visited.has(step.id)) {
                visit(step);
            }
        }
        return sorted;
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    evaluateCondition(condition, context) {
        try {
            let evalCondition = condition;
            for (const [key, value] of Object.entries(context)) {
                evalCondition = evalCondition.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), JSON.stringify(value));
            }
            return eval(evalCondition);
        }
        catch (error) {
            this.logger.warn(`Condition evaluation failed: ${condition}`, error);
            return false;
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    generateId() {
        return `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.WorkflowOrchestratorService = WorkflowOrchestratorService;
exports.WorkflowOrchestratorService = WorkflowOrchestratorService = WorkflowOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService])
], WorkflowOrchestratorService);
//# sourceMappingURL=workflow-orchestrator.service.js.map