"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXECUTION_STATUS_DESCRIPTIONS = exports.WORKFLOW_TYPE_DESCRIPTIONS = exports.WORKFLOW_BUSINESS_RULES = exports.WORKFLOW_MAX_PAGE_SIZE = exports.WORKFLOW_DEFAULT_PAGE_SIZE = exports.WorkflowSortOrder = exports.WorkflowSortField = exports.WorkflowExecutionStatus = exports.WorkflowType = void 0;
var WorkflowType;
(function (WorkflowType) {
    WorkflowType["LEAD_ENRICHMENT"] = "LEAD_ENRICHMENT";
    WorkflowType["EMAIL_SEQUENCE"] = "EMAIL_SEQUENCE";
    WorkflowType["LEAD_ROUTING"] = "LEAD_ROUTING";
    WorkflowType["TARGET_AUDIENCE_TRANSLATOR"] = "TARGET_AUDIENCE_TRANSLATOR";
})(WorkflowType || (exports.WorkflowType = WorkflowType = {}));
var WorkflowExecutionStatus;
(function (WorkflowExecutionStatus) {
    WorkflowExecutionStatus["STARTED"] = "STARTED";
    WorkflowExecutionStatus["RUNNING"] = "RUNNING";
    WorkflowExecutionStatus["SUCCESS"] = "SUCCESS";
    WorkflowExecutionStatus["FAILED"] = "FAILED";
    WorkflowExecutionStatus["TIMEOUT"] = "TIMEOUT";
    WorkflowExecutionStatus["CANCELLED"] = "CANCELLED";
})(WorkflowExecutionStatus || (exports.WorkflowExecutionStatus = WorkflowExecutionStatus = {}));
var WorkflowSortField;
(function (WorkflowSortField) {
    WorkflowSortField["CREATED_AT"] = "createdAt";
    WorkflowSortField["UPDATED_AT"] = "updatedAt";
    WorkflowSortField["NAME"] = "name";
    WorkflowSortField["TYPE"] = "type";
})(WorkflowSortField || (exports.WorkflowSortField = WorkflowSortField = {}));
var WorkflowSortOrder;
(function (WorkflowSortOrder) {
    WorkflowSortOrder["ASC"] = "asc";
    WorkflowSortOrder["DESC"] = "desc";
})(WorkflowSortOrder || (exports.WorkflowSortOrder = WorkflowSortOrder = {}));
exports.WORKFLOW_DEFAULT_PAGE_SIZE = 20;
exports.WORKFLOW_MAX_PAGE_SIZE = 100;
exports.WORKFLOW_BUSINESS_RULES = {
    MIN_NAME_LENGTH: 1,
    MAX_NAME_LENGTH: 100,
    MAX_EXECUTION_DURATION_MS: 300000,
    MAX_RETRY_ATTEMPTS: 3,
};
exports.WORKFLOW_TYPE_DESCRIPTIONS = {
    [WorkflowType.LEAD_ENRICHMENT]: 'Automated enrichment processes on lead profiles',
    [WorkflowType.EMAIL_SEQUENCE]: 'Multi-step automated email campaigns',
    [WorkflowType.LEAD_ROUTING]: 'Assign or route leads based on conditions/workflows',
    [WorkflowType.TARGET_AUDIENCE_TRANSLATOR]: 'Translate and adapt content for different target audiences',
};
exports.EXECUTION_STATUS_DESCRIPTIONS = {
    [WorkflowExecutionStatus.STARTED]: 'Execution has been initiated',
    [WorkflowExecutionStatus.RUNNING]: 'Execution is currently processing',
    [WorkflowExecutionStatus.SUCCESS]: 'Execution completed successfully',
    [WorkflowExecutionStatus.FAILED]: 'Execution failed with an error',
    [WorkflowExecutionStatus.TIMEOUT]: 'Execution timed out',
    [WorkflowExecutionStatus.CANCELLED]: 'Execution was cancelled',
};
//# sourceMappingURL=workflow.constants.js.map