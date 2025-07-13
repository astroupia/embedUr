import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionStatus, WorkflowType } from '../constants/workflow.constants';

@Injectable()
export class WorkflowExecutionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    workflowId: string;
    leadId: string | null;
    companyId: string;
    status: WorkflowExecutionStatus;
    triggeredBy: string;
    startTime: Date;
    inputData: Record<string, any>;
  }): Promise<WorkflowExecutionEntity> {
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

  async updateStatus(
    id: string,
    status: WorkflowExecutionStatus,
    outputData?: Record<string, any>,
    errorMessage?: string,
    endTime?: Date,
    durationMs?: number,
  ): Promise<WorkflowExecutionEntity> {
    const updateData: any = {
      status,
    };

    // Handle output data and error message
    if (errorMessage) {
      updateData.outputData = { error: errorMessage };
    } else if (outputData) {
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

  async findOne(id: string, companyId: string): Promise<WorkflowExecutionEntity> {
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

  async findById(id: string): Promise<WorkflowExecutionEntity | null> {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id },
      include: {
        workflow: true,
        lead: true,
      },
    });

    return execution ? this.mapToEntity(execution) : null;
  }

  async findByWorkflowLeadAndCompany(
    workflowId: string,
    leadId: string,
    companyId: string,
  ): Promise<WorkflowExecutionEntity | null> {
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

  async findPendingByLead(leadId: string, companyId: string): Promise<WorkflowExecutionEntity[]> {
    const executions = await this.prisma.workflowExecution.findMany({
      where: {
        leadId,
        companyId,
        status: {
          in: [WorkflowExecutionStatus.STARTED, WorkflowExecutionStatus.RUNNING],
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

  async findByType(
    type: WorkflowType,
    companyId: string,
    limit: number = 50,
  ): Promise<WorkflowExecutionEntity[]> {
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

  async findByWorkflowIdAndTimeRange(
    workflowId: string,
    timeRange: { start: Date; end: Date },
  ): Promise<WorkflowExecutionEntity[]> {
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

  async findByCompanyIdAndTimeRange(
    companyId: string,
    timeRange: { start: Date; end: Date },
  ): Promise<WorkflowExecutionEntity[]> {
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

  async getStats(companyId: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    byType: Record<WorkflowType, { total: number; successful: number; failed: number }>;
    averageDurationMs: number;
  }> {
    const [
      total,
      successful,
      failed,
      pending,
      leadEnrichmentStats,
      emailSequenceStats,
      leadRoutingStats,
      targetAudienceTranslatorStats,
      averageDuration,
    ] = await Promise.all([
      this.prisma.workflowExecution.count({ where: { companyId } }),
      this.prisma.workflowExecution.count({
        where: { companyId, status: WorkflowExecutionStatus.SUCCESS },
      }),
      this.prisma.workflowExecution.count({
        where: { companyId, status: WorkflowExecutionStatus.FAILED },
      }),
      this.prisma.workflowExecution.count({
        where: {
          companyId,
          status: {
            in: [WorkflowExecutionStatus.STARTED, WorkflowExecutionStatus.RUNNING],
          },
        },
      }),
      this.getTypeStats(WorkflowType.LEAD_ENRICHMENT, companyId),
      this.getTypeStats(WorkflowType.EMAIL_SEQUENCE, companyId),
      this.getTypeStats(WorkflowType.LEAD_ROUTING, companyId),
      this.getTypeStats(WorkflowType.TARGET_AUDIENCE_TRANSLATOR, companyId),
      this.getAverageDuration(companyId),
    ]);

    return {
      total,
      successful,
      failed,
      pending,
      byType: {
        [WorkflowType.LEAD_ENRICHMENT]: leadEnrichmentStats,
        [WorkflowType.EMAIL_SEQUENCE]: emailSequenceStats,
        [WorkflowType.LEAD_ROUTING]: leadRoutingStats,
        [WorkflowType.TARGET_AUDIENCE_TRANSLATOR]: targetAudienceTranslatorStats,
      },
      averageDurationMs: averageDuration,
    };
  }

  async cleanupOld(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.workflowExecution.deleteMany({
      where: {
        startTime: {
          lt: cutoffDate,
        },
        status: {
          in: [WorkflowExecutionStatus.SUCCESS, WorkflowExecutionStatus.FAILED],
        },
      },
    });

    return result.count;
  }

  async findOneForDuration(id: string): Promise<{ startTime: Date } | null> {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id },
      select: { startTime: true },
    });
    return execution;
  }

  async findRecentFailures(companyId: string, limit: number = 10): Promise<WorkflowExecutionEntity[]> {
    const executions = await this.prisma.workflowExecution.findMany({
      where: {
        companyId,
        status: WorkflowExecutionStatus.FAILED,
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

  async countActiveExecutions(companyId: string): Promise<number> {
    return this.prisma.workflowExecution.count({
      where: {
        companyId,
        status: {
          in: [WorkflowExecutionStatus.STARTED, WorkflowExecutionStatus.RUNNING],
        },
      },
    });
  }

  async countPendingExecutions(companyId: string): Promise<number> {
    return this.prisma.workflowExecution.count({
      where: {
        companyId,
        status: WorkflowExecutionStatus.STARTED,
      },
    });
  }

  async countByCompany(companyId: string): Promise<number> {
    return this.prisma.workflowExecution.count({
      where: { companyId },
    });
  }

  private async getTypeStats(
    type: WorkflowType,
    companyId: string,
  ): Promise<{ total: number; successful: number; failed: number }> {
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
          status: WorkflowExecutionStatus.SUCCESS,
        },
      }),
      this.prisma.workflowExecution.count({
        where: {
          companyId,
          workflow: { type },
          status: WorkflowExecutionStatus.FAILED,
        },
      }),
    ]);

    return { total, successful, failed };
  }

  private async getAverageDuration(companyId: string): Promise<number> {
    const result = await this.prisma.workflowExecution.aggregate({
      where: {
        companyId,
        durationMs: { not: null },
        status: {
          in: [WorkflowExecutionStatus.SUCCESS, WorkflowExecutionStatus.FAILED],
        },
      },
      _avg: {
        durationMs: true,
      },
    });

    return result._avg.durationMs || 0;
  }

  private mapToEntity(execution: any): WorkflowExecutionEntity {
    return new WorkflowExecutionEntity(
      execution.id,
      execution.status,
      execution.triggeredBy,
      execution.startTime,
      execution.endTime,
      execution.inputData,
      execution.outputData,
      execution.durationMs,
      execution.leadId,
      execution.workflowId,
      execution.companyId,
      execution.errorMessage,
    );
  }
} 