import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowEntity } from '../entities/workflow.entity';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowMapper } from '../mappers/workflow.mapper';
import { QueryWorkflowsCursorDto } from '../dto/query-workflows-cursor.dto';
import { QueryExecutionsCursorDto } from '../dto/query-executions-cursor.dto';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../dto/workflow.dto';
import { WorkflowType, WorkflowExecutionStatus } from '../constants/workflow.constants';

@Injectable()
export class WorkflowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkflowDto, companyId: string): Promise<WorkflowEntity> {
    try {
      const data = WorkflowMapper.toPrismaCreate(dto, companyId);
      const workflow = await this.prisma.workflow.create({ data });
      return WorkflowMapper.toEntity(workflow);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Workflow with this N8N workflow ID already exists for this company');
      }
      if (error.name === 'PrismaClientValidationError') {
        throw new BadRequestException('Invalid workflow data provided');
      }
      throw error;
    }
  }

  async findWithCursor(
    companyId: string,
    query: QueryWorkflowsCursorDto,
  ): Promise<{ data: WorkflowEntity[]; nextCursor: string | null }> {
    const { cursor, take = 20, type, search } = query;
    const takeNumber = typeof take === 'string' ? parseInt(take, 10) : take;
    const where: Record<string, any> = { companyId };
    
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

    // Get execution counts for each workflow
    const workflowsWithCounts = await Promise.all(
      data.map(async (item) => {
        const executionCount = await this.prisma.workflowExecution.count({
          where: {
            workflowId: item.id,
            status: {
              not: 'LOGGED',
            },
          },
        });
        return { ...item, executionCount };
      })
    );

    return {
      data: workflowsWithCounts.map(item => WorkflowMapper.toEntity(
        item,
        item.executionCount,
        item.executions[0] || undefined,
      )),
      nextCursor,
    };
  }

  async findOne(id: string, companyId: string): Promise<WorkflowEntity> {
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
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    // Count non-log executions
    const executionCount = await this.prisma.workflowExecution.count({
      where: {
        workflowId: id,
        status: {
          not: 'LOGGED',
        },
      },
    });

    return WorkflowMapper.toEntity(
      workflow,
      executionCount,
      workflow.executions[0] || undefined,
    );
  }

  async update(id: string, companyId: string, dto: UpdateWorkflowDto): Promise<WorkflowEntity> {
    // First check if workflow exists
    await this.findOne(id, companyId);

    const data = WorkflowMapper.toPrismaUpdate(dto);
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

    // Count non-log executions
    const executionCount = await this.prisma.workflowExecution.count({
      where: {
        workflowId: id,
        status: {
          not: 'LOGGED',
        },
      },
    });

    return WorkflowMapper.toEntity(
      workflow,
      executionCount,
      workflow.executions[0] || undefined,
    );
  }

  async remove(id: string, companyId: string): Promise<void> {
    const workflow = await this.findOne(id, companyId);
    
    if (!workflow.canBeDeleted) {
      throw new BadRequestException('Workflow cannot be deleted due to recent executions');
    }

    await this.prisma.workflow.delete({
      where: { id },
    });
  }

  async findByType(type: WorkflowType, companyId: string): Promise<WorkflowEntity[]> {
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

    // Get execution counts for each workflow
    const workflowsWithCounts = await Promise.all(
      workflows.map(async (workflow) => {
        const executionCount = await this.prisma.workflowExecution.count({
          where: {
            workflowId: workflow.id,
            status: {
              not: 'LOGGED',
            },
          },
        });
        return { ...workflow, executionCount };
      })
    );

    return workflowsWithCounts.map(workflow => WorkflowMapper.toEntity(
      workflow,
      workflow.executionCount,
      workflow.executions[0] || undefined,
    ));
  }

  async countByCompany(companyId: string): Promise<number> {
    return this.prisma.workflow.count({
      where: { companyId },
    });
  }

  async countByType(type: WorkflowType, companyId: string): Promise<number> {
    return this.prisma.workflow.count({
      where: { type, companyId },
    });
  }

  // Workflow Execution methods
  async createExecution(
    workflowId: string,
    companyId: string,
    triggeredBy: string,
    inputData: Record<string, any>,
    leadId?: string,
  ): Promise<WorkflowExecutionEntity> {
    const data = WorkflowMapper.toPrismaExecutionCreate(
      workflowId,
      companyId,
      triggeredBy,
      inputData,
      leadId,
    );
    
    const execution = await this.prisma.workflowExecution.create({ data });
    return WorkflowMapper.toExecutionEntity(execution);
  }

  async findExecutionsWithCursor(
    companyId: string,
    query: QueryExecutionsCursorDto,
  ): Promise<{ data: WorkflowExecutionEntity[]; nextCursor: string | null }> {
    const { cursor, take = 20, status, workflowId, leadId, startDate, endDate } = query;
    const takeNumber = typeof take === 'string' ? parseInt(take, 10) : take;
    const where: Record<string, any> = { 
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
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
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
      data: data.map(WorkflowMapper.toExecutionEntity),
      nextCursor,
    };
  }

  async findExecution(id: string, companyId: string): Promise<WorkflowExecutionEntity> {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id, companyId },
    });

    if (!execution) {
      throw new NotFoundException(`Workflow execution with ID ${id} not found`);
    }

    return WorkflowMapper.toExecutionEntity(execution);
  }

  async updateExecution(
    id: string,
    companyId: string,
    status: WorkflowExecutionStatus,
    outputData?: Record<string, any>,
    errorMessage?: string,
  ): Promise<WorkflowExecutionEntity> {
    // First check if execution exists
    await this.findExecution(id, companyId);

    const data = WorkflowMapper.toPrismaExecutionUpdate(status, outputData, errorMessage);
    const execution = await this.prisma.workflowExecution.update({
      where: { id },
      data,
    });

    return WorkflowMapper.toExecutionEntity(execution);
  }

  async findExecutionsByWorkflow(workflowId: string, companyId: string): Promise<WorkflowExecutionEntity[]> {
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

    return executions.map(WorkflowMapper.toExecutionEntity);
  }

  async countExecutionsByWorkflow(workflowId: string, companyId: string): Promise<number> {
    return this.prisma.workflowExecution.count({
      where: { workflowId, companyId },
    });
  }

  async countExecutionsByStatus(status: WorkflowExecutionStatus, companyId: string): Promise<number> {
    return this.prisma.workflowExecution.count({
      where: { status, companyId },
    });
  }

  async findByCompany(companyId: string): Promise<WorkflowEntity[]> {
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

    // Get execution counts for each workflow
    const workflowsWithCounts = await Promise.all(
      workflows.map(async (workflow) => {
        const executionCount = await this.prisma.workflowExecution.count({
          where: {
            workflowId: workflow.id,
            status: {
              not: 'LOGGED',
            },
          },
        });
        return { ...workflow, executionCount };
      })
    );

    return workflowsWithCounts.map(item => WorkflowMapper.toEntity(
      item,
      item.executionCount,
      item.executions[0] || undefined,
    ));
  }
} 