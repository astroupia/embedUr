"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMapper = void 0;
class AdminMapper {
    static toCompanyAdminResponseDto(data) {
        return {
            id: data.id,
            name: data.name,
            schemaName: data.schemaName,
            status: data.status,
            planId: data.planId,
            industry: data.industry,
            location: data.location,
            website: data.website,
            description: data.description,
            logoUrl: data.logoUrl,
            bannerUrl: data.bannerUrl,
            employees: data.employees,
            revenue: data.revenue,
            linkedinUsername: data.linkedinUsername,
            twitterUsername: data.twitterUsername,
            facebookUsername: data.facebookUsername,
            instagramUsername: data.instagramUsername,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            plan: data.plan ? {
                id: data.plan.id,
                name: data.plan.name,
                description: data.plan.description,
                maxLeads: data.plan.maxLeads,
                maxWorkflows: data.plan.maxWorkflows,
                priceCents: data.plan.priceCents,
            } : undefined,
            userCount: data.users?.length || 0,
            activeUserCount: data.users?.filter((u) => u.updatedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0,
            lastActivityAt: data.users?.length > 0 ?
                new Date(Math.max(...data.users.map((u) => u.updatedAt.getTime()))) : undefined,
        };
    }
    static toCompanyUsersResponseDto(data) {
        return {
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            linkedinUrl: data.linkedinUrl,
            profileUrl: data.profileUrl,
            twitterUsername: data.twitterUsername,
            facebookUsername: data.facebookUsername,
            instagramUsername: data.instagramUsername,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            lastLoginAt: data.lastLoginAt,
            isActive: data.updatedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        };
    }
    static toSystemNotificationResponseDto(data) {
        return {
            id: data.id,
            message: data.message,
            level: data.level,
            read: data.read,
            companyId: data.companyId,
            createdAt: data.createdAt,
        };
    }
    static toAdminActionLogResponseDto(entity, userData) {
        return {
            id: entity.id,
            action: entity.action,
            targetType: entity.targetType,
            targetId: entity.targetId,
            details: entity.details,
            performedBy: entity.performedBy,
            timestamp: entity.timestamp,
            performedByUser: userData ? {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
            } : undefined,
        };
    }
    static toGlobalMetricsSummaryDto(data) {
        return {
            totalCompanies: data.totalCompanies,
            activeCompanies: data.activeCompanies,
            suspendedCompanies: data.suspendedCompanies,
            totalUsers: data.totalUsers,
            activeUsers: data.activeUsers,
            totalLeads: data.totalLeads,
            totalWorkflows: data.totalWorkflows,
            totalAiInteractions: data.totalAiInteractions,
            totalEmails: data.totalEmails,
            totalEnrichments: data.totalEnrichments,
            totalBookings: data.totalBookings || 0,
            totalCampaigns: data.totalCampaigns || 0,
            averageLeadsPerCompany: data.totalCompanies > 0 ? data.totalLeads / data.totalCompanies : 0,
            averageWorkflowsPerCompany: data.totalCompanies > 0 ? data.totalWorkflows / data.totalCompanies : 0,
            topPerformingCompanies: data.topPerformingCompanies || [],
            recentActivity: data.recentActivity || [],
        };
    }
    static toPlatformHealthDto(data) {
        return {
            status: data.status,
            databaseStatus: data.databaseStatus || 'connected',
            activeConnections: data.activeConnections || 0,
            systemLoad: data.systemLoad || 0,
            memoryUsage: data.memoryUsage || 0,
            diskUsage: data.diskUsage || 0,
            lastBackupAt: data.lastBackupAt,
            uptime: data.uptime || 0,
            alerts: data.alerts || [],
        };
    }
    static toCompanyAdminResponseDtos(data) {
        return data.map(item => this.toCompanyAdminResponseDto(item));
    }
    static toCompanyUsersResponseDtos(data) {
        return data.map(item => this.toCompanyUsersResponseDto(item));
    }
    static toSystemNotificationResponseDtos(data) {
        return data.map(item => this.toSystemNotificationResponseDto(item));
    }
    static toAdminActionLogResponseDtos(entities, userDataMap) {
        return entities.map(entity => {
            const userData = userDataMap?.[entity.performedBy];
            return this.toAdminActionLogResponseDto(entity, userData);
        });
    }
}
exports.AdminMapper = AdminMapper;
//# sourceMappingURL=admin.mapper.js.map