export declare class AdminActionLogEntity {
    readonly id: string;
    readonly action: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly details: Record<string, any> | null;
    readonly performedBy: string;
    readonly timestamp: Date;
    constructor(id: string, action: string, targetType: string, targetId: string, details: Record<string, any> | null, performedBy: string, timestamp: Date);
    get isCriticalAction(): boolean;
    get actionCategory(): 'company' | 'user' | 'plan' | 'system' | 'other';
    static create(action: string, targetType: string, targetId: string, performedBy: string, details?: Record<string, any>): AdminActionLogEntity;
    withDetails(details: Record<string, any>): AdminActionLogEntity;
}
export declare enum AdminActionType {
    COMPANY_VIEW = "COMPANY_VIEW",
    COMPANY_STATUS_UPDATE = "COMPANY_STATUS_UPDATE",
    COMPANY_PLAN_CHANGE = "COMPANY_PLAN_CHANGE",
    COMPANY_SUSPEND = "COMPANY_SUSPEND",
    COMPANY_ACTIVATE = "COMPANY_ACTIVATE",
    COMPANY_DELETE = "COMPANY_DELETE",
    USER_VIEW = "USER_VIEW",
    USER_STATUS_UPDATE = "USER_STATUS_UPDATE",
    USER_PASSWORD_RESET = "USER_PASSWORD_RESET",
    USER_BAN = "USER_BAN",
    USER_UNBAN = "USER_UNBAN",
    PLAN_ASSIGN = "PLAN_ASSIGN",
    PLAN_UPDATE = "PLAN_UPDATE",
    PLAN_DELETE = "PLAN_DELETE",
    SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
    SYSTEM_CONFIG_UPDATE = "SYSTEM_CONFIG_UPDATE",
    SYSTEM_BACKUP = "SYSTEM_BACKUP",
    USAGE_OVERRIDE = "USAGE_OVERRIDE",
    USAGE_RESET = "USAGE_RESET",
    QUOTA_ENFORCEMENT = "QUOTA_ENFORCEMENT"
}
export declare enum AdminTargetType {
    COMPANY = "COMPANY",
    USER = "USER",
    PLAN = "PLAN",
    SYSTEM = "SYSTEM",
    USAGE = "USAGE"
}
