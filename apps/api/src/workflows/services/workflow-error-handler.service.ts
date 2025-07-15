import { Injectable, Logger } from '@nestjs/common';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionStatus } from '../constants/workflow.constants';
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

@Injectable()
export class WorkflowErrorHandlerService {
  private readonly logger = new Logger(WorkflowErrorHandlerService.name);
  private readonly recoveryStrategies: RecoveryStrategy[] = [];

  constructor(
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
  ) {
    this.initializeDefaultStrategies();
  }

  /**
   * Handle workflow execution error
   */
  async handleError(context: ErrorContext): Promise<void> {
    this.logger.error(`Handling error for execution ${context.executionId}:`, context.error);

    // Log the error
    await this.logError(context);

    // Find applicable recovery strategies
    const strategies = this.findApplicableStrategies(context);

    if (strategies.length === 0) {
      this.logger.warn(`No recovery strategies found for execution ${context.executionId}`);
      return;
    }

    // Execute recovery strategies in priority order
    for (const strategy of strategies.sort((a, b) => b.priority - a.priority)) {
      try {
        await this.executeRecoveryStrategy(strategy, context);
        
        // If strategy was successful, break
        if (await this.isRecoverySuccessful(context)) {
          this.logger.log(`Recovery strategy ${strategy.name} succeeded for execution ${context.executionId}`);
          break;
        }
      } catch (error) {
        this.logger.error(`Recovery strategy ${strategy.name} failed for execution ${context.executionId}:`, error);
      }
    }
  }

