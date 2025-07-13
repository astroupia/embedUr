import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { CampaignStatus } from '../src/campaigns/constants/campaign.constants';
import { TestSetup } from './helpers/test-setup';
import { ValidationPipe } from '@nestjs/common';

describe('Campaign Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testSetup: TestSetup;

  // Increase timeout for integration tests
  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    testSetup = new TestSetup(app, prismaService);
  });

  afterAll(async () => {
    await testSetup.cleanupTestData();
    await app.close();
  });

  beforeEach(async () => {
    await testSetup.setupTestData();
  });

  afterEach(async () => {
    await testSetup.cleanupTestData();
  });

  describe('Campaign CRUD Operations', () => {
    it('should create, read, update, and delete a campaign', async () => {
      const testData = testSetup.getTestData();
      const authToken = testSetup.getAuthToken();

      // 1. Create campaign
      const createDto = {
        name: 'Integration Test Campaign',
        description: 'Campaign for integration testing',
        aiPersonaId: testData.aiPersonaId,
        workflowId: testData.workflowId,
      };

      const createResponse = await testSetup.makeAuthenticatedRequest('post', '/campaigns', createDto);
      expect(createResponse.status).toBe(201);

      const campaignId = createResponse.body.id;
      expect(createResponse.body.name).toBe(createDto.name);
      expect(createResponse.body.status).toBe(CampaignStatus.DRAFT);

      // 2. Read campaign
      const readResponse = await testSetup.makeAuthenticatedRequest('get', `/campaigns/${campaignId}`);
      expect(readResponse.status).toBe(200);

      expect(readResponse.body.id).toBe(campaignId);
      expect(readResponse.body.name).toBe(createDto.name);

      // 3. Update campaign
      const updateDto = {
        name: 'Updated Integration Test Campaign',
        description: 'Updated description',
      };

      const updateResponse = await testSetup.makeAuthenticatedRequest('patch', `/campaigns/${campaignId}`, updateDto);
      expect(updateResponse.status).toBe(200);

      expect(updateResponse.body.name).toBe(updateDto.name);
      expect(updateResponse.body.description).toBe(updateDto.description);

      // 4. Delete campaign
      const deleteResponse = await testSetup.makeAuthenticatedRequest('delete', `/campaigns/${campaignId}`);
      expect(deleteResponse.status).toBe(204);

      // 5. Verify deletion
      const verifyResponse = await testSetup.makeAuthenticatedRequest('get', `/campaigns/${campaignId}`);
      expect(verifyResponse.status).toBe(404);
    });
  });

  describe('Campaign Status Transitions', () => {
    it('should handle campaign status transitions correctly', async () => {
      const testData = testSetup.getTestData();
      const authToken = testSetup.getAuthToken();

      // Create campaign
      const campaign = await testSetup.createTestCampaign({
        name: 'Status Transition Test Campaign',
        status: CampaignStatus.DRAFT,
      });

      // 1. Activate campaign
      const activateResponse = await testSetup.makeAuthenticatedRequest('post', `/campaigns/${campaign.id}/activate`);
      expect(activateResponse.status).toBe(200);
      expect(activateResponse.body.status).toBe(CampaignStatus.ACTIVE);

      // 2. Pause campaign
      const pauseResponse = await testSetup.makeAuthenticatedRequest('post', `/campaigns/${campaign.id}/pause`);
      expect(pauseResponse.status).toBe(200);
      expect(pauseResponse.body.status).toBe(CampaignStatus.PAUSED);

      // 3. Activate again
      const reactivateResponse = await testSetup.makeAuthenticatedRequest('post', `/campaigns/${campaign.id}/activate`);
      expect(reactivateResponse.status).toBe(200);
      expect(reactivateResponse.body.status).toBe(CampaignStatus.ACTIVE);

      // 4. Complete campaign
      const completeResponse = await testSetup.makeAuthenticatedRequest('post', `/campaigns/${campaign.id}/complete`);
      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.status).toBe(CampaignStatus.COMPLETED);

      // 5. Archive campaign
      const archiveResponse = await testSetup.makeAuthenticatedRequest('post', `/campaigns/${campaign.id}/archive`);
      expect(archiveResponse.status).toBe(200);
      expect(archiveResponse.body.status).toBe(CampaignStatus.ARCHIVED);
    });

    it('should reject invalid status transitions', async () => {
      const testData = testSetup.getTestData();
      const authToken = testSetup.getAuthToken();

      // Create campaign in DRAFT status
      const campaign = await testSetup.createTestCampaign({
        name: 'Invalid Transition Test Campaign',
        status: CampaignStatus.DRAFT,
      });

      // Try to complete a draft campaign (should fail)
      const completeResponse = await testSetup.makeAuthenticatedRequest('post', `/campaigns/${campaign.id}/complete`);
      expect(completeResponse.status).toBe(400);

      // Try to pause a draft campaign (should fail)
      const pauseResponse = await testSetup.makeAuthenticatedRequest('post', `/campaigns/${campaign.id}/pause`);
      expect(pauseResponse.status).toBe(400);
    });
  });

  describe('Campaign List and Filtering', () => {
    it('should list campaigns with pagination and filtering', async () => {
      const testData = testSetup.getTestData();
      const authToken = testSetup.getAuthToken();

      // Create multiple campaigns with different statuses
      await testSetup.createTestCampaign({
        name: 'Draft Campaign 1',
        status: CampaignStatus.DRAFT,
      });

      await testSetup.createTestCampaign({
        name: 'Active Campaign 1',
        status: CampaignStatus.ACTIVE,
      });

      await testSetup.createTestCampaign({
        name: 'Draft Campaign 2',
        status: CampaignStatus.DRAFT,
      });

      // 1. Get all campaigns
      const allResponse = await testSetup.makeAuthenticatedRequest('get', '/campaigns?take=10');
      expect(allResponse.status).toBe(200);

      expect(allResponse.body.data).toBeDefined();
      expect(allResponse.body.data.length).toBeGreaterThanOrEqual(3);

      // 2. Filter by status
      const draftResponse = await testSetup.makeAuthenticatedRequest('get', `/campaigns?status=${CampaignStatus.DRAFT}`);
      expect(draftResponse.status).toBe(200);

      draftResponse.body.data.forEach((campaign: any) => {
        expect(campaign.status).toBe(CampaignStatus.DRAFT);
      });

      // 3. Search by name
      const searchResponse = await testSetup.makeAuthenticatedRequest('get', '/campaigns?search=Draft');
      expect(searchResponse.status).toBe(200);

      searchResponse.body.data.forEach((campaign: any) => {
        expect(campaign.name).toContain('Draft');
      });

      // 4. Get campaign statistics
      const statsResponse = await testSetup.makeAuthenticatedRequest('get', '/campaigns/stats');
      expect(statsResponse.status).toBe(200);

      expect(statsResponse.body).toHaveProperty('total');
      expect(statsResponse.body).toHaveProperty('active');
      expect(statsResponse.body).toHaveProperty('byStatus');
    });
  });

  describe('Campaign with Relations', () => {
    it('should handle campaigns with AI persona and workflow relations', async () => {
      const testData = testSetup.getTestData();
      const authToken = testSetup.getAuthToken();

      // Create campaign with relations
      const createDto = {
        name: 'Campaign with Relations',
        description: 'Testing AI persona and workflow relations',
        aiPersonaId: testData.aiPersonaId,
        workflowId: testData.workflowId,
      };

      const createResponse = await testSetup.makeAuthenticatedRequest('post', '/campaigns', createDto);
      expect(createResponse.status).toBe(201);

      const campaignId = createResponse.body.id;

      // Verify relations are included in response
      const readResponse = await testSetup.makeAuthenticatedRequest('get', `/campaigns/${campaignId}`);
      expect(readResponse.status).toBe(200);

      expect(readResponse.body.aiPersonaId).toBe(testData.aiPersonaId);
      expect(readResponse.body.workflowId).toBe(testData.workflowId);
      expect(readResponse.body.aiPersona).toBeDefined();
      expect(readResponse.body.workflow).toBeDefined();
    });

    it('should reject campaign with invalid AI persona ID', async () => {
      const authToken = testSetup.getAuthToken();

      const createDto = {
        name: 'Campaign with Invalid AI',
        aiPersonaId: 'invalid-ai-persona-id',
      };

      const response = await testSetup.makeAuthenticatedRequest('post', '/campaigns', createDto);
      expect(response.status).toBe(400);
    });

    it('should reject campaign with invalid workflow ID', async () => {
      const authToken = testSetup.getAuthToken();

      const createDto = {
        name: 'Campaign with Invalid Workflow',
        workflowId: 'invalid-workflow-id',
      };

      const response = await testSetup.makeAuthenticatedRequest('post', '/campaigns', createDto);
      expect(response.status).toBe(400);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without authentication', async () => {
      // Try to create campaign without auth
      const createResponse = await request(app.getHttpServer())
        .post('/campaigns')
        .send({ name: 'Unauthorized Campaign' });
      expect(createResponse.status).toBe(401);

      // Try to get campaigns without auth
      const getResponse = await request(app.getHttpServer())
        .get('/campaigns');
      expect(getResponse.status).toBe(401);

      // Try to get campaign stats without auth
      const statsResponse = await request(app.getHttpServer())
        .get('/campaigns/stats');
      expect(statsResponse.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/campaigns')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Invalid Token Campaign' });
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent campaign gracefully', async () => {
      const authToken = testSetup.getAuthToken();

      // Try to get non-existent campaign
      const getResponse = await testSetup.makeAuthenticatedRequest('get', '/campaigns/non-existent-id');
      expect(getResponse.status).toBe(404);

      // Try to update non-existent campaign
      const updateResponse = await testSetup.makeAuthenticatedRequest('patch', '/campaigns/non-existent-id', { name: 'Updated Name' });
      expect(updateResponse.status).toBe(404);

      // Try to delete non-existent campaign
      const deleteResponse = await testSetup.makeAuthenticatedRequest('delete', '/campaigns/non-existent-id');
      expect(deleteResponse.status).toBe(404);
    });

    it('should handle validation errors', async () => {
      const authToken = testSetup.getAuthToken();

      // Try to create campaign without required name
      const response = await testSetup.makeAuthenticatedRequest('post', '/campaigns', { description: 'Campaign without name' });
      expect(response.status).toBe(400);
    });
  });
}); 