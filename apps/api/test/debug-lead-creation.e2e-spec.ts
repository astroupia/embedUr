import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestSetup } from './helpers/test-setup';
import * as bcrypt from 'bcrypt';

describe('Debug Lead Creation', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testSetup: TestSetup;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
    testSetup = new TestSetup(app, prismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should debug lead creation step by step', async () => {
    // 1. Setup test data
    const testData = await testSetup.setupTestData();
    console.log('Test data setup complete:', {
      companyId: testData.companyId,
      campaignId: testData.campaignId,
      userId: testData.userId,
    });

    // 2. Verify campaign exists
    const campaign = await prismaService.campaign.findFirst({
      where: { id: testData.campaignId, companyId: testData.companyId },
    });
    console.log('Campaign found:', campaign ? 'YES' : 'NO');
    expect(campaign).toBeTruthy();

    // 3. Try to create lead directly via API
    const leadData = {
      fullName: 'Debug Test Lead',
      email: 'debug.test@example.com',
      campaignId: testData.campaignId,
    };

    console.log('Attempting to create lead with data:', leadData);

    const response = await request(app.getHttpServer())
      .post('/leads')
      .set('Authorization', `Bearer ${testData.authToken}`)
      .send(leadData);

    console.log('Lead creation response:', {
      status: response.status,
      body: response.body,
    });

    if (response.status !== 201) {
      console.error('Lead creation failed:', response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');

    // 4. Cleanup
    await testSetup.cleanupTestData();
  });
}); 