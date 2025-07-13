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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyUsersResponseDto = exports.CompanyListResponseDto = exports.CompanyAdminResponseDto = exports.UpdateCompanyPlanDto = exports.UpdateCompanyStatusDto = void 0;
const class_validator_1 = require("class-validator");
const enums_1 = require("../../constants/enums");
class UpdateCompanyStatusDto {
    status;
    reason;
}
exports.UpdateCompanyStatusDto = UpdateCompanyStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.CompanyStatus),
    __metadata("design:type", String)
], UpdateCompanyStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyStatusDto.prototype, "reason", void 0);
class UpdateCompanyPlanDto {
    planId;
    reason;
}
exports.UpdateCompanyPlanDto = UpdateCompanyPlanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyPlanDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyPlanDto.prototype, "reason", void 0);
class CompanyAdminResponseDto {
    id;
    name;
    schemaName;
    status;
    planId;
    industry;
    location;
    website;
    description;
    logoUrl;
    bannerUrl;
    employees;
    revenue;
    linkedinUsername;
    twitterUsername;
    facebookUsername;
    instagramUsername;
    createdAt;
    updatedAt;
    plan;
    userCount;
    activeUserCount;
    lastActivityAt;
}
exports.CompanyAdminResponseDto = CompanyAdminResponseDto;
class CompanyListResponseDto {
    companies;
    total;
    page;
    limit;
    totalPages;
}
exports.CompanyListResponseDto = CompanyListResponseDto;
class CompanyUsersResponseDto {
    id;
    email;
    firstName;
    lastName;
    role;
    linkedinUrl;
    profileUrl;
    twitterUsername;
    facebookUsername;
    instagramUsername;
    createdAt;
    updatedAt;
    lastLoginAt;
    isActive;
}
exports.CompanyUsersResponseDto = CompanyUsersResponseDto;
//# sourceMappingURL=company-admin.dto.js.map