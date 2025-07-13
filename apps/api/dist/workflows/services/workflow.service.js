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
var WorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const workflow_repository_1 = require("../repositories/workflow.repository");
const workflow_events_service_1 = require("./workflow-events.service");
const workflow_constants_1 = require("../constants/workflow.constants");
let WorkflowService = WorkflowService_1 = class WorkflowService {
    workflowRepository;
    workflowEvents;
    logger = new common_1.Logger(WorkflowService_1.name);
    constructor(workflowRepository, workflowEvents) {
        this.workflowRepository = workflowRepository;
        this.workflowEvents = workflowEvents;
    }
    async create(dto, companyId) {
        this.logger.log(`Creating workflow for company ${companyId}: ${dto.name}`);
        const workflow = await this.workflowRepository.create(dto, companyId);
        await this.workflowEvents.logExecution(workflow, 'WORKFLOW_CREATED', {
            name: workflow.name,
            type: workflow.type,
            n8nWorkflowId: workflow.n8nWorkflowId,
        });
        this.logger.log(`Workflow created successfully: ${workflow.id}`);
        return workflow;
    }
    async findAll(companyId, query) {
        this.logger.log(`Fetching workflows for company ${companyId} with cursor: ${query.cursor}`);
        const result = await this.workflowRepository.findWithCursor(companyId, query);
        this.logger.log(`Found ${result.data.length} workflows for company ${companyId}`);
        return result;
    }
    async findOne(id, companyId) {
        this.logger.log(`Fetching workflow ${id} for company ${companyId}`);
        const workflow = await this.workflowRepository.findOne(id, companyId);
        this.logger.log(`Workflow ${id} found successfully`);
        return workflow;
    }
    async update(id, companyId, dto) {
        this.logger.log(`Updating workflow ${id} for company ${companyId}`);
        const currentWorkflow = await this.workflowRepository.findOne(id, companyId);
        const updatedWorkflow = await this.workflowRepository.update(id, companyId, dto);
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
    async remove(id, companyId) {
        this.logger.log(`Removing workflow ${id} for company ${companyId}`);
        const workflow = await this.workflowRepository.findOne(id, companyId);
        await this.workflowEvents.logExecution(workflow, 'WORKFLOW_DELETED', {
            name: workflow.name,
            type: workflow.type,
        });
        await this.workflowRepository.remove(id, companyId);
        this.logger.log(`Workflow ${id} removed successfully`);
    }
    async findByType(type, companyId) {
        this.logger.log(`Fetching workflows with type ${type} for company ${companyId}`);
        const workflows = await this.workflowRepository.findByType(type, companyId);
        this.logger.log(`Found ${workflows.length} workflows with type ${type}`);
        return workflows;
    }
    async getStats(companyId) {
        this.logger.log(`Fetching workflow stats for company ${companyId}`);
        const total = await this.workflowRepository.countByCompany(companyId);
        const byType = {
            [workflow_constants_1.WorkflowType.TARGET_AUDIENCE_TRANSLATOR]: await this.workflowRepository.countByType(workflow_constants_1.WorkflowType.TARGET_AUDIENCE_TRANSLATOR, companyId),
            [workflow_constants_1.WorkflowType.LEAD_ENRICHMENT]: await this.workflowRepository.countByType(workflow_constants_1.WorkflowType.LEAD_ENRICHMENT, companyId),
            [workflow_constants_1.WorkflowType.EMAIL_SEQUENCE]: await this.workflowRepository.countByType(workflow_constants_1.WorkflowType.EMAIL_SEQUENCE, companyId),
            [workflow_constants_1.WorkflowType.LEAD_ROUTING]: await this.workflowRepository.countByType(workflow_constants_1.WorkflowType.LEAD_ROUTING, companyId),
        };
        const totalExecutions = await this.workflowRepository.countExecutionsByStatus(workflow_constants_1.WorkflowExecutionStatus.SUCCESS, companyId) +
            await this.workflowRepository.countExecutionsByStatus(workflow_constants_1.WorkflowExecutionStatus.FAILED, companyId);
        const successfulExecutions = await this.workflowRepository.countExecutionsByStatus(workflow_constants_1.WorkflowExecutionStatus.SUCCESS, companyId);
        const failedExecutions = await this.workflowRepository.countExecutionsByStatus(workflow_constants_1.WorkflowExecutionStatus.FAILED, companyId);
        this.logger.log(`Workflow stats for company ${companyId}: total=${total}, executions=${totalExecutions}`);
        return { total, byType, totalExecutions, successfulExecutions, failedExecutions };
    }
    async executeWorkflow(id, companyId, dto, triggeredBy) {
        this.logger.log(`Executing workflow ${id} for company ${companyId}`);
        const workflow = await this.workflowRepository.findOne(id, companyId);
        if (!workflow.canExecuteWithInput(dto.inputData)) {
            throw new common_1.BadRequestException(`Invalid input data for workflow type ${workflow.type}`);
        }
        const execution = await this.workflowRepository.createExecution(workflow.id, companyId, triggeredBy, dto.inputData, dto.leadId);
        await this.workflowEvents.triggerWorkflowExecution(workflow, execution);
        this.logger.log(`Workflow execution ${execution.id} started successfully`);
        return execution;
    }
    async findExecutions(companyId, query) {
        this.logger.log(`Fetching workflow executions for company ${companyId}`);
        const result = await this.workflowRepository.findExecutionsWithCursor(companyId, query);
        this.logger.log(`Found ${result.data.length} executions for company ${companyId}`);
        return result;
    }
    async findExecution(id, companyId) {
        this.logger.log(`Fetching workflow execution ${id} for company ${companyId}`);
        const execution = await this.workflowRepository.findExecution(id, companyId);
        this.logger.log(`Workflow execution ${id} found successfully`);
        return execution;
    }
    async retryExecution(executionId, companyId, dto, triggeredBy) {
        this.logger.log(`Retrying workflow execution ${executionId} for company ${companyId}`);
        const originalExecution = await this.workflowRepository.findExecution(executionId, companyId);
        if (!originalExecution.canBeRetried()) {
            throw new common_1.BadRequestException('Execution cannot be retried');
        }
        const workflow = await this.workflowRepository.findOne(originalExecution.workflowId, companyId);
        const inputData = dto.inputData || originalExecution.inputData || {};
        const execution = await this.workflowRepository.createExecution(workflow.id, companyId, triggeredBy, inputData, originalExecution.leadId || undefined);
        await this.workflowEvents.triggerWorkflowExecution(workflow, execution);
        this.logger.log(`Workflow execution ${execution.id} retry started successfully`);
        return execution;
    }
    async findExecutionsByWorkflow(workflowId, companyId) {
        this.logger.log(`Fetching executions for workflow ${workflowId} for company ${companyId}`);
        const executions = await this.workflowRepository.findExecutionsByWorkflow(workflowId, companyId);
        this.logger.log(`Found ${executions.length} executions for workflow ${workflowId}`);
        return executions;
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = WorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_repository_1.WorkflowRepository,
        workflow_events_service_1.WorkflowEventsService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map