"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminTargetType = exports.AdminActionType = exports.AdminActionLogEntity = void 0;
class AdminActionLogEntity {
    id;
    action;
    targetType;
    targetId;
    details;
    performedBy;
    timestamp;
    constructor(id, action, targetType, targetId, details, performedBy, timestamp) {
        this.id = id;
        this.action = action;
        this.targetType = targetType;
        this.targetId = targetId;
        this.details = details;
        this.performedBy = performedBy;
        this.timestamp = timestamp;
    }
    get isCriticalAction() {
        const criticalActions = [
            'COMPANY_SUSPEND',
            'COMPANY_DELETE',
            'USER_BAN',
            'PLAN_CHANGE',
            'SYSTEM_NOTIFICATION',
        ];
        return criticalActions.includes(this.action);
    }
    get actionCategory() {
        if (this.action.startsWith('COMPANY_'))
            return 'company';
        if (this.action.startsWith('USER_'))
            return 'user';
        if (this.action.startsWith('PLAN_'))
            return 'plan';
        if (this.action.startsWith('SYSTEM_'))
            return 'system';
        return 'other';
    }
    static create(action, targetType, targetId, performedBy, details) {
        return new AdminActionLogEntity('', action, targetType, targetId, details || null, performedBy, new Date());
    }
    withDetails(details) {
        return new AdminActionLogEntity(this.id, this.action, this.targetType, this.targetId, details, this.performedBy, this.timestamp);
    }
}
exports.AdminActionLogEntity = AdminActionLogEntity;
var AdminActionType;
(function (AdminActionType) {
    AdminActionType["COMPANY_VIEW"] = "COMPANY_VIEW";
    AdminActionType["COMPANY_STATUS_UPDATE"] = "COMPANY_STATUS_UPDATE";
    AdminActionType["COMPANY_PLAN_CHANGE"] = "COMPANY_PLAN_CHANGE";
    AdminActionType["COMPANY_SUSPEND"] = "COMPANY_SUSPEND";
    AdminActionType["COMPANY_ACTIVATE"] = "COMPANY_ACTIVATE";
    AdminActionType["COMPANY_DELETE"] = "COMPANY_DELETE";
    AdminActionType["USER_VIEW"] = "USER_VIEW";
    AdminActionType["USER_STATUS_UPDATE"] = "USER_STATUS_UPDATE";
    AdminActionType["USER_PASSWORD_RESET"] = "USER_PASSWORD_RESET";
    AdminActionType["USER_BAN"] = "USER_BAN";
    AdminActionType["USER_UNBAN"] = "USER_UNBAN";
    AdminActionType["PLAN_ASSIGN"] = "PLAN_ASSIGN";
    AdminActionType["PLAN_UPDATE"] = "PLAN_UPDATE";
    AdminActionType["PLAN_DELETE"] = "PLAN_DELETE";
    AdminActionType["SYSTEM_NOTIFICATION"] = "SYSTEM_NOTIFICATION";
    AdminActionType["SYSTEM_CONFIG_UPDATE"] = "SYSTEM_CONFIG_UPDATE";
    AdminActionType["SYSTEM_BACKUP"] = "SYSTEM_BACKUP";
    AdminActionType["USAGE_OVERRIDE"] = "USAGE_OVERRIDE";
    AdminActionType["USAGE_RESET"] = "USAGE_RESET";
    AdminActionType["QUOTA_ENFORCEMENT"] = "QUOTA_ENFORCEMENT";
})(AdminActionType || (exports.AdminActionType = AdminActionType = {}));
var AdminTargetType;
(function (AdminTargetType) {
    AdminTargetType["COMPANY"] = "COMPANY";
    AdminTargetType["USER"] = "USER";
    AdminTargetType["PLAN"] = "PLAN";
    AdminTargetType["SYSTEM"] = "SYSTEM";
    AdminTargetType["USAGE"] = "USAGE";
})(AdminTargetType || (exports.AdminTargetType = AdminTargetType = {}));
//# sourceMappingURL=admin-action-log.entity.js.map