import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AIPersonaService } from './ai-persona.service';
import { CreateAIPersonaDto } from './dto/create-ai-persona.dto';
import { UpdateAIPersonaDto } from './dto/update-ai-persona.dto';
import { AIPersonaResponseDto } from './dto/ai-persona-response.dto';

@ApiTags('ai-personas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-personas')
export class AIPersonaController {
  constructor(private readonly service: AIPersonaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all AI personas for the company' })
  @ApiResponse({
    status: 200,
    description: 'AI personas retrieved successfully',
    type: [AIPersonaResponseDto],
  })
  async findAll(@CurrentUser() user: CurrentUser): Promise<AIPersonaResponseDto[]> {
    return this.service.findAll(user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new AI persona' })
  @ApiResponse({
    status: 201,
    description: 'AI persona created successfully',
    type: AIPersonaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() dto: CreateAIPersonaDto,
    @CurrentUser() user: CurrentUser,
  ): Promise<AIPersonaResponseDto> {
    return this.service.create(dto, user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an AI persona by ID' })
  @ApiParam({ name: 'id', description: 'AI Persona ID' })
  @ApiResponse({
    status: 200,
    description: 'AI persona retrieved successfully',
    type: AIPersonaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'AI persona not found' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUser,
  ): Promise<AIPersonaResponseDto> {
    return this.service.findById(id, user.companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an AI persona' })
  @ApiParam({ name: 'id', description: 'AI Persona ID' })
  @ApiResponse({
    status: 200,
    description: 'AI persona updated successfully',
    type: AIPersonaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'AI persona not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAIPersonaDto,
    @CurrentUser() user: CurrentUser,
  ): Promise<AIPersonaResponseDto> {
    return this.service.update(id, dto, user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an AI persona' })
  @ApiParam({ name: 'id', description: 'AI Persona ID' })
  @ApiResponse({ status: 204, description: 'AI persona deleted successfully' })
  @ApiResponse({ status: 404, description: 'AI persona not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete persona linked to active campaigns' })
  @HttpCode(204)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUser,
  ): Promise<void> {
    await this.service.delete(id, user.companyId);
  }
} 