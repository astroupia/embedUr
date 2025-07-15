"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockApolloEnrichmentProvider = void 0;
const common_1 = require("@nestjs/common");
let MockApolloEnrichmentProvider = class MockApolloEnrichmentProvider {
    name = 'APOLLO';
    provider = 'APOLLO';
    async enrich(request) {
        return {
            success: true,
            data: {
                company: 'Enriched Company',
                position: 'Senior Engineer',
                phone: '+1234567890',
                location: 'San Francisco, CA',
                industry: 'Technology',
            },
        };
    }
    canHandle(request) {
        return true;
    }
    getConfig() {
        return {};
    }
    isAvailable() {
        return true;
    }
};
exports.MockApolloEnrichmentProvider = MockApolloEnrichmentProvider;
exports.MockApolloEnrichmentProvider = MockApolloEnrichmentProvider = __decorate([
    (0, common_1.Injectable)()
], MockApolloEnrichmentProvider);
//# sourceMappingURL=mock-apollo-enrichment-provider.js.map