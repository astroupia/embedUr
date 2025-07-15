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
  ApiQuery,
} from '@nestjs/swagger';
import { LeadService } from '../services/lead.service';
import { CreateLeadDto, UpdateLeadDto } from '../dtos/lead.dto';
import { QueryLeadsCursorDto } from '../dtos/query-leads-cursor.dto';
import { LeadEntity } from '../entities/lead.entity';
import { LeadStatus } from '../constants/lead.constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LeadResponseDto } from '../dtos/lead-response.dto';
import { LeadResponseMapper } from '../mappers/lead-response.mapper';

interface CurrentUserPayload {
  userId: string;
  companyId: string;
  role: string;
}

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    type: LeadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Lead already exists' })
  async create(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<LeadResponseDto> {
    const lead = await this.leadService.create(createLeadDto, user.companyId);
    return LeadResponseMapper.toResponseDto(lead);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads with cursor-based pagination' })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/LeadResponseDto' },
        },
        nextCursor: {
          type: 'string',
          nullable: true,
        },
      },
    },
  })
  async findAll(
    @Query() query: QueryLeadsCursorDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ data: LeadResponseDto[]; nextCursor: string | null }> {
    const result = await this.leadService.findAll(user.companyId, query);
    return {
      data: LeadResponseMapper.toResponseDtoList(result.data),
      nextCursor: result.nextCursor,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({
    status: 200,
    description: 'Lead statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: {
          type: 'object',
          properties: {
            NEW: { type: 'number' },
            CONTACTED: { type: 'number' },
            INTERESTED: { type: 'number' },
            NOT_INTERESTED: { type: 'number' },
            BOOKED: { type: 'number' },
            DO_NOT_CONTACT: { type: 'number' },
          },
        },
      },
    },
  })
  async getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.leadService.getStats(user.companyId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get leads by status' })
  @ApiParam({ name: 'status', enum: LeadStatus })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    type: [LeadResponseDto],
  })
  async findByStatus(
    @Param('status') status: LeadStatus,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<LeadResponseDto[]> {
    const leads = await this.leadService.findByStatus(status, user.companyId);
    return LeadResponseMapper.toResponseDtoList(leads);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({
    status: 200,
    description: 'Lead retrieved successfully',
    type: LeadResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<LeadResponseDto> {
    const lead = await this.leadService.findOne(id, user.companyId);
    return LeadResponseMapper.toResponseDto(lead);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    type: LeadResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<LeadResponseDto> {
    const lead = await this.leadService.update(id, user.companyId, updateLeadDto);
    return LeadResponseMapper.toResponseDto(lead);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 204, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.leadService.remove(id, user.companyId);
  }

  @Post(':id/enrich')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger enrichment for a lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Enrichment triggered successfully', type: LeadResponseDto })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async triggerEnrichment(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<LeadResponseDto> {
    await this.leadService.triggerEnrichment(id, user.companyId);
    // Return the updated lead with enrichment triggered
    const lead = await this.leadService.findOne(id, user.companyId);
    return LeadResponseMapper.toResponseDto(lead);
  }
} 