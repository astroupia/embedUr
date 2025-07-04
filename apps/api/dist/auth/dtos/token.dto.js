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
exports.TokenWithUserDto = exports.PasswordResetResponseDto = exports.CreatePasswordResetDto = exports.EmailVerificationResponseDto = exports.CreateEmailVerificationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateEmailVerificationDto {
    userId;
    token;
    expiresAt;
}
exports.CreateEmailVerificationDto = CreateEmailVerificationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailVerificationDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailVerificationDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateEmailVerificationDto.prototype, "expiresAt", void 0);
class EmailVerificationResponseDto {
    id;
    userId;
    token;
    expiresAt;
    createdAt;
}
exports.EmailVerificationResponseDto = EmailVerificationResponseDto;
class CreatePasswordResetDto {
    userId;
    token;
    expiresAt;
}
exports.CreatePasswordResetDto = CreatePasswordResetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePasswordResetDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePasswordResetDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreatePasswordResetDto.prototype, "expiresAt", void 0);
class PasswordResetResponseDto {
    id;
    userId;
    token;
    expiresAt;
    used;
    createdAt;
}
exports.PasswordResetResponseDto = PasswordResetResponseDto;
class TokenWithUserDto {
    id;
    userId;
    token;
    expiresAt;
    used;
    createdAt;
    user;
}
exports.TokenWithUserDto = TokenWithUserDto;
//# sourceMappingURL=token.dto.js.map