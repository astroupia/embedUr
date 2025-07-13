import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { WorkflowEventsService } from './workflow-events.service';
import { WorkflowEntity } from '../entities/workflow.entity';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto, RetryExecutionDto } from '../dto/workflow.dto';
import { QueryWorkflowsCursorDto } from '../dto/query-workflows-cursor.dto';
import { QueryExecutionsCursorDto } from '../dto/query-executions-cursor.dto';
import { WorkflowType, WorkflowExecutionStatus } from '../constants/workflow.constants';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly workflowEvents: WorkflowEventsService,
  ) {}

  async create(dto: CreateWorkflowDto, companyId: string): Promise<WorkflowEntity> {
    this.logger.log(`Creating workflow for company ${companyId}: ${dto.name}`);

    // TODO: Add plan validation to check maxWorkflows limit
    // const currentWorkflowCount = await this.workflowRepository.countByCompany(companyId);
    // const plan = await this.getCompanyPlan(companyId);
    // if (currentWorkflowCount >= plan.maxWorkflows) {
    //   throw new BadRequestException('Workflow limit reached for your plan');
    // }

    // Create the workflow
    const workflow = await this.workflowRepository.create(dto, companyId);

    // Log the creation
    await this.workflowEvents.logExecution(workflow, 'WORKFLOW_CREATED', {
      name: workflow.name,
      type: workflow.type,
      n8nWorkflowId: workflow.n8nWorkflowId,
    });

    this.logger.log(`Workflow created successfully: ${workflow.id}`);
    return workflow;
  }

  async findAll(companyId: string, query: QueryWorkflowsCursorDto): Promise<{
    data: WorkflowEntity[];
    nextCursor: string | null;
  }> {
    this.logger.log(`Fetching workflows for company ${companyId} with cursor: ${query.cursor}`);
    
    const result = await this.workflowRepository.findWithCursor(companyId, query);
    
    this.logger.log(`Found ${result.data.length} workflows for company ${companyId}`);
    return result;
  }

  async findOne(id: string, companyId: string): Promise<WorkflowEntity> {
    this.logger.log(`Fetching workflow ${id} for company ${companyId}`);
    
    const workflow = await this.workflowRepository.findOne(id, companyId);
    
    this.logger.log(`Workflow ${id} found successfully`);
    return workflow;
  }

  async update(id: string, companyId: string, dto: UpdateWorkflowDto): Promise<WorkflowEntity> {
    this.logger.log(`Updating workflow ${id} for company ${companyId}`);

    // Get current workflow to check if type is being changed
    const currentWorkflow = await this.workflowRepository.findOne(id, companyId);

    // Update the workflow
    const updatedWorkflow = await this.workflowRepository.update(id, companyId, dto);

    // Log the update
    await this.workflowEvents.logExecution(updatedWorkflow, 'WORKFLOW_UPDATED', {
      previousData: {
        name: currentWorkflow.name,
        n8nWorkflowId: currentWorkflow.n8nWorkflowId,
      },
      newData: {
        name: updatedWorkflow.name,
        n8nWorkflowId: updatedWorkflow.n8nWorkflowId,
      },
    });

    this.logger.log(`Workflow ${id} updated successfully`);
    return updatedWorkflow;
  }

  async remove(id: string, companyId: string): Promise<void> {
    this.logger.log(`Removing workflow ${id} for company ${companyId}`);

    // Get workflow before deletion for logging
    const workflow = await this.workflowRepository.findOne(id, companyId);

    // Log the deletion before removing the workflow
    await this.workflowEvents.logExecution(workflow, 'WORKFLOW_DELETED', {
      name: workflow.name,
      type: workflow.type,
    });

    // Remove the workflow
    await this.workflowRepository.remove(id, companyId);

    this.logger.log(`Workflow ${id} removed successfully`);
  }

  async findByType(type: WorkflowType, companyId: string): Promise<WorkflowEntity[]> {
    this.logger.log(`Fetching workflows with type ${type} for company ${companyId}`);
    
    const workflows = await this.workflowRepository.findByType(type, companyId);
    
    this.logger.log(`Found ${workflows.length} workflows with type ${type}`);
    return workflows;
  }

  async getStats(companyId: string): Promise<{
    total: number;
    byType: Record<WorkflowType, number>;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
  }> {
    this.logger.log(`Fetching workflow stats for company ${companyId}`);

    const total = await this.workflowRepository.countByCompany(companyId);
    const byType: Record<WorkflowType, number> = {
      [WorkflowType.TARGET_AUDIENCE_TRANSLATOR]: await this.workflowRepository.countByType(WorkflowType.TARGET_AUDIENCE_TRANSLATOR, companyId),
      [WorkflowType.LEAD_ENRICHMENT]: await this.workflowRepository.countByType(WorkflowType.LEAD_ENRICHMENT, companyId),
      [WorkflowType.EMAIL_SEQUENCE]: await this.workflowRepository.countByType(WorkflowType.EMAIL_SEQUENCE, companyId),
      [WorkflowType.LEAD_ROUTING]: await this.workflowRepository.countByType(WorkflowType.LEAD_ROUTING, companyId),
    };

    const totalExecutions = await this.workflowRepository.countExecutionsByStatus(WorkflowExecutionStatus.SUCCESS, companyId) +
                           await this.workflowRepository.countExecutionsByStatus(WorkflowExecutionStatus.FAILED, companyId);
    const successfulExecutions = await this.workflowRepository.countExecutionsByStatus(WorkflowExecutionStatus.SUCCESS, companyId);
    const failedExecutions = await this.workflowRepository.countExecutionsByStatus(WorkflowExecutionStatus.FAILED, companyId);

    this.logger.log(`Workflow stats for company ${companyId}: total=${total}, executions=${totalExecutions}`);
    return { total, byType, totalExecutions, successfulExecutions, failedExecutions };
  }

  async executeWorkflow(
    id: string,
    companyId: string,
    dto: ExecuteWorkflowDto,
    triggeredBy: string,
  ): Promise<WorkflowExecutionEntity> {
    this.logger.log(`Executing workflow ${id} for company ${companyId}`);

    // Get the workflow
    const workflow = await this.workflowRepository.findOne(id, companyId);

    // Validate input data for workflow type
    if (!workflow.canExecuteWithInput(dto.inputData)) {
      throw new BadRequestException(`Invalid input data for workflow type ${workflow.type}`);
    }

    // Create execution record
    const execution = await this.workflowRepository.createExecution(
      workflow.id,
      companyId,
      triggeredBy,
      dto.inputData,
      dto.leadId,
    );

    // Trigger the workflow execution
    await this.workflowEvents.triggerWorkflowExecution(workflow, execution);

    this.logger.log(`Workflow execution ${execution.id} started successfully`);
    return execution;
  }

  async findExecutions(
    companyId: string,
    query: QueryExecutionsCursorDto,
  ): Promise<{ data: WorkflowExecutionEntity[]; nextCursor: string | null }> {
    this.logger.log(`Fetching workflow executions for company ${companyId}`);
    
    const result = await this.workflowRepository.findExecutionsWithCursor(companyId, query);
    
    this.logger.log(`Found ${result.data.length} executions for company ${companyId}`);
    return result;
  }

  async findExecution(id: string, companyId: string): Promise<WorkflowExecutionEntity> {
    this.logger.log(`Fetching workflow execution ${id} for company ${companyId}`);
    
    const execution = await this.workflowRepository.findExecution(id, companyId);
    
    this.logger.log(`Workflow execution ${id} found successfully`);
    return execution;
  }

  async retryExecution(
    executionId: string,
    companyId: string,
    dto: RetryExecutionDto,
    triggeredBy: string,
  ): Promise<WorkflowExecutionEntity> {
    this.logger.log(`Retrying workflow execution ${executionId} for company ${companyId}`);

    // Get the original execution
    const originalExecution = await this.workflowRepository.findExecution(executionId, companyId);

    if (!originalExecution.canBeRetried()) {
      throw new BadRequestException('Execution cannot be retried');
    }

    // Get the workflow
    const workflow = await this.workflowRepository.findOne(originalExecution.workflowId, companyId);

    // Create new execution with updated input data
    const inputData = dto.inputData || originalExecution.inputData || {};
    const execution = await this.workflowRepository.createExecution(
      workflow.id,
      companyId,
      triggeredBy,
      inputData,
      originalExecution.leadId || undefined,
    );

    // Trigger the workflow execution
    await this.workflowEvents.triggerWorkflowExecution(workflow, execution);

    this.logger.log(`Workflow execution ${execution.id} retry started successfully`);
    return execution;
  }

  async findExecutionsByWorkflow(workflowId: string, companyId: string): Promise<WorkflowExecutionEntity[]> {
    this.logger.log(`Fetching executions for workflow ${workflowId} for company ${companyId}`);
    
    const executions = await this.workflowRepository.findExecutionsByWorkflow(workflowId, companyId);
    
    this.logger.log(`Found ${executions.length} executions for workflow ${workflowId}`);
    return executions;
  }
} 