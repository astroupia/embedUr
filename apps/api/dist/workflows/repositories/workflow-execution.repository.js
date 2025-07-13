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
exports.WorkflowExecutionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const workflow_execution_entity_1 = require("../entities/workflow-execution.entity");
const workflow_constants_1 = require("../constants/workflow.constants");
let WorkflowExecutionRepository = class WorkflowExecutionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const execution = await this.prisma.workflowExecution.create({
            data: {
                workflowId: data.workflowId,
                leadId: data.leadId,
                companyId: data.companyId,
                status: data.status,
                triggeredBy: data.triggeredBy,
                startTime: data.startTime,
                inputData: data.inputData,
            },
            include: {
                workflow: true,
                lead: true,
            },
        });
        return this.mapToEntity(execution);
    }
    async updateStatus(id, status, outputData, errorMessage, endTime, durationMs) {
        const updateData = {
            status,
        };
        if (errorMessage) {
            updateData.outputData = { error: errorMessage };
        }
        else if (outputData) {
            updateData.outputData = outputData;
        }
        if (endTime) {
            updateData.endTime = endTime;
        }
        if (durationMs !== undefined) {
            updateData.durationMs = durationMs;
        }
        const execution = await this.prisma.workflowExecution.update({
            where: { id },
            data: updateData,
            include: {
                workflow: true,
                lead: true,
            },
        });
        return this.mapToEntity(execution);
    }
    async findOne(id, companyId) {
        const execution = await this.prisma.workflowExecution.findFirst({
            where: { id, companyId },
            include: {
                workflow: true,
                lead: true,
            },
        });
        if (!execution) {
            throw new Error('Workflow execution not found');
        }
        return this.mapToEntity(execution);
    }
    async findById(id) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id },
            include: {
                workflow: true,
                lead: true,
            },
        });
        return execution ? this.mapToEntity(execution) : null;
    }
    async findByWorkflowLeadAndCompany(workflowId, leadId, companyId) {
        const execution = await this.prisma.workflowExecution.findFirst({
            where: {
                workflowId,
                leadId,
                companyId,
            },
            include: {
                workflow: true,
                lead: true,
            },
        });
        return execution ? this.mapToEntity(execution) : null;
    }
    async findPendingByLead(leadId, companyId) {
        const executions = await this.prisma.workflowExecution.findMany({
            where: {
                leadId,
                companyId,
                status: {
                    in: [workflow_constants_1.WorkflowExecutionStatus.STARTED, workflow_constants_1.WorkflowExecutionStatus.RUNNING],
                },
            },
            include: {
                workflow: true,
                lead: true,
            },
            orderBy: { startTime: 'desc' },
        });
        return executions.map(execution => this.mapToEntity(execution));
    }
    async findByType(type, companyId, limit = 50) {
        const executions = await this.prisma.workflowExecution.findMany({
            where: {
                companyId,
                workflow: {
                    type,
                },
            },
            include: {
                workflow: true,
                lead: true,
            },
            orderBy: { startTime: 'desc' },
            take: limit,
        });
        return executions.map(execution => this.mapToEntity(execution));
    }
    async findByWorkflowIdAndTimeRange(workflowId, timeRange) {
        const executions = await this.prisma.workflowExecution.findMany({
            where: {
                workflowId,
                startTime: {
                    gte: timeRange.start,
                    lte: timeRange.end,
                },
            },
            include: {
                workflow: true,
                lead: true,
            },
            orderBy: { startTime: 'desc' },
        });
        return executions.map(execution => this.mapToEntity(execution));
    }
    async findByCompanyIdAndTimeRange(companyId, timeRange) {
        const executions = await this.prisma.workflowExecution.findMany({
            where: {
                companyId,
                startTime: {
                    gte: timeRange.start,
                    lte: timeRange.end,
                },
            },
            include: {
                workflow: true,
                lead: true,
            },
            orderBy: { startTime: 'desc' },
        });
        return executions.map(execution => this.mapToEntity(execution));
    }
    async getStats(companyId) {
        const [total, successful, failed, pending, leadEnrichmentStats, emailSequenceStats, leadRoutingStats, targetAudienceTranslatorStats, averageDuration,] = await Promise.all([
            this.prisma.workflowExecution.count({ where: { companyId } }),
            this.prisma.workflowExecution.count({
                where: { companyId, status: workflow_constants_1.WorkflowExecutionStatus.SUCCESS },
            }),
            this.prisma.workflowExecution.count({
                where: { companyId, status: workflow_constants_1.WorkflowExecutionStatus.FAILED },
            }),
            this.prisma.workflowExecution.count({
                where: {
                    companyId,
                    status: {
                        in: [workflow_constants_1.WorkflowExecutionStatus.STARTED, workflow_constants_1.WorkflowExecutionStatus.RUNNING],
                    },
                },
            }),
            this.getTypeStats(workflow_constants_1.WorkflowType.LEAD_ENRICHMENT, companyId),
            this.getTypeStats(workflow_constants_1.WorkflowType.EMAIL_SEQUENCE, companyId),
            this.getTypeStats(workflow_constants_1.WorkflowType.LEAD_ROUTING, companyId),
            this.getTypeStats(workflow_constants_1.WorkflowType.TARGET_AUDIENCE_TRANSLATOR, companyId),
            this.getAverageDuration(companyId),
        ]);
        return {
            total,
            successful,
            failed,
            pending,
            byType: {
                [workflow_constants_1.WorkflowType.LEAD_ENRICHMENT]: leadEnrichmentStats,
                [workflow_constants_1.WorkflowType.EMAIL_SEQUENCE]: emailSequenceStats,
                [workflow_constants_1.WorkflowType.LEAD_ROUTING]: leadRoutingStats,
                [workflow_constants_1.WorkflowType.TARGET_AUDIENCE_TRANSLATOR]: targetAudienceTranslatorStats,
            },
            averageDurationMs: averageDuration,
        };
    }
    async cleanupOld(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await this.prisma.workflowExecution.deleteMany({
            where: {
                startTime: {
                    lt: cutoffDate,
                },
                status: {
                    in: [workflow_constants_1.WorkflowExecutionStatus.SUCCESS, workflow_constants_1.WorkflowExecutionStatus.FAILED],
                },
            },
        });
        return result.count;
    }
    async findOneForDuration(id) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id },
            select: { startTime: true },
        });
        return execution;
    }
    async findRecentFailures(companyId, limit = 10) {
        const executions = await this.prisma.workflowExecution.findMany({
            where: {
                companyId,
                status: workflow_constants_1.WorkflowExecutionStatus.FAILED,
            },
            include: {
                workflow: true,
                lead: true,
            },
            orderBy: { startTime: 'desc' },
            take: limit,
        });
        return executions.map(execution => this.mapToEntity(execution));
    }
    async countActiveExecutions(companyId) {
        return this.prisma.workflowExecution.count({
            where: {
                companyId,
                status: {
                    in: [workflow_constants_1.WorkflowExecutionStatus.STARTED, workflow_constants_1.WorkflowExecutionStatus.RUNNING],
                },
            },
        });
    }
    async countPendingExecutions(companyId) {
        return this.prisma.workflowExecution.count({
            where: {
                companyId,
                status: workflow_constants_1.WorkflowExecutionStatus.STARTED,
            },
        });
    }
    async countByCompany(companyId) {
        return this.prisma.workflowExecution.count({
            where: { companyId },
        });
    }
    async getTypeStats(type, companyId) {
        const [total, successful, failed] = await Promise.all([
            this.prisma.workflowExecution.count({
                where: {
                    companyId,
                    workflow: { type },
                },
            }),
            this.prisma.workflowExecution.count({
                where: {
                    companyId,
                    workflow: { type },
                    status: workflow_constants_1.WorkflowExecutionStatus.SUCCESS,
                },
            }),
            this.prisma.workflowExecution.count({
                where: {
                    companyId,
                    workflow: { type },
                    status: workflow_constants_1.WorkflowExecutionStatus.FAILED,
                },
            }),
        ]);
        return { total, successful, failed };
    }
    async getAverageDuration(companyId) {
        const result = await this.prisma.workflowExecution.aggregate({
            where: {
                companyId,
                durationMs: { not: null },
                status: {
                    in: [workflow_constants_1.WorkflowExecutionStatus.SUCCESS, workflow_constants_1.WorkflowExecutionStatus.FAILED],
                },
            },
            _avg: {
                durationMs: true,
            },
        });
        return result._avg.durationMs || 0;
    }
    mapToEntity(execution) {
        return new workflow_execution_entity_1.WorkflowExecutionEntity(execution.id, execution.status, execution.triggeredBy, execution.startTime, execution.endTime, execution.inputData, execution.outputData, execution.durationMs, execution.leadId, execution.workflowId, execution.companyId, execution.errorMessage);
    }
};
exports.WorkflowExecutionRepository = WorkflowExecutionRepository;
exports.WorkflowExecutionRepository = WorkflowExecutionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowExecutionRepository);
//# sourceMappingURL=workflow-execution.repository.js.map