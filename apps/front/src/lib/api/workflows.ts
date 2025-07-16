import { apiClient } from './client';
import type {
  Workflow,
  WorkflowExecution,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  ExecuteWorkflowRequest,
  QueryWorkflowsRequest,
  QueryExecutionsRequest,
  PaginatedResponse,
} from './client';

// Workflows API class that uses the base client
export class WorkflowsAPI {
  private client = apiClient;

  /**
   * Create a new workflow
   */
  async create(data: CreateWorkflowRequest): Promise<Workflow> {
    return this.client.createWorkflow(data);
  }

  /**
   * Get all workflows with pagination and filtering
   */
  async getAll(params?: QueryWorkflowsRequest): Promise<PaginatedResponse<Workflow>> {
    return this.client.getWorkflows(params);
  }

  /**
   * Get a specific workflow by ID
   */
  async getById(id: string): Promise<Workflow> {
    return this.client.getWorkflow(id);
  }

  /**
   * Update a workflow
   */
  async update(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    return this.client.updateWorkflow(id, data);
  }

  /**
   * Delete a workflow
   */
  async delete(id: string): Promise<void> {
    return this.client.deleteWorkflow(id);
  }

  /**
   * Execute a workflow
   */
  async execute(id: string, data: ExecuteWorkflowRequest): Promise<WorkflowExecution> {
    return this.client.executeWorkflow(id, data);
  }

  /**
   * Get workflow executions with pagination and filtering
   */
  async getExecutions(params?: QueryExecutionsRequest): Promise<PaginatedResponse<WorkflowExecution>> {
    return this.client.getWorkflowExecutions(params);
  }

  /**
   * Get a specific workflow execution by ID
   */
  async getExecutionById(id: string): Promise<WorkflowExecution> {
    return this.client.getWorkflowExecution(id);
  }

  /**
   * Retry a failed workflow execution
   */
  async retryExecution(id: string): Promise<WorkflowExecution> {
    return this.client.retryWorkflowExecution(id);
  }
}

// Export types for convenience
export type {
  Workflow,
  WorkflowExecution,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  ExecuteWorkflowRequest,
  QueryWorkflowsRequest,
  QueryExecutionsRequest,
  PaginatedResponse,
}; 