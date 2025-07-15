import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestSetup } from './helpers/test-setup';
import { TEST_CONSTANTS, generateTestId } from './test-config';

describe('Reply Webhook Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testSetup: TestSetup;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
    testSetup = new TestSetup(app, prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  // Helper function to create test data
  async function createTestData() {
    const testData = await testSetup.setupTestData();
    const { lead, emailLog } = await createUniqueLeadAndEmailLog(testData.companyId);
    return { testData, lead, emailLog };
  }

  // Helper function to create unique lead and email log
  async function createUniqueLeadAndEmailLog(companyId: string) {
    const lead = await prisma.lead.create({
      data: {
        fullName: `${TEST_CONSTANTS.LEAD.FULL_NAME_PREFIX} Webhook ${generateTestId('webhook')}`,
        email: `${TEST_CONSTANTS.LEAD.EMAIL_PREFIX}+webhook${generateTestId('webhook')}@test.com`,
        companyId,
        campaignId: (await prisma.campaign.create({ data: { name: 'Webhook Test', companyId } })).id,
      },
    });
    const emailLog = await prisma.emailLog.create({
      data: {
        status: 'SENT',
        sentAt: new Date(),
        leadId: lead.id,
        campaignId: lead.campaignId,
        companyId,
      },
    });
    return { lead, emailLog };
  }

  it('should handle Smartlead webhook', async () => {
    const { testData, lead, emailLog } = await createTestData();
    const payload = {
      leadId: lead.id,
      emailId: emailLog.id,
      replyContent: 'Test Smartlead reply',
      replySubject: 'Re: Test Email',
      replyFrom: 'test@example.com',
      replyTo: 'sender@example.com',
      timestamp: new Date().toISOString(),
      metadata: { source: 'smartlead' },
    };

    const res = await request(app.getHttpServer())
      .post('/webhooks/replies/smartlead')
      .set('x-smartlead-signature', 'test-signature')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Cleanup
    await prisma.reply.deleteMany({ where: { leadId: lead.id } });
    await prisma.emailLog.delete({ where: { id: emailLog.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should handle generic webhook', async () => {
    const { testData, lead, emailLog } = await createTestData();
    const payload = {
      leadId: lead.id,
      emailLogId: emailLog.id,
      content: 'Test generic webhook reply',
      metadata: { source: 'generic' },
    };

    const res = await request(app.getHttpServer())
      .post('/webhooks/replies/generic')
      .set('x-webhook-token', process.env.WEBHOOK_TOKEN || 'test-token')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Cleanup
    await prisma.reply.deleteMany({ where: { leadId: lead.id } });
    await prisma.emailLog.delete({ where: { id: emailLog.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should handle manual reply creation', async () => {
    const { testData, lead, emailLog } = await createTestData();
    const payload = {
      leadId: lead.id,
      emailLogId: emailLog.id,
      content: 'Test manual reply',
      companyId: testData.companyId,
      metadata: { createdManually: true },
    };

    const res = await request(app.getHttpServer())
      .post('/webhooks/replies/manual')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.replyId).toBeDefined();

    // Cleanup
    await prisma.reply.deleteMany({ where: { leadId: lead.id } });
    await prisma.emailLog.delete({ where: { id: emailLog.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should fail Smartlead webhook with missing required fields', async () => {
    const { testData, lead, emailLog } = await createTestData();
    const payload = {
      leadId: lead.id,
      // Missing emailId and replyContent
    };

    const res = await request(app.getHttpServer())
      .post('/webhooks/replies/smartlead')
      .set('x-smartlead-signature', 'test-signature')
      .send(payload);

    expect(res.status).toBe(400);

    // Cleanup
    await prisma.emailLog.delete({ where: { id: emailLog.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should fail generic webhook with missing required fields', async () => {
    const { testData, lead, emailLog } = await createTestData();
    const payload = {
      leadId: lead.id,
      // Missing emailLogId and content
    };

    const res = await request(app.getHttpServer())
      .post('/webhooks/replies/generic')
      .set('x-webhook-token', process.env.WEBHOOK_TOKEN || 'test-token')
      .send(payload);

    expect(res.status).toBe(400);

    // Cleanup
    await prisma.emailLog.delete({ where: { id: emailLog.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should fail manual reply with missing required fields', async () => {
    const { testData, lead, emailLog } = await createTestData();
    const payload = {
      leadId: lead.id,
      // Missing emailLogId, content, and companyId
    };

    const res = await request(app.getHttpServer())
      .post('/webhooks/replies/manual')
      .send(payload);

    expect(res.status).toBe(400);

    // Cleanup
    await prisma.emailLog.delete({ where: { id: emailLog.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });
}); 