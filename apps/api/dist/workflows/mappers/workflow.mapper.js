"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowMapper = void 0;
const workflow_entity_1 = require("../entities/workflow.entity");
const workflow_execution_entity_1 = require("../entities/workflow-execution.entity");
const workflow_constants_1 = require("../constants/workflow.constants");
class WorkflowMapper {
    static toEntity(prisma, executionCount, lastExecution) {
        const executionSummary = lastExecution ? {
            id: lastExecution.id,
            status: lastExecution.status,
            startTime: lastExecution.startTime,
            endTime: lastExecution.endTime || undefined,
            durationMs: lastExecution.durationMs || undefined,
            triggeredBy: lastExecution.triggeredBy,
        } : undefined;
        return new workflow_entity_1.WorkflowEntity(prisma.id, prisma.name, prisma.type, prisma.n8nWorkflowId, prisma.companyId, prisma.createdAt, prisma.updatedAt, executionCount, executionSummary);
    }
    static toPrismaCreate(dto, companyId) {
        return {
            name: dto.name,
            type: dto.type,
            n8nWorkflowId: dto.n8nWorkflowId,
            companyId,
        };
    }
    static toPrismaUpdate(dto) {
        return {
            ...(dto.name && { name: dto.name }),
            ...(dto.n8nWorkflowId && { n8nWorkflowId: dto.n8nWorkflowId }),
        };
    }
    static toExecutionEntity(prisma) {
        return new workflow_execution_entity_1.WorkflowExecutionEntity(prisma.id, prisma.status, prisma.triggeredBy, prisma.startTime, prisma.endTime, prisma.inputData || null, prisma.outputData || null, prisma.durationMs, prisma.leadId, prisma.workflowId, prisma.companyId);
    }
    static toPrismaExecutionCreate(workflowId, companyId, triggeredBy, inputData, leadId) {
        return {
            status: workflow_constants_1.WorkflowExecutionStatus.STARTED,
            triggeredBy,
            startTime: new Date(),
            inputData,
            workflowId,
            companyId,
            ...(leadId && { leadId }),
        };
    }
    static toPrismaExecutionUpdate(status, outputData, errorMessage) {
        const update = {
            status,
            ...(outputData && { outputData }),
            ...(errorMessage && { errorMessage }),
        };
        if (status === workflow_constants_1.WorkflowExecutionStatus.SUCCESS ||
            status === workflow_constants_1.WorkflowExecutionStatus.FAILED ||
            status === workflow_constants_1.WorkflowExecutionStatus.TIMEOUT ||
            status === workflow_constants_1.WorkflowExecutionStatus.CANCELLED) {
            update.endTime = new Date();
        }
        return update;
    }
}
exports.WorkflowMapper = WorkflowMapper;
//# sourceMappingURL=workflow.mapper.js.map