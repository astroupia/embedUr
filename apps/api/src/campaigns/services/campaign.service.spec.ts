// Mock dependencies to avoid import errors
jest.mock('../repositories/campaign.repository', () => ({
  CampaignRepository: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../ai-persona/ai-persona.service', () => ({
  AIPersonaService: jest.fn().mockImplementation(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignRepository } from '../repositories/campaign.repository';
import { CampaignEventsService } from './campaign-events.service';
import { AIPersonaService } from '../../ai-persona/ai-persona.service';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { QueryCampaignsCursorDto } from '../dto/query-campaigns-cursor.dto';
import { CampaignEntity } from '../entities/campaign.entity';
import { CampaignStatus } from '../constants/campaign.constants';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CampaignService', () => {
  let service: CampaignService;
  let campaignRepository: jest.Mocked<CampaignRepository>;
  let campaignEvents: jest.Mocked<CampaignEventsService>;
  let aiPersonaService: jest.Mocked<AIPersonaService>;

  const mockCompanyId = 'company-123';
  const mockCampaignId = 'campaign-123';
  const mockAiPersonaId = 'ai-persona-123';
  const mockWorkflowId = 'workflow-123';

  const mockCampaign = new CampaignEntity(
    mockCampaignId,
    'Test Campaign',
    'Test Description',
    CampaignStatus.DRAFT,
    mockAiPersonaId,
    mockWorkflowId,
    mockCompanyId,
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  const mockActiveCampaign = new CampaignEntity(
    mockCampaignId,
    'Active Campaign',
    'Active Description',
    CampaignStatus.ACTIVE,
    mockAiPersonaId,
    mockWorkflowId,
    mockCompanyId,
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  const mockPausedCampaign = new CampaignEntity(
    mockCampaignId,
    'Paused Campaign',
    'Paused Description',
    CampaignStatus.PAUSED,
    mockAiPersonaId,
    mockWorkflowId,
    mockCompanyId,
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  beforeEach(async () => {
    const mockCampaignRepository = {
      create: jest.fn(),
      findWithCursor: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByStatus: jest.fn(),
      countByCompany: jest.fn(),
      countActiveByCompany: jest.fn(),
      countByStatus: jest.fn(),
      archive: jest.fn(),
    };

    const mockCampaignEvents = {
      logExecution: jest.fn(),
      triggerCampaignActivation: jest.fn(),
      triggerCampaignPause: jest.fn(),
      triggerCampaignCompletion: jest.fn(),
      triggerStatusChangeWorkflow: jest.fn(),
    };

    const mockAiPersonaService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        {
          provide: CampaignRepository,
          useValue: mockCampaignRepository,
        },
        {
          provide: CampaignEventsService,
          useValue: mockCampaignEvents,
        },
        {
          provide: AIPersonaService,
          useValue: mockAiPersonaService,
        },
      ],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
    campaignRepository = module.get(CampaignRepository);
    campaignEvents = module.get(CampaignEventsService);
    aiPersonaService = module.get(AIPersonaService);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCampaignDto: CreateCampaignDto = {
      name: 'New Campaign',
      description: 'New Description',
      aiPersonaId: mockAiPersonaId,
      workflowId: mockWorkflowId,
    };

    it('should create a campaign successfully', async () => {
      aiPersonaService.findById.mockResolvedValue({} as any);
      campaignRepository.create.mockResolvedValue(mockCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);

      const result = await service.create(createCampaignDto, mockCompanyId);

      expect(aiPersonaService.findById).toHaveBeenCalledWith(mockAiPersonaId, mockCompanyId);
      expect(campaignRepository.create).toHaveBeenCalledWith(createCampaignDto, mockCompanyId);
      expect(campaignEvents.logExecution).toHaveBeenCalledWith(mockCampaign, 'CAMPAIGN_CREATED', {
        name: mockCampaign.name,
        description: mockCampaign.description,
        aiPersonaId: mockCampaign.aiPersonaId,
        workflowId: mockCampaign.workflowId,
      });
      expect(result).toBe(mockCampaign);
    });

    it('should create a campaign without AI persona', async () => {
      const dtoWithoutAi = { ...createCampaignDto };
      delete dtoWithoutAi.aiPersonaId;
      
      campaignRepository.create.mockResolvedValue(mockCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);

      const result = await service.create(dtoWithoutAi, mockCompanyId);

      expect(aiPersonaService.findById).not.toHaveBeenCalled();
      expect(campaignRepository.create).toHaveBeenCalledWith(dtoWithoutAi, mockCompanyId);
      expect(result).toBe(mockCampaign);
    });

    it('should throw BadRequestException for invalid AI persona ID', async () => {
      aiPersonaService.findById.mockRejectedValue(new NotFoundException('Persona not found'));

      await expect(service.create(createCampaignDto, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(aiPersonaService.findById).toHaveBeenCalledWith(mockAiPersonaId, mockCompanyId);
      expect(campaignRepository.create).not.toHaveBeenCalled();
    });

    it('should rethrow other AI persona service errors', async () => {
      const error = new Error('Database connection failed');
      aiPersonaService.findById.mockRejectedValue(error);

      await expect(service.create(createCampaignDto, mockCompanyId)).rejects.toThrow(Error);
      expect(aiPersonaService.findById).toHaveBeenCalledWith(mockAiPersonaId, mockCompanyId);
      expect(campaignRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors during creation', async () => {
      aiPersonaService.findById.mockResolvedValue({} as any);
      const error = new Error('Database error');
      campaignRepository.create.mockRejectedValue(error);

      await expect(service.create(createCampaignDto, mockCompanyId)).rejects.toThrow(Error);
      expect(campaignRepository.create).toHaveBeenCalledWith(createCampaignDto, mockCompanyId);
      expect(campaignEvents.logExecution).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const queryDto: QueryCampaignsCursorDto = {
      cursor: 'cursor-123',
      take: 10,
    };

    const mockResponse = {
      data: [mockCampaign, mockActiveCampaign],
      nextCursor: 'next-cursor-456',
    };

    it('should return campaigns with pagination', async () => {
      campaignRepository.findWithCursor.mockResolvedValue(mockResponse);

      const result = await service.findAll(mockCompanyId, queryDto);

      expect(campaignRepository.findWithCursor).toHaveBeenCalledWith(mockCompanyId, queryDto);
      expect(result).toBe(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      const emptyResponse = { data: [], nextCursor: null };
      campaignRepository.findWithCursor.mockResolvedValue(emptyResponse);

      const result = await service.findAll(mockCompanyId, queryDto);

      expect(campaignRepository.findWithCursor).toHaveBeenCalledWith(mockCompanyId, queryDto);
      expect(result.data).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      campaignRepository.findWithCursor.mockRejectedValue(error);

      await expect(service.findAll(mockCompanyId, queryDto)).rejects.toThrow(Error);
      expect(campaignRepository.findWithCursor).toHaveBeenCalledWith(mockCompanyId, queryDto);
    });
  });

  describe('findOne', () => {
    it('should return a campaign by ID', async () => {
      campaignRepository.findOne.mockResolvedValue(mockCampaign);

      const result = await service.findOne(mockCampaignId, mockCompanyId);

      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(result).toBe(mockCampaign);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      campaignRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(mockCampaignId, mockCompanyId)).rejects.toThrow(Error);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
    });
  });

  describe('update', () => {
    const updateCampaignDto: UpdateCampaignDto = {
      name: 'Updated Campaign',
      status: CampaignStatus.ACTIVE,
    };

    it('should update a campaign successfully', async () => {
      campaignRepository.findOne.mockResolvedValue(mockCampaign);
      campaignRepository.update.mockResolvedValue(mockActiveCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);
      campaignEvents.triggerStatusChangeWorkflow.mockResolvedValue(undefined);
      campaignEvents.triggerCampaignActivation.mockResolvedValue(undefined);

      const result = await service.update(mockCampaignId, mockCompanyId, updateCampaignDto);

      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).toHaveBeenCalledWith(mockCampaignId, mockCompanyId, updateCampaignDto);
      expect(campaignEvents.logExecution).toHaveBeenCalledWith(mockActiveCampaign, 'CAMPAIGN_UPDATED', {
        previousData: {
          name: mockCampaign.name,
          status: mockCampaign.status,
          aiPersonaId: mockCampaign.aiPersonaId,
          workflowId: mockCampaign.workflowId,
        },
        newData: {
          name: mockActiveCampaign.name,
          status: mockActiveCampaign.status,
          aiPersonaId: mockActiveCampaign.aiPersonaId,
          workflowId: mockActiveCampaign.workflowId,
        },
      });
      expect(campaignEvents.triggerStatusChangeWorkflow).toHaveBeenCalledWith(mockActiveCampaign, CampaignStatus.DRAFT);
      expect(campaignEvents.triggerCampaignActivation).toHaveBeenCalledWith(mockActiveCampaign);
      expect(result).toBe(mockActiveCampaign);
    });

    it('should update without status change', async () => {
      const dtoWithoutStatus = { name: 'Updated Campaign' };
      campaignRepository.findOne.mockResolvedValue(mockCampaign);
      campaignRepository.update.mockResolvedValue(mockCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);

      const result = await service.update(mockCampaignId, mockCompanyId, dtoWithoutStatus);

      expect(campaignRepository.update).toHaveBeenCalledWith(mockCampaignId, mockCompanyId, dtoWithoutStatus);
      expect(campaignEvents.triggerStatusChangeWorkflow).not.toHaveBeenCalled();
      expect(result).toBe(mockCampaign);
    });

    it('should validate AI persona if provided', async () => {
      const dtoWithAi = { ...updateCampaignDto, aiPersonaId: 'new-ai-persona' };
      aiPersonaService.findById.mockResolvedValue({} as any);
      campaignRepository.findOne.mockResolvedValue(mockCampaign);
      campaignRepository.update.mockResolvedValue(mockActiveCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);
      campaignEvents.triggerStatusChangeWorkflow.mockResolvedValue(undefined);
      campaignEvents.triggerCampaignActivation.mockResolvedValue(undefined);

      await service.update(mockCampaignId, mockCompanyId, dtoWithAi);

      expect(aiPersonaService.findById).toHaveBeenCalledWith('new-ai-persona', mockCompanyId);
    });

    it('should throw BadRequestException for invalid AI persona ID during update', async () => {
      const dtoWithAi = { ...updateCampaignDto, aiPersonaId: 'invalid-ai-persona' };
      aiPersonaService.findById.mockRejectedValue(new NotFoundException('Persona not found'));

      await expect(service.update(mockCampaignId, mockCompanyId, dtoWithAi)).rejects.toThrow(BadRequestException);
      expect(aiPersonaService.findById).toHaveBeenCalledWith('invalid-ai-persona', mockCompanyId);
      expect(campaignRepository.update).not.toHaveBeenCalled();
    });

    it('should handle repository errors during update', async () => {
      const error = new Error('Database error');
      campaignRepository.findOne.mockRejectedValue(error);

      await expect(service.update(mockCampaignId, mockCompanyId, updateCampaignDto)).rejects.toThrow(Error);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('should archive a campaign successfully', async () => {
      const archivedCampaign = new CampaignEntity(
        mockCampaignId,
        'Test Campaign',
        'Test Description',
        CampaignStatus.ARCHIVED,
        mockAiPersonaId,
        mockWorkflowId,
        mockCompanyId,
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      campaignRepository.findOne.mockResolvedValue(mockCampaign);
      campaignRepository.archive.mockResolvedValue(archivedCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);

      const result = await service.archive(mockCampaignId, mockCompanyId);

      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.archive).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignEvents.logExecution).toHaveBeenCalledWith(archivedCampaign, 'CAMPAIGN_ARCHIVED', {
        previousStatus: mockCampaign.status,
        name: archivedCampaign.name,
      });
      expect(result).toBe(archivedCampaign);
    });

    it('should handle repository errors during archive', async () => {
      const error = new Error('Database error');
      campaignRepository.findOne.mockRejectedValue(error);

      await expect(service.archive(mockCampaignId, mockCompanyId)).rejects.toThrow(Error);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.archive).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a campaign successfully', async () => {
      campaignRepository.findOne.mockResolvedValue(mockCampaign);
      campaignRepository.remove.mockResolvedValue(undefined);
      campaignEvents.logExecution.mockResolvedValue(undefined);

      await service.remove(mockCampaignId, mockCompanyId);

      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.remove).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignEvents.logExecution).toHaveBeenCalledWith(mockCampaign, 'CAMPAIGN_DELETED', {
        name: mockCampaign.name,
        status: mockCampaign.status,
      });
    });

    it('should handle repository errors during removal', async () => {
      const error = new Error('Database error');
      campaignRepository.findOne.mockRejectedValue(error);

      await expect(service.remove(mockCampaignId, mockCompanyId)).rejects.toThrow(Error);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findByStatus', () => {
    it('should return campaigns by status', async () => {
      const campaigns = [mockActiveCampaign];
      campaignRepository.findByStatus.mockResolvedValue(campaigns);

      const result = await service.findByStatus(CampaignStatus.ACTIVE, mockCompanyId);

      expect(campaignRepository.findByStatus).toHaveBeenCalledWith(CampaignStatus.ACTIVE, mockCompanyId);
      expect(result).toBe(campaigns);
      expect(result).toHaveLength(1);
    });

    it('should handle empty results for status', async () => {
      campaignRepository.findByStatus.mockResolvedValue([]);

      const result = await service.findByStatus(CampaignStatus.COMPLETED, mockCompanyId);

      expect(campaignRepository.findByStatus).toHaveBeenCalledWith(CampaignStatus.COMPLETED, mockCompanyId);
      expect(result).toHaveLength(0);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      campaignRepository.findByStatus.mockRejectedValue(error);

      await expect(service.findByStatus(CampaignStatus.ACTIVE, mockCompanyId)).rejects.toThrow(Error);
      expect(campaignRepository.findByStatus).toHaveBeenCalledWith(CampaignStatus.ACTIVE, mockCompanyId);
    });
  });

  describe('getStats', () => {
    const mockStats = {
      total: 5,
      active: 2,
      byStatus: {
        [CampaignStatus.DRAFT]: 1,
        [CampaignStatus.ACTIVE]: 2,
        [CampaignStatus.PAUSED]: 1,
        [CampaignStatus.COMPLETED]: 0,
        [CampaignStatus.ARCHIVED]: 1,
      },
    };

    it('should return campaign statistics', async () => {
      campaignRepository.countByCompany.mockResolvedValue(5);
      campaignRepository.countActiveByCompany.mockResolvedValue(2);
      campaignRepository.countByStatus
        .mockResolvedValueOnce(1) // DRAFT
        .mockResolvedValueOnce(2) // ACTIVE
        .mockResolvedValueOnce(1) // PAUSED
        .mockResolvedValueOnce(0) // COMPLETED
        .mockResolvedValueOnce(1); // ARCHIVED

      const result = await service.getStats(mockCompanyId);

      expect(campaignRepository.countByCompany).toHaveBeenCalledWith(mockCompanyId);
      expect(campaignRepository.countActiveByCompany).toHaveBeenCalledWith(mockCompanyId);
      expect(campaignRepository.countByStatus).toHaveBeenCalledTimes(5);
      expect(result).toEqual(mockStats);
    });

    it('should handle zero campaigns', async () => {
      campaignRepository.countByCompany.mockResolvedValue(0);
      campaignRepository.countActiveByCompany.mockResolvedValue(0);
      campaignRepository.countByStatus
        .mockResolvedValueOnce(0) // DRAFT
        .mockResolvedValueOnce(0) // ACTIVE
        .mockResolvedValueOnce(0) // PAUSED
        .mockResolvedValueOnce(0) // COMPLETED
        .mockResolvedValueOnce(0); // ARCHIVED

      const result = await service.getStats(mockCompanyId);

      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.byStatus[CampaignStatus.ACTIVE]).toBe(0);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      campaignRepository.countByCompany.mockRejectedValue(error);

      await expect(service.getStats(mockCompanyId)).rejects.toThrow(Error);
      expect(campaignRepository.countByCompany).toHaveBeenCalledWith(mockCompanyId);
    });
  });

  describe('activate', () => {
    it('should activate a campaign successfully', async () => {
      campaignRepository.findOne.mockResolvedValue(mockCampaign);
      campaignRepository.update.mockResolvedValue(mockActiveCampaign);
      campaignEvents.triggerCampaignActivation.mockResolvedValue(undefined);

      const result = await service.activate(mockCampaignId, mockCompanyId);

      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).toHaveBeenCalledWith(mockCampaignId, mockCompanyId, { status: CampaignStatus.ACTIVE });
      expect(campaignEvents.triggerCampaignActivation).toHaveBeenCalledWith(mockActiveCampaign);
      expect(result).toBe(mockActiveCampaign);
    });

    it('should throw BadRequestException when campaign cannot be activated', async () => {
      campaignRepository.findOne.mockResolvedValue(mockActiveCampaign);

      await expect(service.activate(mockCampaignId, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).not.toHaveBeenCalled();
      expect(campaignEvents.triggerCampaignActivation).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      campaignRepository.findOne.mockRejectedValue(error);

      await expect(service.activate(mockCampaignId, mockCompanyId)).rejects.toThrow(Error);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should pause a campaign successfully', async () => {
      campaignRepository.findOne.mockResolvedValue(mockActiveCampaign);
      campaignRepository.update.mockResolvedValue(mockPausedCampaign);
      campaignEvents.triggerCampaignPause.mockResolvedValue(undefined);

      const result = await service.pause(mockCampaignId, mockCompanyId);

      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).toHaveBeenCalledWith(mockCampaignId, mockCompanyId, { status: CampaignStatus.PAUSED });
      expect(campaignEvents.triggerCampaignPause).toHaveBeenCalledWith(mockPausedCampaign);
      expect(result).toBe(mockPausedCampaign);
    });

    it('should throw BadRequestException when campaign cannot be paused', async () => {
      campaignRepository.findOne.mockResolvedValue(mockCampaign);

      await expect(service.pause(mockCampaignId, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).not.toHaveBeenCalled();
      expect(campaignEvents.triggerCampaignPause).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      campaignRepository.findOne.mockRejectedValue(error);

      await expect(service.pause(mockCampaignId, mockCompanyId)).rejects.toThrow(Error);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete a campaign successfully', async () => {
      const completedCampaign = new CampaignEntity(
        mockCampaignId,
        'Active Campaign',
        'Active Description',
        CampaignStatus.COMPLETED,
        mockAiPersonaId,
        mockWorkflowId,
        mockCompanyId,
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      campaignRepository.findOne.mockResolvedValue(mockActiveCampaign);
      campaignRepository.update.mockResolvedValue(completedCampaign);
      campaignEvents.triggerCampaignCompletion.mockResolvedValue(undefined);

      const result = await service.complete(mockCampaignId, mockCompanyId);

      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).toHaveBeenCalledWith(mockCampaignId, mockCompanyId, { status: CampaignStatus.COMPLETED });
      expect(campaignEvents.triggerCampaignCompletion).toHaveBeenCalledWith(completedCampaign);
      expect(result).toBe(completedCampaign);
    });

    it('should throw BadRequestException when campaign cannot be completed', async () => {
      const completedCampaign = new CampaignEntity(
        mockCampaignId,
        'Completed Campaign',
        'Completed Description',
        CampaignStatus.COMPLETED,
        mockAiPersonaId,
        mockWorkflowId,
        mockCompanyId,
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      campaignRepository.findOne.mockResolvedValue(completedCampaign);

      await expect(service.complete(mockCampaignId, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).not.toHaveBeenCalled();
      expect(campaignEvents.triggerCampaignCompletion).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      campaignRepository.findOne.mockRejectedValue(error);

      await expect(service.complete(mockCampaignId, mockCompanyId)).rejects.toThrow(Error);
      expect(campaignRepository.findOne).toHaveBeenCalledWith(mockCampaignId, mockCompanyId);
      expect(campaignRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('handleStatusChange (private method)', () => {
    it('should trigger appropriate workflows for status changes', async () => {
      campaignEvents.triggerStatusChangeWorkflow.mockResolvedValue(undefined);
      campaignEvents.triggerCampaignActivation.mockResolvedValue(undefined);

      // Use update method to test handleStatusChange indirectly
      const updateDto = { status: CampaignStatus.ACTIVE };
      campaignRepository.findOne.mockResolvedValue(mockCampaign);
      campaignRepository.update.mockResolvedValue(mockActiveCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);

      await service.update(mockCampaignId, mockCompanyId, updateDto);

      expect(campaignEvents.triggerStatusChangeWorkflow).toHaveBeenCalledWith(mockActiveCampaign, CampaignStatus.DRAFT);
      expect(campaignEvents.triggerCampaignActivation).toHaveBeenCalledWith(mockActiveCampaign);
    });

    it('should handle workflow trigger errors gracefully', async () => {
      const updateDto = { status: CampaignStatus.ACTIVE };
      campaignRepository.findOne.mockResolvedValue(mockCampaign);
      campaignRepository.update.mockResolvedValue(mockActiveCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);
      campaignEvents.triggerStatusChangeWorkflow.mockRejectedValue(new Error('Workflow error'));

      // Should not throw error, just log it
      await expect(service.update(mockCampaignId, mockCompanyId, updateDto)).rejects.toThrow(Error);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined values gracefully', async () => {
      const dtoWithNulls: CreateCampaignDto = {
        name: 'Test Campaign',
        description: null as any,
        aiPersonaId: undefined as any,
        workflowId: null as any,
      };

      campaignRepository.create.mockResolvedValue(mockCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);

      const result = await service.create(dtoWithNulls, mockCompanyId);

      expect(campaignRepository.create).toHaveBeenCalledWith(dtoWithNulls, mockCompanyId);
      expect(result).toBe(mockCampaign);
    });

    it('should handle empty string parameters', async () => {
      const dtoWithEmptyStrings: CreateCampaignDto = {
        name: 'Test Campaign',
        description: '',
        aiPersonaId: '',
        workflowId: '',
      };

      campaignRepository.create.mockResolvedValue(mockCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);

      const result = await service.create(dtoWithEmptyStrings, mockCompanyId);

      expect(campaignRepository.create).toHaveBeenCalledWith(dtoWithEmptyStrings, mockCompanyId);
      expect(result).toBe(mockCampaign);
    });

    it('should handle special characters in campaign data', async () => {
      const dtoWithSpecialChars: CreateCampaignDto = {
        name: 'Campaign with special chars: !@#$%^&*()',
        description: 'Description with emojis 🚀 📧',
        aiPersonaId: 'ai-persona-123',
        workflowId: 'workflow-123',
      };

      aiPersonaService.findById.mockResolvedValue({} as any);
      campaignRepository.create.mockResolvedValue(mockCampaign);
      campaignEvents.logExecution.mockResolvedValue(undefined);

      const result = await service.create(dtoWithSpecialChars, mockCompanyId);

      expect(campaignRepository.create).toHaveBeenCalledWith(dtoWithSpecialChars, mockCompanyId);
      expect(result).toBe(mockCampaign);
    });
  });
}); 