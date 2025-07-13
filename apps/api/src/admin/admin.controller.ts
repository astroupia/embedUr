import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateCompanyStatusDto, UpdateCompanyPlanDto } from './dto/company-admin.dto';
import { CreateSystemNotificationDto } from './dto/system-notification.dto';
import { AdminActionLogFilterDto } from './dto/admin-action-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../constants/enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== COMPANY MANAGEMENT ==========

  /**
   * Get all companies with pagination and filtering
   */
  @Get('companies')
  async getAllCompanies(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllCompanies(page, limit, status as any, search);
  }

  /**
   * Get company details by ID
   */
  @Get('companies/:id')
  async getCompanyById(@Param('id') id: string) {
    return this.adminService.getCompanyById(id);
  }

  /**
   * Update company status
   */
  @Put('companies/:id/status')
  async updateCompanyStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyStatusDto,
    @Request() req: any,
  ) {
    return this.adminService.updateCompanyStatus(id, dto, req.user.id);
  }

  /**
   * Update company plan
   */
  @Put('companies/:id/plan')
  async updateCompanyPlan(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyPlanDto,
    @Request() req: any,
  ) {
    return this.adminService.updateCompanyPlan(id, dto, req.user.id);
  }

  /**
   * Get users for a specific company
   */
  @Get('companies/:id/users')
  async getCompanyUsers(@Param('id') id: string) {
    return this.adminService.getCompanyUsers(id);
  }

  // ========== GLOBAL METRICS ==========

  /**
   * Get global usage metrics overview
   */
  @Get('usage')
  async getGlobalUsageMetrics() {
    return this.adminService.getGlobalMetricsSummary();
  }

  /**
   * Get platform health status
   */
  @Get('health')
  async getPlatformHealth() {
    return this.adminService.getPlatformHealth();
  }

  // ========== SYSTEM NOTIFICATIONS ==========

  /**
   * Create system-wide notification
   */
  @Post('system-notifications')
  async createSystemNotification(
    @Body() dto: CreateSystemNotificationDto,
    @Request() req: any,
  ) {
    return this.adminService.createSystemNotification(dto, req.user.id);
  }

  /**
   * Get system notifications
   */
  @Get('system-notifications')
  async getSystemNotifications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getSystemNotifications(page, limit);
  }

  // ========== ADMIN ACTION LOGS ==========

  /**
   * Get admin action logs with filtering
   */
  @Get('action-logs')
  async getActionLogs(
    @Query() filters: AdminActionLogFilterDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getActionLogs(filters, page, limit);
  }

  // ========== ADDITIONAL ADMIN ENDPOINTS ==========

  /**
   * Get dashboard overview for admin
   */
  @Get('dashboard')
  async getAdminDashboard() {
    const [metrics, health] = await Promise.all([
      this.adminService.getGlobalMetricsSummary(),
      this.adminService.getPlatformHealth(),
    ]);

    return {
      metrics,
      health,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get recent admin activities
   */
  @Get('recent-activities')
  async getRecentActivities(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const filters: AdminActionLogFilterDto = {};
    return this.adminService.getActionLogs(filters, 1, limit);
  }

  /**
   * Get system statistics
   */
  @Get('statistics')
  async getSystemStatistics() {
    const metrics = await this.adminService.getGlobalMetricsSummary();
    
    return {
      totalCompanies: metrics.totalCompanies,
      activeCompanies: metrics.activeCompanies,
      totalUsers: metrics.totalUsers,
      totalLeads: metrics.totalLeads,
      totalWorkflows: metrics.totalWorkflows,
      totalAiInteractions: metrics.totalAiInteractions,
      totalEmails: metrics.totalEmails,
      totalEnrichments: metrics.totalEnrichments,
      averageLeadsPerCompany: metrics.averageLeadsPerCompany,
      averageWorkflowsPerCompany: metrics.averageWorkflowsPerCompany,
      topPerformingCompanies: metrics.topPerformingCompanies,
    };
  }
} 