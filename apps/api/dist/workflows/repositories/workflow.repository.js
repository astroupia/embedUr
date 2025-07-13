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
exports.WorkflowRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const workflow_mapper_1 = require("../mappers/workflow.mapper");
let WorkflowRepository = class WorkflowRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, companyId) {
        try {
            const data = workflow_mapper_1.WorkflowMapper.toPrismaCreate(dto, companyId);
            const workflow = await this.prisma.workflow.create({ data });
            return workflow_mapper_1.WorkflowMapper.toEntity(workflow);
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Workflow with this N8N workflow ID already exists for this company');
            }
            if (error.name === 'PrismaClientValidationError') {
                throw new common_1.BadRequestException('Invalid workflow data provided');
            }
            throw error;
        }
    }
    async findWithCursor(companyId, query) {
        const { cursor, take = 20, type, search } = query;
        const takeNumber = typeof take === 'string' ? parseInt(take, 10) : take;
        const where = { companyId };
        if (type) {
            where.type = type;
        }
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        const items = await this.prisma.workflow.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: takeNumber + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            include: {
                executions: {
                    where: {
                        status: {
                            not: 'LOGGED',
                        },
                    },
                    orderBy: { startTime: 'desc' },
                    take: 1,
                },
            },
        });
        const hasMore = items.length > takeNumber;
        const data = hasMore ? items.slice(0, -1) : items;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        const workflowsWithCounts = await Promise.all(data.map(async (item) => {
            const executionCount = await this.prisma.workflowExecution.count({
                where: {
                    workflowId: item.id,
                    status: {
                        not: 'LOGGED',
                    },
                },
            });
            return { ...item, executionCount };
        }));
        return {
            data: workflowsWithCounts.map(item => workflow_mapper_1.WorkflowMapper.toEntity(item, item.executionCount, item.executions[0] || undefined)),
            nextCursor,
        };
    }
    async findOne(id, companyId) {
        const workflow = await this.prisma.workflow.findFirst({
            where: { id, companyId },
            include: {
                executions: {
                    where: {
                        status: {
                            not: 'LOGGED',
                        },
                    },
                    orderBy: { startTime: 'desc' },
                    take: 1,
                },
            },
        });
        if (!workflow) {
            throw new common_1.NotFoundException(`Workflow with ID ${id} not found`);
        }
        const executionCount = await this.prisma.workflowExecution.count({
            where: {
                workflowId: id,
                status: {
                    not: 'LOGGED',
                },
            },
        });
        return workflow_mapper_1.WorkflowMapper.toEntity(workflow, executionCount, workflow.executions[0] || undefined);
    }
    async update(id, companyId, dto) {
        await this.findOne(id, companyId);
        const data = workflow_mapper_1.WorkflowMapper.toPrismaUpdate(dto);
        const workflow = await this.prisma.workflow.update({
            where: { id },
            data,
            include: {
                executions: {
                    where: {
                        status: {
                            not: 'LOGGED',
                        },
                    },
                    orderBy: { startTime: 'desc' },
                    take: 1,
                },
            },
        });
        const executionCount = await this.prisma.workflowExecution.count({
            where: {
                workflowId: id,
                status: {
                    not: 'LOGGED',
                },
            },
        });
        return workflow_mapper_1.WorkflowMapper.toEntity(workflow, executionCount, workflow.executions[0] || undefined);
    }
    async remove(id, companyId) {
        const workflow = await this.findOne(id, companyId);
        if (!workflow.canBeDeleted) {
            throw new common_1.BadRequestException('Workflow cannot be deleted due to recent executions');
        }
        await this.prisma.workflow.delete({
            where: { id },
        });
    }
    async findByType(type, companyId) {
        const workflows = await this.prisma.workflow.findMany({
            where: { type, companyId },
            orderBy: { createdAt: 'desc' },
            include: {
                executions: {
                    where: {
                        status: {
                            not: 'LOGGED',
                        },
                    },
                    orderBy: { startTime: 'desc' },
                    take: 1,
                },
            },
        });
        const workflowsWithCounts = await Promise.all(workflows.map(async (workflow) => {
            const executionCount = await this.prisma.workflowExecution.count({
                where: {
                    workflowId: workflow.id,
                    status: {
                        not: 'LOGGED',
                    },
                },
            });
            return { ...workflow, executionCount };
        }));
        return workflowsWithCounts.map(workflow => workflow_mapper_1.WorkflowMapper.toEntity(workflow, workflow.executionCount, workflow.executions[0] || undefined));
    }
    async countByCompany(companyId) {
        return this.prisma.workflow.count({
            where: { companyId },
        });
    }
    async countByType(type, companyId) {
        return this.prisma.workflow.count({
            where: { type, companyId },
        });
    }
    async createExecution(workflowId, companyId, triggeredBy, inputData, leadId) {
        const data = workflow_mapper_1.WorkflowMapper.toPrismaExecutionCreate(workflowId, companyId, triggeredBy, inputData, leadId);
        const execution = await this.prisma.workflowExecution.create({ data });
        return workflow_mapper_1.WorkflowMapper.toExecutionEntity(execution);
    }
    async findExecutionsWithCursor(companyId, query) {
        const { cursor, take = 20, status, workflowId, leadId, startDate, endDate } = query;
        const takeNumber = typeof take === 'string' ? parseInt(take, 10) : take;
        const where = {
            companyId,
            status: {
                not: 'LOGGED',
            },
        };
        if (status) {
            where.status = status;
        }
        if (workflowId) {
            where.workflowId = workflowId;
        }
        if (leadId) {
            where.leadId = leadId;
        }
        if (startDate || endDate) {
            where.startTime = {};
            if (startDate)
                where.startTime.gte = new Date(startDate);
            if (endDate)
                where.startTime.lte = new Date(endDate);
        }
        const items = await this.prisma.workflowExecution.findMany({
            where,
            orderBy: { startTime: 'desc' },
            take: takeNumber + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });
        const hasMore = items.length > takeNumber;
        const data = hasMore ? items.slice(0, -1) : items;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return {
            data: data.map(workflow_mapper_1.WorkflowMapper.toExecutionEntity),
            nextCursor,
        };
    }
    async findExecution(id, companyId) {
        const execution = await this.prisma.workflowExecution.findFirst({
            where: { id, companyId },
        });
        if (!execution) {
            throw new common_1.NotFoundException(`Workflow execution with ID ${id} not found`);
        }
        return workflow_mapper_1.WorkflowMapper.toExecutionEntity(execution);
    }
    async updateExecution(id, companyId, status, outputData, errorMessage) {
        await this.findExecution(id, companyId);
        const data = workflow_mapper_1.WorkflowMapper.toPrismaExecutionUpdate(status, outputData, errorMessage);
        const execution = await this.prisma.workflowExecution.update({
            where: { id },
            data,
        });
        return workflow_mapper_1.WorkflowMapper.toExecutionEntity(execution);
    }
    async findExecutionsByWorkflow(workflowId, companyId) {
        const executions = await this.prisma.workflowExecution.findMany({
            where: {
                workflowId,
                companyId,
                status: {
                    not: 'LOGGED',
                },
            },
            orderBy: { startTime: 'desc' },
        });
        return executions.map(workflow_mapper_1.WorkflowMapper.toExecutionEntity);
    }
    async countExecutionsByWorkflow(workflowId, companyId) {
        return this.prisma.workflowExecution.count({
            where: { workflowId, companyId },
        });
    }
    async countExecutionsByStatus(status, companyId) {
        return this.prisma.workflowExecution.count({
            where: { status, companyId },
        });
    }
    async findByCompany(companyId) {
        const workflows = await this.prisma.workflow.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            include: {
                executions: {
                    where: {
                        status: {
                            not: 'LOGGED',
                        },
                    },
                    orderBy: { startTime: 'desc' },
                    take: 1,
                },
            },
        });
        const workflowsWithCounts = await Promise.all(workflows.map(async (workflow) => {
            const executionCount = await this.prisma.workflowExecution.count({
                where: {
                    workflowId: workflow.id,
                    status: {
                        not: 'LOGGED',
                    },
                },
            });
            return { ...workflow, executionCount };
        }));
        return workflowsWithCounts.map(item => workflow_mapper_1.WorkflowMapper.toEntity(item, item.executionCount, item.executions[0] || undefined));
    }
};
exports.WorkflowRepository = WorkflowRepository;
exports.WorkflowRepository = WorkflowRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowRepository);
//# sourceMappingURL=workflow.repository.js.map