  /**
   * Add custom recovery strategy
   */
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
    this.logger.log(`Added recovery strategy: ${strategy.name}`);
  }

  /**
   * Get error history for a workflow execution
   */
  async getErrorHistory(executionId: string): Promise<ErrorContext[]> {
    // Get execution details
    const execution = await this.workflowExecutionRepository.findOne(executionId, '');
    
    if (execution.status !== WorkflowExecutionStatus.FAILED) {
      return [];
    }

    // Create error context from failed execution
    const errorContext: ErrorContext = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      workflowType: 'UNKNOWN', // Would need to get from workflow entity
      companyId: execution.companyId,
      error: new Error(execution.outputData?.error || 'Unknown error'),
      timestamp: execution.endTime || execution.startTime,
      retryCount: 0, // Would need to track retry count
      inputData: execution.inputData || undefined,
    };

    return [errorContext];
  }

  /**
   * Get all recovery strategies
   */
  getRecoveryStrategies(): RecoveryStrategy[] {
    return [...this.recoveryStrategies];
  }

  /**
   * Get error analytics for a workflow
   */
  async getErrorAnalytics(workflowId: string): Promise<{
    totalErrors: number;
    resolvedErrors: number;
    unresolvedErrors: number;
    averageResolutionTime: number;
    mostCommonError: string;
    recoverySuccessRate: number;
  }> {
    // Get failed executions for this workflow
    const failedExecutions = await this.workflowExecutionRepository.findByWorkflowIdAndTimeRange(
      workflowId,
      { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }, // Last 30 days
    );

    const failedStatusExecutions = failedExecutions.filter(e => e.status === WorkflowExecutionStatus.FAILED);
    const totalErrors = failedStatusExecutions.length;
    
    // Count resolved errors (executions that were retried and succeeded)
    const resolvedErrors = 0; // Would need to track retry success
    const unresolvedErrors = totalErrors - resolvedErrors;
    
    // Calculate average resolution time
    const averageResolutionTime = totalErrors > 0 
      ? failedStatusExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0) / totalErrors
      : 0;
    
    // Find most common error
    const errorMessages = failedStatusExecutions
      .map(e => e.outputData?.error || 'Unknown error')
      .filter(msg => msg !== 'Unknown error');
    
    const errorCounts = errorMessages.reduce((acc, msg) => {
      acc[msg] = (acc[msg] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonError = Object.keys(errorCounts).length > 0
      ? Object.entries(errorCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0]
      : 'Unknown error';
    
    // Calculate recovery success rate
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

  /**
   * Find applicable recovery strategies
   */
  private findApplicableStrategies(context: ErrorContext): RecoveryStrategy[] {
    return this.recoveryStrategies.filter(strategy =>
      strategy.conditions.every(condition => this.evaluateCondition(condition, context))
    );
  }

  /**
   * Evaluate a recovery condition
   */
  private evaluateCondition(condition: RecoveryCondition, context: ErrorContext): boolean {
    let actualValue: any;

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
        return new RegExp(condition.value as string).test(String(actualValue));
      case 'greater_than':
        return Number(actualValue) > Number(condition.value);
      case 'less_than':
        return Number(actualValue) < Number(condition.value);
      default:
        return false;
    }
  }

  /**
   * Execute a recovery strategy
   */
  private async executeRecoveryStrategy(strategy: RecoveryStrategy, context: ErrorContext): Promise<void> {
    this.logger.log(`Executing recovery strategy ${strategy.name} for execution ${context.executionId}`);

    for (const action of strategy.actions) {
      await this.executeRecoveryAction(action, context);
    }
  }

  /**
   * Execute a recovery action
   */
  private async executeRecoveryAction(action: RecoveryAction, context: ErrorContext): Promise<void> {
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

  /**
   * Handle retry action
   */
  private async handleRetryAction(action: RecoveryAction, context: ErrorContext): Promise<void> {
    const maxRetries = action.config.maxRetries || 3;
    const backoffMs = action.config.backoffMs || 1000;

    if (context.retryCount < maxRetries) {
      this.logger.log(`Scheduling retry ${context.retryCount + 1}/${maxRetries} for execution ${context.executionId}`);
      
      // Schedule retry with exponential backoff
      setTimeout(async () => {
        try {
          // This would trigger a retry of the workflow execution
          // Implementation depends on your workflow service
          this.logger.log(`Retrying execution ${context.executionId}`);
        } catch (error) {
          this.logger.error(`Retry failed for execution ${context.executionId}:`, error);
        }
      }, backoffMs * Math.pow(2, context.retryCount));
    }
  }

  /**
   * Handle fallback provider action
   */
  private async handleFallbackProviderAction(action: RecoveryAction, context: ErrorContext): Promise<void> {
    const fallbackProvider = action.config.provider;
    
    this.logger.log(`Switching to fallback provider ${fallbackProvider} for execution ${context.executionId}`);
    
    // Update execution to use fallback provider
    // Implementation depends on your workflow service
  }

  /**
   * Handle skip step action
   */
  private async handleSkipStepAction(action: RecoveryAction, context: ErrorContext): Promise<void> {
    const stepToSkip = action.config.step;
    
    this.logger.log(`Skipping step ${stepToSkip} for execution ${context.executionId}`);
    
    // Mark step as skipped and continue with next step
    // Implementation depends on your workflow service
  }

  /**
   * Handle manual intervention action
   */
  private async handleManualInterventionAction(action: RecoveryAction, context: ErrorContext): Promise<void> {
    this.logger.log(`Requesting manual intervention for execution ${context.executionId}`);
    
    // Create manual intervention ticket
    // Implementation depends on your ticketing system
  }

  /**
   * Handle notify admin action
   */
  private async handleNotifyAdminAction(action: RecoveryAction, context: ErrorContext): Promise<void> {
    const notificationLevel = action.config.level || 'WARNING';
    
    this.logger.log(`Notifying admin (${notificationLevel}) for execution ${context.executionId}`);
    
    // Send notification to administrators
    // Implementation depends on your notification system
  }

  /**
   * Log error for analysis
   */
  private async logError(context: ErrorContext): Promise<void> {
    // Log to database for analysis
    // Implementation depends on your logging system
    this.logger.error(`Error logged for execution ${context.executionId}`, {
      error: context.error.message,
      stack: context.error.stack,
      workflowType: context.workflowType,
      retryCount: context.retryCount,
      timestamp: context.timestamp,
    });
  }

  /**
   * Check if recovery was successful
   */
  private async isRecoverySuccessful(context: ErrorContext): Promise<boolean> {
    try {
      const execution = await this.workflowExecutionRepository.findOne(context.executionId, context.companyId);
      return execution.status === WorkflowExecutionStatus.SUCCESS;
    } catch (error) {
      this.logger.error(`Failed to check recovery status for execution ${context.executionId}:`, error);
      return false;
    }
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    // Strategy 1: Retry on temporary failures
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

    // Strategy 2: Fallback provider for enrichment failures
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

    // Strategy 3: Manual intervention for critical failures
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
} 