import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TargetAudienceTranslatorService } from '../services/target-audience-translator.service';
import { CreateTargetAudienceTranslatorDto, QueryTargetAudienceTranslatorCursorDto, InputFormat } from '../dto/target-audience-translator.dto';
import { TargetAudienceTranslatorEntity } from '../entities/target-audience-translator.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

interface CurrentUserPayload {
  userId: string;
  companyId: string;
  role: string;
}

@ApiTags('target-audience-translator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('target-audience-translator')
export class TargetAudienceTranslatorController {
  constructor(private readonly targetAudienceTranslatorService: TargetAudienceTranslatorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new target audience translation request' })
  @ApiResponse({
    status: 201,
    description: 'Target audience translation request created successfully',
    type: TargetAudienceTranslatorEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createDto: CreateTargetAudienceTranslatorDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TargetAudienceTranslatorEntity> {
    return this.targetAudienceTranslatorService.create(createDto, user.companyId, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all target audience translation requests with cursor-based pagination' })
  @ApiResponse({
    status: 200,
    description: 'Target audience translation requests retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TargetAudienceTranslatorEntity' },
        },
        nextCursor: {
          type: 'string',
          nullable: true,
        },
      },
    },
  })
  async findAll(
    @Query() query: QueryTargetAudienceTranslatorCursorDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ data: TargetAudienceTranslatorEntity[]; nextCursor: string | null }> {
    return this.targetAudienceTranslatorService.findAll(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get target audience translator statistics' })
  @ApiResponse({
    status: 200,
    description: 'Target audience translator statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: { type: 'object' },
        byInputFormat: { type: 'object' },
        successful: { type: 'number' },
        failed: { type: 'number' },
        pending: { type: 'number' },
      },
    },
  })
  async getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.targetAudienceTranslatorService.getStats(user.companyId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get target audience translation requests by status' })
  @ApiParam({ name: 'status', description: 'Status to filter by' })
  @ApiResponse({
    status: 200,
    description: 'Target audience translation requests retrieved successfully',
    type: [TargetAudienceTranslatorEntity],
  })
  async findByStatus(
    @Param('status') status: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TargetAudienceTranslatorEntity[]> {
    return this.targetAudienceTranslatorService.findByStatus(status, user.companyId);
  }

  @Get('format/:format')
  @ApiOperation({ summary: 'Get target audience translation requests by input format' })
  @ApiParam({ name: 'format', enum: InputFormat })
  @ApiResponse({
    status: 200,
    description: 'Target audience translation requests retrieved successfully',
    type: [TargetAudienceTranslatorEntity],
  })
  async findByInputFormat(
    @Param('format') format: InputFormat,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TargetAudienceTranslatorEntity[]> {
    return this.targetAudienceTranslatorService.findByInputFormat(format, user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a target audience translation request by ID' })
  @ApiParam({ name: 'id', description: 'Target Audience Translator ID' })
  @ApiResponse({
    status: 200,
    description: 'Target audience translation request retrieved successfully',
    type: TargetAudienceTranslatorEntity,
  })
  @ApiResponse({ status: 404, description: 'Target audience translation request not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TargetAudienceTranslatorEntity> {
    return this.targetAudienceTranslatorService.findOne(id, user.companyId);
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed target audience translation request' })
  @ApiParam({ name: 'id', description: 'Target Audience Translator ID' })
  @ApiResponse({
    status: 200,
    description: 'Target audience translation retry started successfully',
    type: TargetAudienceTranslatorEntity,
  })
  @ApiResponse({ status: 404, description: 'Target audience translation request not found' })
  @ApiResponse({ status: 400, description: 'Translation cannot be retried' })
  async retryTranslation(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TargetAudienceTranslatorEntity> {
    return this.targetAudienceTranslatorService.retryTranslation(id, user.companyId, user.userId);
  }
} 