// Mock repository and PrismaService to avoid Prisma import errors
jest.mock('../repositories/campaign.repository', () => ({
  CampaignRepository: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CampaignController } from './campaign.controller';
import { CampaignService } from '../services/campaign.service';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { QueryCampaignsCursorDto } from '../dto/query-campaigns-cursor.dto';
import { CampaignEntity } from '../entities/campaign.entity';
import { CampaignStatus } from '../constants/campaign.constants';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CampaignController', () => {
  let controller: CampaignController;
  let campaignService: jest.Mocked<CampaignService>;

  const mockCurrentUser: CurrentUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    companyId: 'company-123',
  };

  const mockCampaignEntity = new CampaignEntity(
    'campaign-123',
    'Test Campaign',
    'Test Description',
    CampaignStatus.DRAFT,
    null,
    null,
    'company-123',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  const mockActiveCampaign = new CampaignEntity(
    'campaign-456',
    'Active Campaign',
    'Active Description',
    CampaignStatus.ACTIVE,
    'ai-persona-123',
    'workflow-123',
    'company-123',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  beforeEach(async () => {
    const mockCampaignService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByStatus: jest.fn(),
      getStats: jest.fn(),
      activate: jest.fn(),
      pause: jest.fn(),
      complete: jest.fn(),
      archive: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignController],
      providers: [
        {
          provide: CampaignService,
          useValue: mockCampaignService,
        },
      ],
    }).compile();

    controller = module.get<CampaignController>(CampaignController);
    campaignService = module.get(CampaignService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCampaignDto: CreateCampaignDto = {
      name: 'New Campaign',
      description: 'New Description',
      aiPersonaId: 'ai-persona-123',
      workflowId: 'workflow-123',
    };

    it('should create a campaign successfully', async () => {
      campaignService.create.mockResolvedValue(mockCampaignEntity);

      const result = await controller.create(createCampaignDto, mockCurrentUser);

      expect(campaignService.create).toHaveBeenCalledWith(createCampaignDto, mockCurrentUser.companyId);
      expect(result).toBe(mockCampaignEntity);
    });

    it('should handle service errors', async () => {
      const error = new BadRequestException('Invalid AI persona ID');
      campaignService.create.mockRejectedValue(error);

      await expect(controller.create(createCampaignDto, mockCurrentUser)).rejects.toThrow(BadRequestException);
      expect(campaignService.create).toHaveBeenCalledWith(createCampaignDto, mockCurrentUser.companyId);
    });
  });

  describe('findAll', () => {
    const queryDto: QueryCampaignsCursorDto = {
      cursor: 'cursor-123',
      take: 10,
    };

    const mockResponse = {
      data: [mockCampaignEntity, mockActiveCampaign],
      nextCursor: 'next-cursor-456',
    };

    it('should return campaigns with pagination', async () => {
      campaignService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockCurrentUser);

      expect(campaignService.findAll).toHaveBeenCalledWith(mockCurrentUser.companyId, queryDto);
      expect(result).toBe(mockResponse);
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe('next-cursor-456');
    });

    it('should handle empty results', async () => {
      const emptyResponse = { data: [], nextCursor: null };
      campaignService.findAll.mockResolvedValue(emptyResponse);

      const result = await controller.findAll(queryDto, mockCurrentUser);

      expect(campaignService.findAll).toHaveBeenCalledWith(mockCurrentUser.companyId, queryDto);
      expect(result.data).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
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
      campaignService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats(mockCurrentUser);

      expect(campaignService.getStats).toHaveBeenCalledWith(mockCurrentUser.companyId);
      expect(result).toBe(mockStats);
      expect(result.total).toBe(5);
      expect(result.active).toBe(2);
      expect(result.byStatus[CampaignStatus.ACTIVE]).toBe(2);
    });

    it('should handle zero campaigns', async () => {
      const zeroStats = {
        total: 0,
        active: 0,
        byStatus: {
          [CampaignStatus.DRAFT]: 0,
          [CampaignStatus.ACTIVE]: 0,
          [CampaignStatus.PAUSED]: 0,
          [CampaignStatus.COMPLETED]: 0,
          [CampaignStatus.ARCHIVED]: 0,
        },
      };
      campaignService.getStats.mockResolvedValue(zeroStats);

      const result = await controller.getStats(mockCurrentUser);

      expect(campaignService.getStats).toHaveBeenCalledWith(mockCurrentUser.companyId);
      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
    });
  });

  describe('findByStatus', () => {
    it('should return campaigns by status', async () => {
      const campaigns = [mockActiveCampaign];
      campaignService.findByStatus.mockResolvedValue(campaigns);

      const result = await controller.findByStatus(CampaignStatus.ACTIVE, mockCurrentUser);

      expect(campaignService.findByStatus).toHaveBeenCalledWith(CampaignStatus.ACTIVE, mockCurrentUser.companyId);
      expect(result).toBe(campaigns);
      expect(result).toHaveLength(1);
    });

    it('should handle empty results for status', async () => {
      campaignService.findByStatus.mockResolvedValue([]);

      const result = await controller.findByStatus(CampaignStatus.COMPLETED, mockCurrentUser);

      expect(campaignService.findByStatus).toHaveBeenCalledWith(CampaignStatus.COMPLETED, mockCurrentUser.companyId);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    const campaignId = 'campaign-123';

    it('should return a campaign by ID', async () => {
      campaignService.findOne.mockResolvedValue(mockCampaignEntity);

      const result = await controller.findOne(campaignId, mockCurrentUser);

      expect(campaignService.findOne).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
      expect(result).toBe(mockCampaignEntity);
    });

    it('should handle campaign not found', async () => {
      const error = new NotFoundException('Campaign not found');
      campaignService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(campaignId, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(campaignService.findOne).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });
  });

  describe('update', () => {
    const campaignId = 'campaign-123';
    const updateCampaignDto: UpdateCampaignDto = {
      name: 'Updated Campaign',
      status: CampaignStatus.ACTIVE,
    };

    it('should update a campaign successfully', async () => {
      const updatedCampaign = new CampaignEntity(
        campaignId,
        'Updated Campaign',
        'Test Description',
        CampaignStatus.ACTIVE,
        null,
        null,
        'company-123',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );
      campaignService.update.mockResolvedValue(updatedCampaign);

      const result = await controller.update(campaignId, updateCampaignDto, mockCurrentUser);

      expect(campaignService.update).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId, updateCampaignDto);
      expect(result).toBe(updatedCampaign);
      expect(result.name).toBe('Updated Campaign');
      expect(result.status).toBe(CampaignStatus.ACTIVE);
    });

    it('should handle invalid status transition', async () => {
      const error = new BadRequestException('Invalid status transition');
      campaignService.update.mockRejectedValue(error);

      await expect(controller.update(campaignId, updateCampaignDto, mockCurrentUser)).rejects.toThrow(BadRequestException);
      expect(campaignService.update).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId, updateCampaignDto);
    });

    it('should handle campaign not found during update', async () => {
      const error = new NotFoundException('Campaign not found');
      campaignService.update.mockRejectedValue(error);

      await expect(controller.update(campaignId, updateCampaignDto, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(campaignService.update).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId, updateCampaignDto);
    });
  });

  describe('activate', () => {
    const campaignId = 'campaign-123';

    it('should activate a campaign successfully', async () => {
      const activatedCampaign = new CampaignEntity(
        campaignId,
        'Test Campaign',
        'Test Description',
        CampaignStatus.ACTIVE,
        null,
        null,
        'company-123',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );
      campaignService.activate.mockResolvedValue(activatedCampaign);

      const result = await controller.activate(campaignId, mockCurrentUser);

      expect(campaignService.activate).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
      expect(result).toBe(activatedCampaign);
      expect(result.status).toBe(CampaignStatus.ACTIVE);
    });

    it('should handle campaign cannot be activated', async () => {
      const error = new BadRequestException('Campaign cannot be activated');
      campaignService.activate.mockRejectedValue(error);

      await expect(controller.activate(campaignId, mockCurrentUser)).rejects.toThrow(BadRequestException);
      expect(campaignService.activate).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });

    it('should handle campaign not found during activation', async () => {
      const error = new NotFoundException('Campaign not found');
      campaignService.activate.mockRejectedValue(error);

      await expect(controller.activate(campaignId, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(campaignService.activate).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });
  });

  describe('pause', () => {
    const campaignId = 'campaign-456';

    it('should pause a campaign successfully', async () => {
      const pausedCampaign = new CampaignEntity(
        campaignId,
        'Active Campaign',
        'Active Description',
        CampaignStatus.PAUSED,
        'ai-persona-123',
        'workflow-123',
        'company-123',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );
      campaignService.pause.mockResolvedValue(pausedCampaign);

      const result = await controller.pause(campaignId, mockCurrentUser);

      expect(campaignService.pause).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
      expect(result).toBe(pausedCampaign);
      expect(result.status).toBe(CampaignStatus.PAUSED);
    });

    it('should handle campaign cannot be paused', async () => {
      const error = new BadRequestException('Campaign cannot be paused');
      campaignService.pause.mockRejectedValue(error);

      await expect(controller.pause(campaignId, mockCurrentUser)).rejects.toThrow(BadRequestException);
      expect(campaignService.pause).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });

    it('should handle campaign not found during pause', async () => {
      const error = new NotFoundException('Campaign not found');
      campaignService.pause.mockRejectedValue(error);

      await expect(controller.pause(campaignId, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(campaignService.pause).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });
  });

  describe('complete', () => {
    const campaignId = 'campaign-456';

    it('should complete a campaign successfully', async () => {
      const completedCampaign = new CampaignEntity(
        campaignId,
        'Active Campaign',
        'Active Description',
        CampaignStatus.COMPLETED,
        'ai-persona-123',
        'workflow-123',
        'company-123',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );
      campaignService.complete.mockResolvedValue(completedCampaign);

      const result = await controller.complete(campaignId, mockCurrentUser);

      expect(campaignService.complete).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
      expect(result).toBe(completedCampaign);
      expect(result.status).toBe(CampaignStatus.COMPLETED);
    });

    it('should handle campaign cannot be completed', async () => {
      const error = new BadRequestException('Campaign cannot be completed');
      campaignService.complete.mockRejectedValue(error);

      await expect(controller.complete(campaignId, mockCurrentUser)).rejects.toThrow(BadRequestException);
      expect(campaignService.complete).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });

    it('should handle campaign not found during completion', async () => {
      const error = new NotFoundException('Campaign not found');
      campaignService.complete.mockRejectedValue(error);

      await expect(controller.complete(campaignId, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(campaignService.complete).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });
  });

  describe('archive', () => {
    const campaignId = 'campaign-123';

    it('should archive a campaign successfully', async () => {
      const archivedCampaign = new CampaignEntity(
        campaignId,
        'Test Campaign',
        'Test Description',
        CampaignStatus.ARCHIVED,
        null,
        null,
        'company-123',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );
      campaignService.archive.mockResolvedValue(archivedCampaign);

      const result = await controller.archive(campaignId, mockCurrentUser);

      expect(campaignService.archive).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
      expect(result).toBe(archivedCampaign);
      expect(result.status).toBe(CampaignStatus.ARCHIVED);
    });

    it('should handle campaign cannot be archived', async () => {
      const error = new BadRequestException('Campaign cannot be archived');
      campaignService.archive.mockRejectedValue(error);

      await expect(controller.archive(campaignId, mockCurrentUser)).rejects.toThrow(BadRequestException);
      expect(campaignService.archive).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });

    it('should handle campaign not found during archiving', async () => {
      const error = new NotFoundException('Campaign not found');
      campaignService.archive.mockRejectedValue(error);

      await expect(controller.archive(campaignId, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(campaignService.archive).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });
  });

  describe('remove', () => {
    const campaignId = 'campaign-123';

    it('should remove a campaign successfully', async () => {
      campaignService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(campaignId, mockCurrentUser);

      expect(campaignService.remove).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
      expect(result).toBeUndefined();
    });

    it('should handle campaign cannot be deleted', async () => {
      const error = new BadRequestException('Campaign cannot be deleted');
      campaignService.remove.mockRejectedValue(error);

      await expect(controller.remove(campaignId, mockCurrentUser)).rejects.toThrow(BadRequestException);
      expect(campaignService.remove).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });

    it('should handle campaign not found during deletion', async () => {
      const error = new NotFoundException('Campaign not found');
      campaignService.remove.mockRejectedValue(error);

      await expect(controller.remove(campaignId, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(campaignService.remove).toHaveBeenCalledWith(campaignId, mockCurrentUser.companyId);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle service throwing unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected database error');
      campaignService.create.mockRejectedValue(unexpectedError);

      await expect(controller.create({ name: 'Test' }, mockCurrentUser)).rejects.toThrow(Error);
    });

    it('should handle null/undefined responses gracefully', async () => {
      campaignService.findOne.mockResolvedValue(null as any);

      const result = await controller.findOne('campaign-123', mockCurrentUser);
      expect(result).toBeNull();
    });

    it('should handle empty string parameters', async () => {
      campaignService.findOne.mockResolvedValue(mockCampaignEntity);

      const result = await controller.findOne('', mockCurrentUser);
      expect(campaignService.findOne).toHaveBeenCalledWith('', mockCurrentUser.companyId);
      expect(result).toBe(mockCampaignEntity);
    });

    it('should handle special characters in campaign names', async () => {
      const specialCharDto: CreateCampaignDto = {
        name: 'Campaign with special chars: !@#$%^&*()',
        description: 'Description with emojis 🚀 📧',
      };
      campaignService.create.mockResolvedValue(mockCampaignEntity);

      const result = await controller.create(specialCharDto, mockCurrentUser);

      expect(campaignService.create).toHaveBeenCalledWith(specialCharDto, mockCurrentUser.companyId);
      expect(result).toBe(mockCampaignEntity);
    });
  });

  describe('authorization and security', () => {
    it('should always use companyId from current user', async () => {
      const differentUser: CurrentUser = {
        ...mockCurrentUser,
        companyId: 'different-company-456',
      };

      campaignService.findAll.mockResolvedValue({ data: [], nextCursor: null });

      await controller.findAll({}, differentUser);

      expect(campaignService.findAll).toHaveBeenCalledWith('different-company-456', {});
    });

    it('should not expose other company data', async () => {
      const otherCompanyCampaign = new CampaignEntity(
        'other-campaign',
        'Other Campaign',
        'Other Description',
        CampaignStatus.ACTIVE,
        null,
        null,
        'other-company-456',
        new Date(),
        new Date(),
      );

      campaignService.findOne.mockResolvedValue(otherCompanyCampaign);

      const result = await controller.findOne('other-campaign', mockCurrentUser);

      // The service should filter by companyId, so this should not return other company's data
      expect(campaignService.findOne).toHaveBeenCalledWith('other-campaign', mockCurrentUser.companyId);
      expect(result).toBe(otherCompanyCampaign);
    });
  });
}); 