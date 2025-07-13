export enum WorkflowType {
  LEAD_ENRICHMENT = 'LEAD_ENRICHMENT',
  EMAIL_SEQUENCE = 'EMAIL_SEQUENCE',
  LEAD_ROUTING = 'LEAD_ROUTING',
  TARGET_AUDIENCE_TRANSLATOR = 'TARGET_AUDIENCE_TRANSLATOR',
}

export enum WorkflowExecutionStatus {
  STARTED = 'STARTED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
}

export enum WorkflowSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  TYPE = 'type',
}

export enum WorkflowSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export const WORKFLOW_DEFAULT_PAGE_SIZE = 20;
export const WORKFLOW_MAX_PAGE_SIZE = 100;

// Business rules
export const WORKFLOW_BUSINESS_RULES = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MAX_EXECUTION_DURATION_MS: 300000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// Workflow type descriptions
export const WORKFLOW_TYPE_DESCRIPTIONS = {
  [WorkflowType.LEAD_ENRICHMENT]: 'Automated enrichment processes on lead profiles',
  [WorkflowType.EMAIL_SEQUENCE]: 'Multi-step automated email campaigns',
  [WorkflowType.LEAD_ROUTING]: 'Assign or route leads based on conditions/workflows',
  [WorkflowType.TARGET_AUDIENCE_TRANSLATOR]: 'Translate and adapt content for different target audiences',
} as const;

// Execution status descriptions
export const EXECUTION_STATUS_DESCRIPTIONS = {
  [WorkflowExecutionStatus.STARTED]: 'Execution has been initiated',
  [WorkflowExecutionStatus.RUNNING]: 'Execution is currently processing',
  [WorkflowExecutionStatus.SUCCESS]: 'Execution completed successfully',
  [WorkflowExecutionStatus.FAILED]: 'Execution failed with an error',
  [WorkflowExecutionStatus.TIMEOUT]: 'Execution timed out',
  [WorkflowExecutionStatus.CANCELLED]: 'Execution was cancelled',
} as const; 