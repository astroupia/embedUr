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
var WorkflowErrorHandlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowErrorHandlerService = void 0;
const common_1 = require("@nestjs/common");
const workflow_constants_1 = require("../constants/workflow.constants");
const workflow_execution_repository_1 = require("../repositories/workflow-execution.repository");
let WorkflowErrorHandlerService = WorkflowErrorHandlerService_1 = class WorkflowErrorHandlerService {
    workflowExecutionRepository;
    logger = new common_1.Logger(WorkflowErrorHandlerService_1.name);
    recoveryStrategies = [];
    constructor(workflowExecutionRepository) {
        this.workflowExecutionRepository = workflowExecutionRepository;
        this.initializeDefaultStrategies();
    }
    async handleError(context) {
        this.logger.error(`Handling error for execution ${context.executionId}:`, context.error);
        await this.logError(context);
        const strategies = this.findApplicableStrategies(context);
        if (strategies.length === 0) {
            this.logger.warn(`No recovery strategies found for execution ${context.executionId}`);
            return;
        }
        for (const strategy of strategies.sort((a, b) => b.priority - a.priority)) {
            try {
                await this.executeRecoveryStrategy(strategy, context);
                if (await this.isRecoverySuccessful(context)) {
                    this.logger.log(`Recovery strategy ${strategy.name} succeeded for execution ${context.executionId}`);
                    break;
                }
            }
            catch (error) {
                this.logger.error(`Recovery strategy ${strategy.name} failed for execution ${context.executionId}:`, error);
            }
        }
    }
    addRecoveryStrategy(strategy) {
        this.recoveryStrategies.push(strategy);
        this.logger.log(`Added recovery strategy: ${strategy.name}`);
    }
    async getErrorHistory(executionId) {
        const execution = await this.workflowExecutionRepository.findOne(executionId, '');
        if (execution.status !== workflow_constants_1.WorkflowExecutionStatus.FAILED) {
            return [];
        }
        const errorContext = {
            executionId: execution.id,
            workflowId: execution.workflowId,
            workflowType: 'UNKNOWN',
            companyId: execution.companyId,
            error: new Error(execution.outputData?.error || 'Unknown error'),
            timestamp: execution.endTime || execution.startTime,
            retryCount: 0,
            inputData: execution.inputData || undefined,
        };
        return [errorContext];
    }
    getRecoveryStrategies() {
        return [...this.recoveryStrategies];
    }
    async getErrorAnalytics(workflowId) {
        const failedExecutions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(workflowId, { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() });
        const failedStatusExecutions = failedExecutions.filter(e => e.status === workflow_constants_1.WorkflowExecutionStatus.FAILED);
        const totalErrors = failedStatusExecutions.length;
        const resolvedErrors = 0;
        const unresolvedErrors = totalErrors - resolvedErrors;
        const averageResolutionTime = totalErrors > 0
            ? failedStatusExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0) / totalErrors
            : 0;
        const errorMessages = failedStatusExecutions
            .map(e => e.outputData?.error || 'Unknown error')
            .filter(msg => msg !== 'Unknown error');
        const errorCounts = errorMessages.reduce((acc, msg) => {
            acc[msg] = (acc[msg] || 0) + 1;
            return acc;
        }, {});
        const mostCommonError = Object.keys(errorCounts).length > 0
            ? Object.entries(errorCounts).sort(([, a], [, b]) => b - a)[0][0]
            : 'Unknown error';
        const recoverySuccessRate = totalErrors > 0 ? resolvedErrors / totalErrors : 0;
        return {
            totalErrors,
            resolvedErrors,
            unresolvedErrors,
            averageResolutionTime,
            mostCommonError,
            recoverySuccessRate,
        };
    }
    findApplicableStrategies(context) {
        return this.recoveryStrategies.filter(strategy => strategy.conditions.every(condition => this.evaluateCondition(condition, context)));
    }
    evaluateCondition(condition, context) {
        let actualValue;
        switch (condition.type) {
            case 'error_message':
                actualValue = context.error.message;
                break;
            case 'error_type':
                actualValue = context.error.constructor.name;
                break;
            case 'retry_count':
                actualValue = context.retryCount;
                break;
            case 'workflow_type':
                actualValue = context.workflowType;
                break;
            case 'time_of_day':
                actualValue = context.timestamp.getHours();
                break;
            default:
                return false;
        }
        switch (condition.operator) {
            case 'equals':
                return actualValue === condition.value;
            case 'contains':
                return String(actualValue).includes(String(condition.value));
            case 'matches':
                return new RegExp(condition.value).test(String(actualValue));
            case 'greater_than':
                return Number(actualValue) > Number(condition.value);
            case 'less_than':
                return Number(actualValue) < Number(condition.value);
            default:
                return false;
        }
    }
    async executeRecoveryStrategy(strategy, context) {
        this.logger.log(`Executing recovery strategy ${strategy.name} for execution ${context.executionId}`);
        for (const action of strategy.actions) {
            await this.executeRecoveryAction(action, context);
        }
    }
    async executeRecoveryAction(action, context) {
        switch (action.type) {
            case 'retry':
                await this.handleRetryAction(action, context);
                break;
            case 'fallback_provider':
                await this.handleFallbackProviderAction(action, context);
                break;
            case 'skip_step':
                await this.handleSkipStepAction(action, context);
                break;
            case 'manual_intervention':
                await this.handleManualInterventionAction(action, context);
                break;
            case 'notify_admin':
                await this.handleNotifyAdminAction(action, context);
                break;
            default:
                this.logger.warn(`Unknown recovery action type: ${action.type}`);
        }
    }
    async handleRetryAction(action, context) {
        const maxRetries = action.config.maxRetries || 3;
        const backoffMs = action.config.backoffMs || 1000;
        if (context.retryCount < maxRetries) {
            this.logger.log(`Scheduling retry ${context.retryCount + 1}/${maxRetries} for execution ${context.executionId}`);
            setTimeout(async () => {
                try {
                    this.logger.log(`Retrying execution ${context.executionId}`);
                }
                catch (error) {
                    this.logger.error(`Retry failed for execution ${context.executionId}:`, error);
                }
            }, backoffMs * Math.pow(2, context.retryCount));
        }
    }
    async handleFallbackProviderAction(action, context) {
        const fallbackProvider = action.config.provider;
        this.logger.log(`Switching to fallback provider ${fallbackProvider} for execution ${context.executionId}`);
    }
    async handleSkipStepAction(action, context) {
        const stepToSkip = action.config.step;
        this.logger.log(`Skipping step ${stepToSkip} for execution ${context.executionId}`);
    }
    async handleManualInterventionAction(action, context) {
        this.logger.log(`Requesting manual intervention for execution ${context.executionId}`);
    }
    async handleNotifyAdminAction(action, context) {
        const notificationLevel = action.config.level || 'WARNING';
        this.logger.log(`Notifying admin (${notificationLevel}) for execution ${context.executionId}`);
    }
    async logError(context) {
        this.logger.error(`Error logged for execution ${context.executionId}`, {
            error: context.error.message,
            stack: context.error.stack,
            workflowType: context.workflowType,
            retryCount: context.retryCount,
            timestamp: context.timestamp,
        });
    }
    async isRecoverySuccessful(context) {
        try {
            const execution = await this.workflowExecutionRepository.findOne(context.executionId, context.companyId);
            return execution.status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS;
        }
        catch (error) {
            this.logger.error(`Failed to check recovery status for execution ${context.executionId}:`, error);
            return false;
        }
    }
    initializeDefaultStrategies() {
        this.addRecoveryStrategy({
            id: 'retry_temporary_failures',
            name: 'Retry Temporary Failures',
            description: 'Retry workflow execution on temporary network or service failures',
            priority: 1,
            conditions: [
                {
                    type: 'error_message',
                    value: /timeout|network|temporary|rate limit/i,
                    operator: 'matches',
                },
                {
                    type: 'retry_count',
                    value: 2,
                    operator: 'less_than',
                },
            ],
            actions: [
                {
                    type: 'retry',
                    config: {
                        maxRetries: 3,
                        backoffMs: 2000,
                    },
                },
            ],
        });
        this.addRecoveryStrategy({
            id: 'fallback_enrichment_provider',
            name: 'Fallback Enrichment Provider',
            description: 'Switch to alternative enrichment provider on failure',
            priority: 2,
            conditions: [
                {
                    type: 'workflow_type',
                    value: 'LEAD_ENRICHMENT',
                    operator: 'equals',
                },
                {
                    type: 'error_message',
                    value: /provider|service unavailable/i,
                    operator: 'matches',
                },
            ],
            actions: [
                {
                    type: 'fallback_provider',
                    config: {
                        provider: 'APOLLO',
                    },
                },
            ],
        });
        this.addRecoveryStrategy({
            id: 'manual_intervention_critical',
            name: 'Manual Intervention for Critical Failures',
            description: 'Request manual intervention for critical workflow failures',
            priority: 3,
            conditions: [
                {
                    type: 'retry_count',
                    value: 3,
                    operator: 'greater_than',
                },
            ],
            actions: [
                {
                    type: 'manual_intervention',
                    config: {
                        priority: 'HIGH',
                        category: 'WORKFLOW_FAILURE',
                    },
                },
                {
                    type: 'notify_admin',
                    config: {
                        level: 'CRITICAL',
                        channel: 'email',
                    },
                },
            ],
        });
    }
};
exports.WorkflowErrorHandlerService = WorkflowErrorHandlerService;
exports.WorkflowErrorHandlerService = WorkflowErrorHandlerService = WorkflowErrorHandlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_execution_repository_1.WorkflowExecutionRepository])
], WorkflowErrorHandlerService);
//# sourceMappingURL=workflow-error-handler.service.js.map