"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentMapper = void 0;
const enrichment_request_entity_1 = require("../entities/enrichment-request.entity");
class EnrichmentMapper {
    static toEntity(prismaModel) {
        return new enrichment_request_entity_1.EnrichmentRequestEntity(prismaModel.id, prismaModel.provider, prismaModel.requestData, prismaModel.responseData, 'PENDING', prismaModel.leadId, prismaModel.companyId, prismaModel.createdAt, prismaModel.createdAt, undefined, 0, undefined);
    }
    static toEntityList(prismaModels) {
        return prismaModels.map(this.toEntity);
    }
    static toPrismaCreate(entity) {
        return {
            provider: entity.provider,
            requestData: entity.requestData,
            responseData: entity.responseData || undefined,
            leadId: entity.leadId,
            companyId: entity.companyId,
        };
    }
    static toPrismaUpdate(entity) {
        return {
            provider: entity.provider,
            requestData: entity.requestData,
            responseData: entity.responseData || undefined,
        };
    }
}
exports.EnrichmentMapper = EnrichmentMapper;
//# sourceMappingURL=enrichment.mapper.js.map