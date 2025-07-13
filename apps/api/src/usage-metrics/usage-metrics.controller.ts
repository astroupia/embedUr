import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { UsageMetricsService } from './usage-metrics.service';
import { CreateUsageMetricDto } from './dto/create-usage-metric.dto';
import { UsageMetricResponseDto, UsageMetricsOverviewDto } from './dto/usage-metric-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../constants/enums';
import { MetricName } from './entities/usage-metric.entity';

@Controller('usage-metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsageMetricsController {
  constructor(private readonly usageMetricsService: UsageMetricsService) {}

  /**
   * Get usage metrics for current company
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  async getCompanyMetrics(
    @Request() req: any,
    @Query('period') period?: string,
    @Query('metricNames') metricNames?: string,
  ): Promise<UsageMetricResponseDto[]> {
    const companyId = req.user.companyId;
    const metricNamesArray = metricNames ? metricNames.split(',') as MetricName[] : undefined;

    return this.usageMetricsService.getCompanyMetrics(
      companyId,
      period,
      metricNamesArray,
    );
  }

  /**
   * Get usage overview for current company
   */
  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  async getUsageOverview(@Request() req: any): Promise<UsageMetricsOverviewDto> {
    const companyId = req.user.companyId;
    return this.usageMetricsService.getUsageOverview(companyId);
  }

  /**
   * Get current period metrics for current company
   */
  @Get('current')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  async getCurrentPeriodMetrics(@Request() req: any): Promise<UsageMetricResponseDto[]> {
    const companyId = req.user.companyId;
    return this.usageMetricsService.getCurrentPeriodMetrics(companyId);
  }

  /**
   * Get metrics statistics for current company
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  async getMetricsStats(@Request() req: any): Promise<{
    totalMetrics: number;
    currentPeriodMetrics: number;
    mostUsedMetric: string;
    leastUsedMetric: string;
  }> {
    const companyId = req.user.companyId;
    return this.usageMetricsService.getMetricsStats(companyId);
  }

  /**
   * Record a new metric (internal use only)
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async recordMetric(
    @Body() dto: CreateUsageMetricDto,
    @Request() req: any,
  ): Promise<UsageMetricResponseDto> {
    // Only allow recording metrics for your own company
    if (dto.companyId !== req.user.companyId) {
      throw new BadRequestException('Can only record metrics for your own company');
    }
    return this.usageMetricsService.recordMetric(dto);
  }
}

/**
 * Admin endpoints for global metrics
 */
@Controller('admin/usage-metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsageMetricsController {
  constructor(private readonly usageMetricsService: UsageMetricsService) {}

  /**
   * Get all companies metrics (admin only)
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async getAllCompaniesMetrics(
    @Query('period') period?: string,
    @Query('metricNames') metricNames?: string,
  ): Promise<UsageMetricResponseDto[]> {
    const metricNamesArray = metricNames ? metricNames.split(',') as MetricName[] : undefined;

    return this.usageMetricsService.getAllCompaniesMetrics(
      period,
      metricNamesArray,
    );
  }

  /**
   * Get global metrics summary (admin only)
   */
  @Get('summary')
  @Roles(UserRole.ADMIN)
  async getGlobalMetricsSummary(): Promise<{
    totalCompanies: number;
    totalLeads: number;
    totalWorkflows: number;
    totalAiInteractions: number;
    totalEmails: number;
    totalEnrichments: number;
  }> {
    return this.usageMetricsService.getGlobalMetricsSummary();
  }

  /**
   * Get metrics for a specific company (admin only)
   */
  @Get(':companyId')
  @Roles(UserRole.ADMIN)
  async getCompanyMetricsForAdmin(
    @Param('companyId') companyId: string,
  ): Promise<UsageMetricResponseDto[]> {
    return this.usageMetricsService.getCompanyMetricsForAdmin(companyId);
  }

  /**
   * Get usage overview for a specific company (admin only)
   */
  @Get(':companyId/overview')
  @Roles(UserRole.ADMIN)
  async getCompanyUsageOverviewForAdmin(
    @Param('companyId') companyId: string,
  ): Promise<UsageMetricsOverviewDto> {
    // Temporarily set the user's companyId to the requested companyId
    const originalCompanyId = companyId;
    return this.usageMetricsService.getUsageOverview(originalCompanyId);
  }
} 