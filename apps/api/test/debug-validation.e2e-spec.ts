import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestSetup } from './helpers/test-setup';
import * as request from 'supertest';
import { MetricName } from '../src/usage-metrics/entities/usage-metric.entity';

describe('Debug Validation', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testSetup: TestSetup;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply validation pipe to test environment
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
    testSetup = new TestSetup(app, prismaService);
  });

  afterAll(async () => {
    await testSetup.cleanupTestData();
    await app.close();
  });

  beforeEach(async () => {
    await testSetup.setupTestData();
    
    // Make the test user an admin
    const testData = testSetup.getTestData();
    await prismaService.user.update({
      where: { id: testData.userId },
      data: { role: 'ADMIN' },
    });
    
    // Refresh the auth token
    await testSetup.refreshAuthToken();
  });

  afterEach(async () => {
    await testSetup.cleanupTestData();
  });

  it('should validate enum values', async () => {
    const testData = testSetup.getTestData();
    
    const response = await testSetup.makeAuthenticatedRequest(
      'post',
      '/usage-metrics',
      {
        metricName: 'INVALID_METRIC',
        companyId: testData.companyId,
      }
    );

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    
    expect(response.status).toBe(400);
  });

  it('should validate required fields', async () => {
    const response = await testSetup.makeAuthenticatedRequest(
      'post',
      '/usage-metrics',
      {}
    );

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    
    expect(response.status).toBe(400);
  });

  it('should validate company access', async () => {
    const testData = testSetup.getTestData();
    
    const response = await testSetup.makeAuthenticatedRequest(
      'post',
      '/usage-metrics',
      {
        metricName: MetricName.LEADS_CREATED,
        companyId: 'other-company-id',
      }
    );

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    
    expect(response.status).toBe(400);
  });
}); 