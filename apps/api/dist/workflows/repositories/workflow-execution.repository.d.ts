import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowExecutionStatus, WorkflowType } from '../constants/workflow.constants';
export declare class WorkflowExecutionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        workflowId: string;
        leadId: string | null;
        companyId: string;
        status: WorkflowExecutionStatus;
        triggeredBy: string;
        startTime: Date;
        inputData: Record<string, any>;
    }): Promise<WorkflowExecutionEntity>;
    updateStatus(id: string, status: WorkflowExecutionStatus, outputData?: Record<string, any>, errorMessage?: string, endTime?: Date, durationMs?: number): Promise<WorkflowExecutionEntity>;
    findOne(id: string, companyId: string): Promise<WorkflowExecutionEntity>;
    findById(id: string): Promise<WorkflowExecutionEntity | null>;
    findByWorkflowLeadAndCompany(workflowId: string, leadId: string, companyId: string): Promise<WorkflowExecutionEntity | null>;
    findPendingByLead(leadId: string, companyId: string): Promise<WorkflowExecutionEntity[]>;
    findByType(type: WorkflowType, companyId: string, limit?: number): Promise<WorkflowExecutionEntity[]>;
    findByWorkflowIdAndTimeRange(workflowId: string, timeRange: {
        start: Date;
        end: Date;
    }): Promise<WorkflowExecutionEntity[]>;
    findByCompanyIdAndTimeRange(companyId: string, timeRange: {
        start: Date;
        end: Date;
    }): Promise<WorkflowExecutionEntity[]>;
    getStats(companyId: string): Promise<{
        total: number;
        successful: number;
        failed: number;
        pending: number;
        byType: Record<WorkflowType, {
            total: number;
            successful: number;
            failed: number;
        }>;
        averageDurationMs: number;
    }>;
    cleanupOld(daysOld?: number): Promise<number>;
    findOneForDuration(id: string): Promise<{
        startTime: Date;
    } | null>;
    findRecentFailures(companyId: string, limit?: number): Promise<WorkflowExecutionEntity[]>;
    countActiveExecutions(companyId: string): Promise<number>;
    countPendingExecutions(companyId: string): Promise<number>;
    countByCompany(companyId: string): Promise<number>;
    private getTypeStats;
    private getAverageDuration;
    private mapToEntity;
}
