"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ApiKeyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
let ApiKeyGuard = ApiKeyGuard_1 = class ApiKeyGuard {
    logger = new common_1.Logger(ApiKeyGuard_1.name);
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'] || request.headers['authorization'];
        const expectedApiKey = process.env.ENRICHMENT_WEBHOOK_API_KEY;
        this.logger.log(`API Key check: provided=${apiKey}, expected=${expectedApiKey}`);
        if (!expectedApiKey) {
            this.logger.log('No API key configured, allowing request');
            return true;
        }
        if (!apiKey || apiKey !== expectedApiKey) {
            this.logger.warn(`Invalid API key: provided=${apiKey}, expected=${expectedApiKey}`);
            throw new common_1.UnauthorizedException('Invalid API key for webhook');
        }
        this.logger.log('API key validation successful');
        return true;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = ApiKeyGuard_1 = __decorate([
    (0, common_1.Injectable)()
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map