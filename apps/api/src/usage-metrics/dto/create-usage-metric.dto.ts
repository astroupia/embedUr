import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { MetricName } from '../entities/usage-metric.entity';

export class CreateUsageMetricDto {
  @IsEnum(MetricName)
  @IsNotEmpty()
  metricName: MetricName;

  @IsNumber()
  @IsOptional()
  count?: number;

  @IsString()
  @IsOptional()
  period?: string;

  @IsString()
  @IsNotEmpty()
  companyId: string;
} 