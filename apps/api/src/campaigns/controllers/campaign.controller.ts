import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { CampaignService } from '../services/campaign.service';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { QueryCampaignsCursorDto } from '../dto/query-campaigns-cursor.dto';
import { CampaignEntity } from '../entities/campaign.entity';
import { CampaignStatus } from '../constants/campaign.constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    type: CampaignEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Campaign already exists' })
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @CurrentUser() user: CurrentUser,
  ): Promise<CampaignEntity> {
    return this.campaignService.create(createCampaignDto, user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns with cursor-based pagination' })
  @ApiResponse({
    status: 200,
    description: 'Campaigns retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CampaignEntity' },
        },
        nextCursor: {
          type: 'string',
          nullable: true,
        },
      },
    },
  })
  async findAll(
    @Query() query: QueryCampaignsCursorDto,
    @CurrentUser() user: CurrentUser,
  ): Promise<{ data: CampaignEntity[]; nextCursor: string | null }> {
    return this.campaignService.findAll(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get campaign statistics' })
  @ApiResponse({
    status: 200,
    description: 'Campaign statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        active: { type: 'number' },
        byStatus: {
          type: 'object',
          properties: {
            DRAFT: { type: 'number' },
            ACTIVE: { type: 'number' },
            PAUSED: { type: 'number' },
            COMPLETED: { type: 'number' },
            ARCHIVED: { type: 'number' },
          },
        },
      },
    },
  })
  async getStats(@CurrentUser() user: CurrentUser) {
    return this.campaignService.getStats(user.companyId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get campaigns by status' })
  @ApiParam({ name: 'status', enum: CampaignStatus })
  @ApiResponse({
    status: 200,
    description: 'Campaigns retrieved successfully',
    type: [CampaignEntity],
  })
  async findByStatus(
    @Param('status') status: CampaignStatus,
    @CurrentUser() user: CurrentUser,
  ): Promise<CampaignEntity[]> {
    return this.campaignService.findByStatus(status, user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
    type: CampaignEntity,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUser,
  ): Promise<CampaignEntity> {
    return this.campaignService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign updated successfully',
    type: CampaignEntity,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @CurrentUser() user: CurrentUser,
  ): Promise<CampaignEntity> {
    return this.campaignService.update(id, user.companyId, updateCampaignDto);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign activated successfully',
    type: CampaignEntity,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 400, description: 'Campaign cannot be activated' })
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUser,
  ): Promise<CampaignEntity> {
    return this.campaignService.activate(id, user.companyId);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign paused successfully',
    type: CampaignEntity,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 400, description: 'Campaign cannot be paused' })
  async pause(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUser,
  ): Promise<CampaignEntity> {
    return this.campaignService.pause(id, user.companyId);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign completed successfully',
    type: CampaignEntity,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 400, description: 'Campaign cannot be completed' })
  async complete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUser,
  ): Promise<CampaignEntity> {
    return this.campaignService.complete(id, user.companyId);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign archived successfully',
    type: CampaignEntity,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 400, description: 'Campaign cannot be archived' })
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUser,
  ): Promise<CampaignEntity> {
    return this.campaignService.archive(id, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 204, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 400, description: 'Campaign cannot be deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUser,
  ): Promise<void> {
    return this.campaignService.remove(id, user.companyId);
  }
} 