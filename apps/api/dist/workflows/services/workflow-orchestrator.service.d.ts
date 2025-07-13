import { WorkflowService } from './workflow.service';
import { WorkflowType, WorkflowExecutionStatus } from '../constants/workflow.constants';
export interface WorkflowChain {
    id: string;
    name: string;
    description: string;
    steps: WorkflowChainStep[];
    companyId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkflowChainStep {
    id: string;
    workflowId: string;
    workflowType: WorkflowType;
    order: number;
    dependsOn?: string[];
    inputMapping: Record<string, string>;
    condition?: string;
    retryConfig?: {
        maxRetries: number;
        backoffMs: number;
    };
}
export interface ChainExecution {
    id: string;
    chainId: string;
    companyId: string;
    triggeredBy: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    currentStep: number;
    stepExecutions: StepExecution[];
    inputData: Record<string, any>;
    outputData?: Record<string, any>;
    errorMessage?: string;
    startTime: Date;
    endTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface StepExecution {
    id: string;
    stepId: string;
    workflowExecutionId: string;
    status: WorkflowExecutionStatus;
    inputData: Record<string, any>;
    outputData?: Record<string, any>;
    errorMessage?: string;
    startTime: Date;
    endTime?: Date;
    retryCount: number;
}
export declare class WorkflowOrchestratorService {
    private readonly workflowService;
    private readonly logger;
    constructor(workflowService: WorkflowService);
    executeChain(chain: WorkflowChain, inputData: Record<string, any>, companyId: string, triggeredBy: string): Promise<ChainExecution>;
    private executeChainSteps;
    private executeWorkflowStep;
    private prepareStepInput;
    private shouldExecuteStep;
    private sortStepsByDependencies;
    private getNestedValue;
    private evaluateCondition;
    private delay;
    private generateId;
}
