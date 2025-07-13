// Mock dependencies to avoid import errors
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CampaignRepository } from './campaign.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { QueryCampaignsCursorDto } from '../dto/query-campaigns-cursor.dto';
import { CampaignEntity } from '../entities/campaign.entity';
import { CampaignStatus } from '../constants/campaign.constants';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('CampaignRepository', () => {
  let repository: CampaignRepository;
  let prismaService: any;

  const mockCompanyId = 'company-123';
  const mockCampaignId = 'campaign-123';
  const mockAiPersonaId = 'ai-persona-123';
  const mockWorkflowId = 'workflow-123';

  const mockPrismaCampaign = {
    id: mockCampaignId,
    name: 'Test Campaign',
    description: 'Test Description',
    status: CampaignStatus.DRAFT,
    aiPersonaId: mockAiPersonaId,
    workflowId: mockWorkflowId,
    companyId: mockCompanyId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPrismaCampaignWithRelations = {
    ...mockPrismaCampaign,
    aiPersona: {
      id: mockAiPersonaId,
      name: 'Test AI Persona',
      description: 'AI Persona Description',
    },
    workflow: {
      id: mockWorkflowId,
      name: 'Test Workflow',
      type: 'LEAD_ROUTING',
    },
    _count: {
      leads: 5,
    },
  };

  const mockCampaignEntity = new CampaignEntity(
    mockCampaignId,
    'Test Campaign',
    'Test Description',
    CampaignStatus.DRAFT,
    mockAiPersonaId,
    mockWorkflowId,
    mockCompanyId,
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    {
      id: mockAiPersonaId,
      name: 'Test AI Persona',
      description: 'AI Persona Description',
    },
    {
      id: mockWorkflowId,
      name: 'Test Workflow',
      type: 'LEAD_ROUTING',
    },
    5,
  );

  beforeEach(async () => {
    const mockPrismaService = {
      campaign: {
        create: jest.fn() as jest.MockedFunction<any>,
        findMany: jest.fn() as jest.MockedFunction<any>,
        findFirst: jest.fn() as jest.MockedFunction<any>,
        update: jest.fn() as jest.MockedFunction<any>,
        delete: jest.fn() as jest.MockedFunction<any>,
        count: jest.fn() as jest.MockedFunction<any>,
      },
      aIPersona: {
        findFirst: jest.fn() as jest.MockedFunction<any>,
      },
      workflow: {
        findFirst: jest.fn() as jest.MockedFunction<any>,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<CampaignRepository>(CampaignRepository);
    prismaService = module.get(PrismaService);
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
      const expectedCampaign = {
        ...mockPrismaCampaignWithRelations,
        name: createCampaignDto.name,
        description: createCampaignDto.description,
      };
      
      prismaService.aIPersona.findFirst.mockResolvedValue({ id: mockAiPersonaId, companyId: mockCompanyId } as any);
      prismaService.workflow.findFirst.mockResolvedValue({ id: mockWorkflowId, companyId: mockCompanyId } as any);
      prismaService.campaign.create.mockResolvedValue(expectedCampaign);

      const result = await repository.create(createCampaignDto, mockCompanyId);

      expect(prismaService.aIPersona.findFirst).toHaveBeenCalledWith({
        where: { id: mockAiPersonaId, companyId: mockCompanyId },
      });
      expect(prismaService.workflow.findFirst).toHaveBeenCalledWith({
        where: { id: mockWorkflowId, companyId: mockCompanyId },
      });
      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: {
          name: createCampaignDto.name,
          description: createCampaignDto.description,
          status: CampaignStatus.DRAFT,
          aiPersonaId: createCampaignDto.aiPersonaId,
          workflowId: createCampaignDto.workflowId,
          companyId: mockCompanyId,
        },
      });
      expect(result).toBeInstanceOf(CampaignEntity);
      expect(result.name).toBe(createCampaignDto.name);
    });

    it('should create a campaign without AI persona and workflow', async () => {
      const dtoWithoutRelations = { name: 'New Campaign', description: 'New Description' };
      prismaService.campaign.create.mockResolvedValue(mockPrismaCampaign);

      const result = await repository.create(dtoWithoutRelations, mockCompanyId);

      expect(prismaService.aIPersona.findFirst).not.toHaveBeenCalled();
      expect(prismaService.workflow.findFirst).not.toHaveBeenCalled();
      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: {
          name: dtoWithoutRelations.name,
          description: dtoWithoutRelations.description,
          status: CampaignStatus.DRAFT,
          aiPersonaId: undefined,
          workflowId: undefined,
          companyId: mockCompanyId,
        },
      });
      expect(result).toBeInstanceOf(CampaignEntity);
    });

    it('should throw ConflictException for duplicate campaign name', async () => {
      const error = new Error('Unique constraint failed');
      (error as any).code = 'P2002';
      
      prismaService.aIPersona.findFirst.mockResolvedValue({ id: mockAiPersonaId, companyId: mockCompanyId } as any);
      prismaService.workflow.findFirst.mockResolvedValue({ id: mockWorkflowId, companyId: mockCompanyId } as any);
      prismaService.campaign.create.mockRejectedValue(error);

      await expect(repository.create(createCampaignDto, mockCompanyId)).rejects.toThrow(ConflictException);
      expect(prismaService.campaign.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid AI persona ownership', async () => {
      prismaService.aIPersona.findFirst.mockResolvedValue(null);

      await expect(repository.create(createCampaignDto, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(prismaService.aIPersona.findFirst).toHaveBeenCalledWith({
        where: { id: mockAiPersonaId, companyId: mockCompanyId },
      });
      expect(prismaService.campaign.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid workflow ownership', async () => {
      prismaService.aIPersona.findFirst.mockResolvedValue({ id: mockAiPersonaId, companyId: mockCompanyId } as any);
      prismaService.workflow.findFirst.mockResolvedValue(null);

      await expect(repository.create(createCampaignDto, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(prismaService.workflow.findFirst).toHaveBeenCalledWith({
        where: { id: mockWorkflowId, companyId: mockCompanyId },
      });
      expect(prismaService.campaign.create).not.toHaveBeenCalled();
    });

    it('should rethrow other database errors', async () => {
      const error = new Error('Database connection failed');
      prismaService.aIPersona.findFirst.mockResolvedValue({ id: mockAiPersonaId, companyId: mockCompanyId } as any);
      prismaService.workflow.findFirst.mockResolvedValue({ id: mockWorkflowId, companyId: mockCompanyId } as any);
      prismaService.campaign.create.mockRejectedValue(error);

      await expect(repository.create(createCampaignDto, mockCompanyId)).rejects.toThrow(Error);
      expect(prismaService.campaign.create).toHaveBeenCalled();
    });
  });

  describe('findWithCursor', () => {
    const queryDto: QueryCampaignsCursorDto = {
      cursor: 'cursor-123',
      take: 10,
    };

    it('should return campaigns with pagination', async () => {
      const mockCampaigns = [mockPrismaCampaignWithRelations, mockPrismaCampaignWithRelations];
      prismaService.campaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await repository.findWithCursor(mockCompanyId, queryDto);

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        orderBy: { createdAt: 'desc' },
        take: 11,
        cursor: { id: queryDto.cursor },
        skip: 1,
        include: {
          aiPersona: true,
          workflow: true,
          _count: {
            select: { leads: true },
          },
        },
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(CampaignEntity);
    });

    it('should handle empty results', async () => {
      prismaService.campaign.findMany.mockResolvedValue([]);

      const result = await repository.findWithCursor(mockCompanyId, queryDto);

      expect(prismaService.campaign.findMany).toHaveBeenCalled();
      expect(result.data).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });

    it('should filter by status', async () => {
      const queryWithStatus = { ...queryDto, status: CampaignStatus.ACTIVE };
      prismaService.campaign.findMany.mockResolvedValue([]);

      await repository.findWithCursor(mockCompanyId, queryWithStatus);

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId, status: CampaignStatus.ACTIVE },
        orderBy: { createdAt: 'desc' },
        take: 11,
        cursor: { id: queryDto.cursor },
        skip: 1,
        include: {
          aiPersona: true,
          workflow: true,
          _count: {
            select: { leads: true },
          },
        },
      });
    });

    it('should filter by search term', async () => {
      const queryWithSearch = { ...queryDto, search: 'test' };
      prismaService.campaign.findMany.mockResolvedValue([]);

      await repository.findWithCursor(mockCompanyId, queryWithSearch);

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        where: { 
          companyId: mockCompanyId, 
          name: { contains: 'test', mode: 'insensitive' } 
        },
        orderBy: { createdAt: 'desc' },
        take: 11,
        cursor: { id: queryDto.cursor },
        skip: 1,
        include: {
          aiPersona: true,
          workflow: true,
          _count: {
            select: { leads: true },
          },
        },
      });
    });

    it('should handle pagination correctly', async () => {
      const manyCampaigns = Array(11).fill(mockPrismaCampaignWithRelations);
      prismaService.campaign.findMany.mockResolvedValue(manyCampaigns);

      const result = await repository.findWithCursor(mockCompanyId, queryDto);

      expect(result.data).toHaveLength(10);
      expect(result.nextCursor).toBe(manyCampaigns[9].id);
    });
  });

  describe('findOne', () => {
    it('should return a campaign by ID', async () => {
      prismaService.campaign.findFirst.mockResolvedValue(mockPrismaCampaignWithRelations);

      const result = await repository.findOne(mockCampaignId, mockCompanyId);

      expect(prismaService.campaign.findFirst).toHaveBeenCalledWith({
        where: { id: mockCampaignId, companyId: mockCompanyId },
        include: {
          aiPersona: true,
          workflow: true,
          _count: {
            select: { leads: true },
          },
        },
      });
      expect(result).toBeInstanceOf(CampaignEntity);
      expect(result.id).toBe(mockCampaignId);
    });

    it('should throw NotFoundException when campaign not found', async () => {
      prismaService.campaign.findFirst.mockResolvedValue(null);

      await expect(repository.findOne(mockCampaignId, mockCompanyId)).rejects.toThrow(NotFoundException);
      expect(prismaService.campaign.findFirst).toHaveBeenCalledWith({
        where: { id: mockCampaignId, companyId: mockCompanyId },
        include: {
          aiPersona: true,
          workflow: true,
          _count: {
            select: { leads: true },
          },
        },
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      prismaService.campaign.findFirst.mockRejectedValue(error);

      await expect(repository.findOne(mockCampaignId, mockCompanyId)).rejects.toThrow(Error);
      expect(prismaService.campaign.findFirst).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateCampaignDto: UpdateCampaignDto = {
      name: 'Updated Campaign',
      status: CampaignStatus.ACTIVE,
    };

    it('should update a campaign successfully', async () => {
      prismaService.campaign.findFirst.mockResolvedValue(mockPrismaCampaignWithRelations);
      prismaService.campaign.update.mockResolvedValue(mockPrismaCampaignWithRelations);

      const result = await repository.update(mockCampaignId, mockCompanyId, updateCampaignDto);

      expect(prismaService.campaign.findFirst).toHaveBeenCalledWith({
        where: { id: mockCampaignId, companyId: mockCompanyId },
        include: {
          aiPersona: true,
          workflow: true,
          _count: {
            select: { leads: true },
          },
        },
      });
      expect(prismaService.campaign.update).toHaveBeenCalledWith({
        where: { id: mockCampaignId },
        data: {
          name: updateCampaignDto.name,
          status: updateCampaignDto.status,
        },
        include: {
          aiPersona: true,
          workflow: true,
          _count: {
            select: { leads: true },
          },
        },
      });
      expect(result).toBeInstanceOf(CampaignEntity);
    });

    it('should throw BadRequestException when campaign is not editable', async () => {
      const archivedCampaign = {
        ...mockPrismaCampaignWithRelations,
        status: CampaignStatus.ARCHIVED,
      };
      prismaService.campaign.findFirst.mockResolvedValue(archivedCampaign);

      await expect(repository.update(mockCampaignId, mockCompanyId, updateCampaignDto)).rejects.toThrow(BadRequestException);
      expect(prismaService.campaign.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const draftCampaign = {
        ...mockPrismaCampaignWithRelations,
        status: CampaignStatus.DRAFT,
      };
      const invalidUpdate = { status: CampaignStatus.COMPLETED };
      prismaService.campaign.findFirst.mockResolvedValue(draftCampaign);

      await expect(repository.update(mockCampaignId, mockCompanyId, invalidUpdate)).rejects.toThrow(BadRequestException);
      expect(prismaService.campaign.update).not.toHaveBeenCalled();
    });

    it('should validate AI persona ownership when updating', async () => {
      const updateWithAi = { ...updateCampaignDto, aiPersonaId: 'new-ai-persona' };
      prismaService.campaign.findFirst.mockResolvedValue(mockPrismaCampaignWithRelations);
      prismaService.aIPersona.findFirst.mockResolvedValue(null);

      await expect(repository.update(mockCampaignId, mockCompanyId, updateWithAi)).rejects.toThrow(BadRequestException);
      expect(prismaService.aIPersona.findFirst).toHaveBeenCalledWith({
        where: { id: 'new-ai-persona', companyId: mockCompanyId },
      });
      expect(prismaService.campaign.update).not.toHaveBeenCalled();
    });

    it('should validate workflow ownership when updating', async () => {
      const updateWithWorkflow = { ...updateCampaignDto, workflowId: 'new-workflow' };
      prismaService.campaign.findFirst.mockResolvedValue(mockPrismaCampaignWithRelations);
      prismaService.workflow.findFirst.mockResolvedValue(null);

      await expect(repository.update(mockCampaignId, mockCompanyId, updateWithWorkflow)).rejects.toThrow(BadRequestException);
      expect(prismaService.workflow.findFirst).toHaveBeenCalledWith({
        where: { id: 'new-workflow', companyId: mockCompanyId },
      });
      expect(prismaService.campaign.update).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('should archive a campaign successfully', async () => {
      const archivedCampaign = {
        ...mockPrismaCampaignWithRelations,
        status: CampaignStatus.ARCHIVED,
      };
      prismaService.campaign.findFirst.mockResolvedValue(mockPrismaCampaignWithRelations);
      prismaService.campaign.update.mockResolvedValue(archivedCampaign);

      const result = await repository.archive(mockCampaignId, mockCompanyId);

      expect(prismaService.campaign.update).toHaveBeenCalledWith({
        where: { id: mockCampaignId },
        data: { status: CampaignStatus.ARCHIVED },
        include: {
          aiPersona: true,
          workflow: true,
          _count: {
            select: { leads: true },
          },
        },
      });
      expect(result).toBeInstanceOf(CampaignEntity);
      expect(result.status).toBe(CampaignStatus.ARCHIVED);
    });

    it('should throw BadRequestException when campaign cannot be archived', async () => {
      const archivedCampaign = {
        ...mockPrismaCampaignWithRelations,
        status: CampaignStatus.ARCHIVED,
      };
      prismaService.campaign.findFirst.mockResolvedValue(archivedCampaign);

      await expect(repository.archive(mockCampaignId, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(prismaService.campaign.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a campaign successfully', async () => {
      const deletableCampaign = {
        ...mockPrismaCampaignWithRelations,
        status: CampaignStatus.DRAFT,
      };
      prismaService.campaign.findFirst.mockResolvedValue(deletableCampaign);
      prismaService.campaign.delete.mockResolvedValue({} as any);

      await repository.remove(mockCampaignId, mockCompanyId);

      expect(prismaService.campaign.delete).toHaveBeenCalledWith({
        where: { id: mockCampaignId },
      });
    });

    it('should throw BadRequestException when campaign cannot be deleted', async () => {
      const nonDeletableCampaign = {
        ...mockPrismaCampaignWithRelations,
        status: CampaignStatus.ACTIVE,
      };
      prismaService.campaign.findFirst.mockResolvedValue(nonDeletableCampaign);

      await expect(repository.remove(mockCampaignId, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(prismaService.campaign.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByStatus', () => {
    it('should return campaigns by status', async () => {
      const campaigns = [mockPrismaCampaignWithRelations];
      prismaService.campaign.findMany.mockResolvedValue(campaigns);

      const result = await repository.findByStatus(CampaignStatus.ACTIVE, mockCompanyId);

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        where: { status: CampaignStatus.ACTIVE, companyId: mockCompanyId },
        orderBy: { createdAt: 'desc' },
        include: {
          aiPersona: true,
          workflow: true,
          _count: {
            select: { leads: true },
          },
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(CampaignEntity);
    });

    it('should handle empty results', async () => {
      prismaService.campaign.findMany.mockResolvedValue([]);

      const result = await repository.findByStatus(CampaignStatus.COMPLETED, mockCompanyId);

      expect(prismaService.campaign.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });

  describe('countByCompany', () => {
    it('should return total campaign count for company', async () => {
      prismaService.campaign.count.mockResolvedValue(5);

      const result = await repository.countByCompany(mockCompanyId);

      expect(prismaService.campaign.count).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
      });
      expect(result).toBe(5);
    });
  });

  describe('countByStatus', () => {
    it('should return campaign count by status for company', async () => {
      prismaService.campaign.count.mockResolvedValue(3);

      const result = await repository.countByStatus(CampaignStatus.ACTIVE, mockCompanyId);

      expect(prismaService.campaign.count).toHaveBeenCalledWith({
        where: { status: CampaignStatus.ACTIVE, companyId: mockCompanyId },
      });
      expect(result).toBe(3);
    });
  });

  describe('countActiveByCompany', () => {
    it('should return active campaign count for company', async () => {
      prismaService.campaign.count.mockResolvedValue(2);

      const result = await repository.countActiveByCompany(mockCompanyId);

      expect(prismaService.campaign.count).toHaveBeenCalledWith({
        where: { 
          companyId: mockCompanyId,
          status: { in: [CampaignStatus.ACTIVE, CampaignStatus.PAUSED] },
        },
      });
      expect(result).toBe(2);
    });
  });

  describe('validateAIPersonaOwnership (private method)', () => {
    it('should validate AI persona ownership successfully', async () => {
      prismaService.aIPersona.findFirst.mockResolvedValue({ id: mockAiPersonaId, companyId: mockCompanyId } as any);

      // Test through create method
      const createDto = { name: 'Test', aiPersonaId: mockAiPersonaId };
      prismaService.campaign.create.mockResolvedValue(mockPrismaCampaign);

      await repository.create(createDto, mockCompanyId);

      expect(prismaService.aIPersona.findFirst).toHaveBeenCalledWith({
        where: { id: mockAiPersonaId, companyId: mockCompanyId },
      });
    });

    it('should throw BadRequestException for invalid AI persona ownership', async () => {
      prismaService.aIPersona.findFirst.mockResolvedValue(null);

      const createDto = { name: 'Test', aiPersonaId: mockAiPersonaId };

      await expect(repository.create(createDto, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(prismaService.aIPersona.findFirst).toHaveBeenCalledWith({
        where: { id: mockAiPersonaId, companyId: mockCompanyId },
      });
    });
  });

  describe('validateWorkflowOwnership (private method)', () => {
    it('should validate workflow ownership successfully', async () => {
      prismaService.workflow.findFirst.mockResolvedValue({ id: mockWorkflowId, companyId: mockCompanyId } as any);

      // Test through create method
      const createDto = { name: 'Test', workflowId: mockWorkflowId };
      prismaService.campaign.create.mockResolvedValue(mockPrismaCampaign);

      await repository.create(createDto, mockCompanyId);

      expect(prismaService.workflow.findFirst).toHaveBeenCalledWith({
        where: { id: mockWorkflowId, companyId: mockCompanyId },
      });
    });

    it('should throw BadRequestException for invalid workflow ownership', async () => {
      prismaService.workflow.findFirst.mockResolvedValue(null);

      const createDto = { name: 'Test', workflowId: mockWorkflowId };

      await expect(repository.create(createDto, mockCompanyId)).rejects.toThrow(BadRequestException);
      expect(prismaService.workflow.findFirst).toHaveBeenCalledWith({
        where: { id: mockWorkflowId, companyId: mockCompanyId },
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined values in DTOs', async () => {
      const dtoWithNulls: CreateCampaignDto = {
        name: 'Test Campaign',
        description: null as any,
        aiPersonaId: undefined as any,
        workflowId: null as any,
      };

      prismaService.campaign.create.mockResolvedValue(mockPrismaCampaign);

      const result = await repository.create(dtoWithNulls, mockCompanyId);

      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: {
          name: dtoWithNulls.name,
          description: null,
          status: CampaignStatus.DRAFT,
          aiPersonaId: undefined,
          workflowId: null,
          companyId: mockCompanyId,
        },
      });
      expect(result).toBeInstanceOf(CampaignEntity);
    });

    it('should handle empty string parameters', async () => {
      const dtoWithEmptyStrings: CreateCampaignDto = {
        name: 'Test Campaign',
        description: '',
        aiPersonaId: '',
        workflowId: '',
      };

      prismaService.campaign.create.mockResolvedValue(mockPrismaCampaign);

      const result = await repository.create(dtoWithEmptyStrings, mockCompanyId);

      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: {
          name: dtoWithEmptyStrings.name,
          description: '',
          status: CampaignStatus.DRAFT,
          aiPersonaId: '',
          workflowId: '',
          companyId: mockCompanyId,
        },
      });
      expect(result).toBeInstanceOf(CampaignEntity);
    });

    it('should handle special characters in campaign data', async () => {
      const dtoWithSpecialChars: CreateCampaignDto = {
        name: 'Campaign with special chars: !@#$%^&*()',
        description: 'Description with emojis 🚀 📧',
        aiPersonaId: 'ai-persona-123',
        workflowId: 'workflow-123',
      };

      prismaService.aIPersona.findFirst.mockResolvedValue({ id: mockAiPersonaId, companyId: mockCompanyId } as any);
      prismaService.workflow.findFirst.mockResolvedValue({ id: mockWorkflowId, companyId: mockCompanyId } as any);
      prismaService.campaign.create.mockResolvedValue(mockPrismaCampaign);

      const result = await repository.create(dtoWithSpecialChars, mockCompanyId);

      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: {
          name: dtoWithSpecialChars.name,
          description: dtoWithSpecialChars.description,
          status: CampaignStatus.DRAFT,
          aiPersonaId: dtoWithSpecialChars.aiPersonaId,
          workflowId: dtoWithSpecialChars.workflowId,
          companyId: mockCompanyId,
        },
      });
      expect(result).toBeInstanceOf(CampaignEntity);
    });

    it('should handle database connection errors', async () => {
      const error = new Error('Connection timeout');
      prismaService.campaign.findMany.mockRejectedValue(error);

      await expect(repository.findWithCursor(mockCompanyId, {})).rejects.toThrow(Error);
      expect(prismaService.campaign.findMany).toHaveBeenCalled();
    });
  });
}); 