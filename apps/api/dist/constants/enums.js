"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.SystemNotificationLevel = exports.CompanyStatus = void 0;
var CompanyStatus;
(function (CompanyStatus) {
    CompanyStatus["ACTIVE"] = "ACTIVE";
    CompanyStatus["INACTIVE"] = "INACTIVE";
    CompanyStatus["SUSPENDED"] = "SUSPENDED";
    CompanyStatus["PENDING_DELETION"] = "PENDING_DELETION";
})(CompanyStatus || (exports.CompanyStatus = CompanyStatus = {}));
var SystemNotificationLevel;
(function (SystemNotificationLevel) {
    SystemNotificationLevel["INFO"] = "INFO";
    SystemNotificationLevel["WARNING"] = "WARNING";
    SystemNotificationLevel["ERROR"] = "ERROR";
    SystemNotificationLevel["SUCCESS"] = "SUCCESS";
})(SystemNotificationLevel || (exports.SystemNotificationLevel = SystemNotificationLevel = {}));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["MEMBER"] = "MEMBER";
    UserRole["READ_ONLY"] = "READ_ONLY";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=enums.js.map