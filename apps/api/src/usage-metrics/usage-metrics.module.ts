import { Module } from '@nestjs/common';
import { UsageMetricsController, AdminUsageMetricsController } from './usage-metrics.controller';
import { UsageMetricsService } from './usage-metrics.service';
import { UsageMetricsRepository } from './usage-metrics.repository';
import { UsageMetricsMapper } from './usage-metrics.mapper';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsageMetricsController, AdminUsageMetricsController],
  providers: [UsageMetricsService, UsageMetricsRepository, UsageMetricsMapper],
  exports: [UsageMetricsService, UsageMetricsRepository],
})
export class UsageMetricsModule {} 