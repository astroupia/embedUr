"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionResponseMapper = void 0;
class WorkflowExecutionResponseMapper {
    static toDto(entity) {
        return {
            id: entity.id,
            status: entity.status,
            triggeredBy: entity.triggeredBy,
            startTime: entity.startTime,
            endTime: entity.endTime,
            inputData: entity.inputData,
            outputData: entity.outputData,
            durationMs: entity.durationMs,
            leadId: entity.leadId,
            workflowId: entity.workflowId,
            companyId: entity.companyId,
            errorMessage: entity.errorMessage,
            isCompleted: entity.isCompleted,
            isRunning: entity.isRunning,
            isSuccessful: entity.isSuccessful,
            isFailed: entity.isFailed,
            durationSeconds: entity.durationSeconds,
            hasError: entity.hasError,
            executionTime: entity.executionTime,
            canBeRetried: entity.canBeRetried(),
        };
    }
    static toDtoArray(entities) {
        return entities.map(entity => this.toDto(entity));
    }
}
exports.WorkflowExecutionResponseMapper = WorkflowExecutionResponseMapper;
//# sourceMappingURL=workflow-execution-response.mapper.js.map