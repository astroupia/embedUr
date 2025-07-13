import { WorkflowExecutionRepository } from '../repositories/workflow-execution.repository';
export interface ErrorContext {
    executionId: string;
    workflowId: string;
    workflowType: string;
    companyId: string;
    error: Error;
    timestamp: Date;
    retryCount: number;
    inputData?: Record<string, any>;
}
export interface RecoveryStrategy {
    id: string;
    name: string;
    description: string;
    conditions: RecoveryCondition[];
    actions: RecoveryAction[];
    priority: number;
}
export interface RecoveryCondition {
    type: 'error_message' | 'error_type' | 'retry_count' | 'workflow_type' | 'time_of_day';
    value: string | number | RegExp;
    operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
}
export interface RecoveryAction {
    type: 'retry' | 'fallback_provider' | 'skip_step' | 'manual_intervention' | 'notify_admin';
    config: Record<string, any>;
}
export declare class WorkflowErrorHandlerService {
    private readonly workflowExecutionRepository;
    private readonly logger;
    private readonly recoveryStrategies;
    constructor(workflowExecutionRepository: WorkflowExecutionRepository);
    handleError(context: ErrorContext): Promise<void>;
    addRecoveryStrategy(strategy: RecoveryStrategy): void;
    getErrorHistory(executionId: string): Promise<ErrorContext[]>;
    getRecoveryStrategies(): RecoveryStrategy[];
    getErrorAnalytics(workflowId: string): Promise<{
        totalErrors: number;
        resolvedErrors: number;
        unresolvedErrors: number;
        averageResolutionTime: number;
        mostCommonError: string;
        recoverySuccessRate: number;
    }>;
    private findApplicableStrategies;
    private evaluateCondition;
    private executeRecoveryStrategy;
    private executeRecoveryAction;
    private handleRetryAction;
    private handleFallbackProviderAction;
    private handleSkipStepAction;
    private handleManualInterventionAction;
    private handleNotifyAdminAction;
    private logError;
    private isRecoverySuccessful;
    private initializeDefaultStrategies;
}
