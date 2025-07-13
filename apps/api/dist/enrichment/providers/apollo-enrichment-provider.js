"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ApolloEnrichmentProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloEnrichmentProvider = void 0;
const common_1 = require("@nestjs/common");
let ApolloEnrichmentProvider = ApolloEnrichmentProvider_1 = class ApolloEnrichmentProvider {
    name = 'APOLLO';
    provider = 'APOLLO';
    logger = new common_1.Logger(ApolloEnrichmentProvider_1.name);
    async enrich(request) {
        this.logger.log(`Simulating Apollo enrichment for: ${request.email || request.fullName}`);
        return {
            success: false,
            error: 'Provider APOLLO is not available in test',
        };
    }
    canHandle(request) {
        return !!(request.email || request.linkedinUrl);
    }
    getConfig() {
        return {};
    }
    isAvailable() {
        return false;
    }
};
exports.ApolloEnrichmentProvider = ApolloEnrichmentProvider;
exports.ApolloEnrichmentProvider = ApolloEnrichmentProvider = ApolloEnrichmentProvider_1 = __decorate([
    (0, common_1.Injectable)()
], ApolloEnrichmentProvider);
//# sourceMappingURL=apollo-enrichment-provider.js.map