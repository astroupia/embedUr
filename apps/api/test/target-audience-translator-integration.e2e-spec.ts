import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { InputFormat } from '../src/workflows/dto/target-audience-translator.dto';
import { TestSetup } from './helpers/test-setup';

describe('Target Audience Translator Integration (e2e)', () => {
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

  describe('Target Audience Translator CRUD Operations', () => {
    it('should create and process a free text target audience translation', async () => {
      const testData = testSetup.getTestData();

      const createDto = {
        inputFormat: InputFormat.FREE_TEXT,
        targetAudienceData: 'I want to target CTOs at B2B SaaS companies in Europe with 50-200 employees that are VC-backed.',
      };

      const createResponse = await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', createDto);
      expect(createResponse.status).toBe(201);

      const translationId = createResponse.body.id;
      expect(createResponse.body.inputFormat).toBe(InputFormat.FREE_TEXT);
      expect(createResponse.body.status).toBe('PENDING');
      expect(createResponse.body.targetAudienceData).toBe(createDto.targetAudienceData);

      // Wait for processing to complete (in a real scenario, this would be async)
      // For now, we'll just verify the creation worked
      const getResponse = await testSetup.makeAuthenticatedRequest('get', `/target-audience-translator/${translationId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.id).toBe(translationId);
    });

    it('should create and process a structured JSON target audience translation', async () => {
      const testData = testSetup.getTestData();

      const createDto = {
        inputFormat: InputFormat.STRUCTURED_JSON,
        targetAudienceData: JSON.stringify({
          jobTitles: ['CTO', 'VP Engineering', 'Head of Technology'],
          industries: ['B2B SaaS', 'Technology'],
          location: 'Europe',
          companySize: '50-200 employees',
          fundingStatus: 'VC-backed',
        }),
      };

      const createResponse = await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', createDto);
      expect(createResponse.status).toBe(201);

      const translationId = createResponse.body.id;
      expect(createResponse.body.inputFormat).toBe(InputFormat.STRUCTURED_JSON);
      expect(createResponse.body.status).toBe('PENDING');
    });

    it('should create and process a CSV target audience translation', async () => {
      const testData = testSetup.getTestData();

      const csvData = `jobTitle,industry,location,companySize
CTO,B2B SaaS,London,50-200
VP Engineering,Technology,Berlin,100-500
Head of Technology,E-commerce,Paris,25-100`;

      const createDto = {
        inputFormat: InputFormat.CSV_UPLOAD,
        targetAudienceData: csvData,
      };

      const createResponse = await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', createDto);
      expect(createResponse.status).toBe(201);

      const translationId = createResponse.body.id;
      expect(createResponse.body.inputFormat).toBe(InputFormat.CSV_UPLOAD);
      expect(createResponse.body.status).toBe('PENDING');
    });

    it('should list target audience translations with pagination', async () => {
      const testData = testSetup.getTestData();

      // Create multiple translations
      await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.FREE_TEXT,
        targetAudienceData: 'Target CTOs in tech companies',
      });

      await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.STRUCTURED_JSON,
        targetAudienceData: JSON.stringify({ jobTitles: ['CEO'], industries: ['Finance'] }),
      });

      // Get all translations
      const listResponse = await testSetup.makeAuthenticatedRequest('get', '/target-audience-translator?take=10');
      expect(listResponse.status).toBe(200);

      expect(listResponse.body.data).toBeDefined();
      expect(listResponse.body.data.length).toBeGreaterThanOrEqual(2);
      expect(listResponse.body.nextCursor).toBeDefined();
    });

    it('should get target audience translator statistics', async () => {
      const testData = testSetup.getTestData();

      // Create some translations
      await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.FREE_TEXT,
        targetAudienceData: 'Target CTOs in tech companies',
      });

      await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.STRUCTURED_JSON,
        targetAudienceData: JSON.stringify({ jobTitles: ['CEO'], industries: ['Finance'] }),
      });

      // Get statistics
      const statsResponse = await testSetup.makeAuthenticatedRequest('get', '/target-audience-translator/stats');
      expect(statsResponse.status).toBe(200);

      expect(statsResponse.body).toHaveProperty('total');
      expect(statsResponse.body).toHaveProperty('byStatus');
      expect(statsResponse.body).toHaveProperty('byInputFormat');
      expect(statsResponse.body).toHaveProperty('successful');
      expect(statsResponse.body).toHaveProperty('failed');
      expect(statsResponse.body).toHaveProperty('pending');
    });

    it('should filter target audience translations by status', async () => {
      const testData = testSetup.getTestData();

      // Create a translation
      const createResponse = await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.FREE_TEXT,
        targetAudienceData: 'Target CTOs in tech companies',
      });

      // Get by status
      const statusResponse = await testSetup.makeAuthenticatedRequest('get', '/target-audience-translator/status/PENDING');
      expect(statusResponse.status).toBe(200);

      statusResponse.body.forEach((translation: any) => {
        expect(translation.status).toBe('PENDING');
      });
    });

    it('should filter target audience translations by input format', async () => {
      const testData = testSetup.getTestData();

      // Create translations with different formats
      await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.FREE_TEXT,
        targetAudienceData: 'Target CTOs in tech companies',
      });

      await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.STRUCTURED_JSON,
        targetAudienceData: JSON.stringify({ jobTitles: ['CEO'], industries: ['Finance'] }),
      });

      // Get by format
      const formatResponse = await testSetup.makeAuthenticatedRequest('get', `/target-audience-translator/format/${InputFormat.FREE_TEXT}`);
      expect(formatResponse.status).toBe(200);

      formatResponse.body.forEach((translation: any) => {
        expect(translation.inputFormat).toBe(InputFormat.FREE_TEXT);
      });
    });
  });

  describe('Input Validation', () => {
    it('should reject empty target audience data', async () => {
      const response = await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.FREE_TEXT,
        targetAudienceData: '',
      });
      expect(response.status).toBe(400);
    });

    it('should reject invalid JSON for structured input', async () => {
      const response = await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.STRUCTURED_JSON,
        targetAudienceData: 'invalid json',
      });
      expect(response.status).toBe(400);
    });

    it('should reject CSV with insufficient data', async () => {
      const response = await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: InputFormat.CSV_UPLOAD,
        targetAudienceData: 'header only',
      });
      expect(response.status).toBe(400);
    });

    it('should reject unsupported input format', async () => {
      const response = await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator', {
        inputFormat: 'UNSUPPORTED_FORMAT',
        targetAudienceData: 'some data',
      });
      expect(response.status).toBe(400);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/target-audience-translator')
        .send({
          inputFormat: InputFormat.FREE_TEXT,
          targetAudienceData: 'Target CTOs in tech companies',
        });
      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/target-audience-translator')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          inputFormat: InputFormat.FREE_TEXT,
          targetAudienceData: 'Target CTOs in tech companies',
        });
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent translation gracefully', async () => {
      const response = await testSetup.makeAuthenticatedRequest('get', '/target-audience-translator/non-existent-id');
      expect(response.status).toBe(404);
    });

    it('should handle retry of non-existent translation', async () => {
      const response = await testSetup.makeAuthenticatedRequest('post', '/target-audience-translator/non-existent-id/retry');
      expect(response.status).toBe(404);
    });
  });
}); 