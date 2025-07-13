import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { AdminMapper } from './admin.mapper';
import { PrismaModule } from '../prisma/prisma.module';
import { UsageMetricsModule } from '../usage-metrics/usage-metrics.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UsageMetricsModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, AdminMapper],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {} 