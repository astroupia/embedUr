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
import { WorkflowService } from '../services/workflow.service';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto, RetryExecutionDto } from '../dto/workflow.dto';
import { QueryWorkflowsCursorDto } from '../dto/query-workflows-cursor.dto';
import { QueryExecutionsCursorDto } from '../dto/query-executions-cursor.dto';
import { WorkflowEntity } from '../entities/workflow.entity';
import { WorkflowExecutionEntity } from '../entities/workflow-execution.entity';
import { WorkflowType } from '../constants/workflow.constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { WorkflowResponseDto } from '../dto/workflow-response.dto';
import { WorkflowResponseMapper } from '../mappers/workflow-response.mapper';
import { WorkflowExecutionResponseDto } from '../dto/workflow-execution-response.dto';
import { WorkflowExecutionResponseMapper } from '../mappers/workflow-execution-response.mapper';

interface CurrentUserPayload {
  userId: string;
  companyId: string;
  role: string;
}

@ApiTags('workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({
    status: 201,
    description: 'Workflow created successfully',
    type: WorkflowResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Workflow already exists' })
  async create(
    @Body() createWorkflowDto: CreateWorkflowDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WorkflowResponseDto> {
    const workflow = await this.workflowService.create(createWorkflowDto, user.companyId);
    return WorkflowResponseMapper.toDto(workflow);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workflows with cursor-based pagination' })
  @ApiResponse({
    status: 200,
    description: 'Workflows retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/WorkflowResponseDto' },
        },
        nextCursor: {
          type: 'string',
          nullable: true,
        },
      },
    },
  })
  async findAll(
    @Query() query: QueryWorkflowsCursorDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ data: WorkflowResponseDto[]; nextCursor: string | null }> {
    const result = await this.workflowService.findAll(user.companyId, query);
    return {
      data: WorkflowResponseMapper.toDtoArray(result.data),
      nextCursor: result.nextCursor,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get workflow statistics' })
  @ApiResponse({
    status: 200,
    description: 'Workflow statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byType: {
          type: 'object',
          properties: {
            TARGET_AUDIENCE_TRANSLATOR: { type: 'number' },
            LEAD_ENRICHMENT: { type: 'number' },
            EMAIL_SEQUENCE: { type: 'number' },
            LEAD_ROUTING: { type: 'number' },
          },
        },
        totalExecutions: { type: 'number' },
        successfulExecutions: { type: 'number' },
        failedExecutions: { type: 'number' },
      },
    },
  })
  async getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.workflowService.getStats(user.companyId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get workflows by type' })
  @ApiParam({ name: 'type', enum: WorkflowType })
  @ApiResponse({
    status: 200,
    description: 'Workflows retrieved successfully',
    type: [WorkflowResponseDto],
  })
  async findByType(
    @Param('type') type: WorkflowType,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WorkflowResponseDto[]> {
    const workflows = await this.workflowService.findByType(type, user.companyId);
    return WorkflowResponseMapper.toDtoArray(workflows);
  }

  // Execution-specific endpoints (must come before :id routes)
  @Get('executions')
  @ApiOperation({ summary: 'Get all workflow executions with cursor-based pagination' })
  @ApiResponse({
    status: 200,
    description: 'Workflow executions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/WorkflowExecutionResponseDto' },
        },
        nextCursor: {
          type: 'string',
          nullable: true,
        },
      },
    },
  })
  async findExecutions(
    @Query() query: QueryExecutionsCursorDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ data: WorkflowExecutionResponseDto[]; nextCursor: string | null }> {
    const result = await this.workflowService.findExecutions(user.companyId, query);
    return {
      data: WorkflowExecutionResponseMapper.toDtoArray(result.data),
      nextCursor: result.nextCursor,
    };
  }

  @Get('executions/:executionId')
  @ApiOperation({ summary: 'Get a workflow execution by ID' })
  @ApiParam({ name: 'executionId', description: 'Workflow Execution ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow execution retrieved successfully',
    type: WorkflowExecutionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workflow execution not found' })
  async findExecution(
    @Param('executionId') executionId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WorkflowExecutionResponseDto> {
    const execution = await this.workflowService.findExecution(executionId, user.companyId);
    return WorkflowExecutionResponseMapper.toDto(execution);
  }

  @Post('executions/:executionId/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed workflow execution' })
  @ApiParam({ name: 'executionId', description: 'Workflow Execution ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow execution retry started successfully',
    type: WorkflowExecutionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workflow execution not found' })
  @ApiResponse({ status: 400, description: 'Execution cannot be retried' })
  async retryExecution(
    @Param('executionId') executionId: string,
    @Body() retryExecutionDto: RetryExecutionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WorkflowExecutionResponseDto> {
    const execution = await this.workflowService.retryExecution(executionId, user.companyId, retryExecutionDto, user.userId);
    return WorkflowExecutionResponseMapper.toDto(execution);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workflow by ID' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow retrieved successfully',
    type: WorkflowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WorkflowResponseDto> {
    const workflow = await this.workflowService.findOne(id, user.companyId);
    return WorkflowResponseMapper.toDto(workflow);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow updated successfully',
    type: WorkflowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WorkflowResponseDto> {
    const workflow = await this.workflowService.update(id, user.companyId, updateWorkflowDto);
    return WorkflowResponseMapper.toDto(workflow);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 204, description: 'Workflow deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 400, description: 'Workflow cannot be deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.workflowService.remove(id, user.companyId);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute a workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({
    status: 201,
    description: 'Workflow execution started successfully',
    type: WorkflowExecutionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async executeWorkflow(
    @Param('id') id: string,
    @Body() executeWorkflowDto: ExecuteWorkflowDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WorkflowExecutionResponseDto> {
    const execution = await this.workflowService.executeWorkflow(id, user.companyId, executeWorkflowDto, user.userId);
    return WorkflowExecutionResponseMapper.toDto(execution);
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'Get workflow executions' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow executions retrieved successfully',
    type: [WorkflowExecutionResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async findExecutionsByWorkflow(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WorkflowExecutionResponseDto[]> {
    const executions = await this.workflowService.findExecutionsByWorkflow(id, user.companyId);
    return WorkflowExecutionResponseMapper.toDtoArray(executions);
  }


} 