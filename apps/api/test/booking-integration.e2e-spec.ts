import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestSetup } from './helpers/test-setup';
import { TEST_CONSTANTS, generateTestId } from './test-config';

describe('Booking Module Integration', () => {
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
    const reply = await prisma.reply.create({
      data: {
        content: 'Test reply for booking',
        classification: 'INTERESTED',
        leadId: lead.id,
        emailLogId: emailLog.id,
        companyId: testData.companyId,
        source: 'MANUAL',
      },
    });
    return { testData, lead, emailLog, reply };
  }

  // Helper function to create unique lead and email log
  async function createUniqueLeadAndEmailLog(companyId: string) {
    const lead = await prisma.lead.create({
      data: {
        fullName: `${TEST_CONSTANTS.LEAD.FULL_NAME_PREFIX} ${generateTestId('booking')}`,
        email: `${TEST_CONSTANTS.LEAD.EMAIL_PREFIX}+${generateTestId('booking')}@test.com`,
        companyId,
        campaignId: (await prisma.campaign.create({ data: { name: 'Test', companyId } })).id,
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

  it('should create a booking', async () => {
    const { testData, lead, reply } = await createTestData();
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const res = await testSetup.makeAuthenticatedRequest('post', '/bookings', {
      calendlyLink: 'https://calendly.com/test/meeting',
      scheduledTime: scheduledTime.toISOString(),
      leadId: lead.id,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.calendlyLink).toBe('https://calendly.com/test/meeting');
    
    // Cleanup
    await prisma.booking.delete({ where: { id: res.body.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get all bookings', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', '/bookings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get booking by ID', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', `/bookings/${booking.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(booking.id);
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should update a booking', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('put', `/bookings/${booking.id}`, {
      status: 'RESCHEDULED'
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('RESCHEDULED');
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get bookings by lead', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', `/bookings/lead/${lead.id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].leadId).toBe(lead.id);
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get bookings by reply', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', `/bookings/reply/${reply.id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Since bookings don't have replyId field, we expect 0 results
    expect(res.body.length).toBe(0);
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get bookings by status', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
        status: 'RESCHEDULED',
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', '/bookings/status/RESCHEDULED');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(b => b.id === booking.id)).toBe(true);
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get upcoming bookings', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', '/bookings/upcoming?limit=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get today\'s bookings', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', '/bookings/today');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get overdue bookings', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', '/bookings/overdue');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get booking statistics', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', '/bookings/stats/overview');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('byStatus');
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should reschedule a booking', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const newScheduledTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // Day after tomorrow
    const res = await testSetup.makeAuthenticatedRequest('put', `/bookings/${booking.id}/reschedule`, {
      calendlyLink: 'https://calendly.com/test/rescheduled',
      scheduledTime: newScheduledTime.toISOString(),
      reason: 'Conflict with another meeting',
    });
    expect(res.status).toBe(200);
    expect(res.body.calendlyLink).toBe('https://calendly.com/test/rescheduled');
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should cancel a booking', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('put', `/bookings/${booking.id}/cancel`, {
      reason: 'Client requested cancellation'
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CANCELLED');
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should mark a booking as completed', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/completed',
        scheduledTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('put', `/bookings/${booking.id}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get booking priority', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', `/bookings/${booking.id}/priority`);
    expect(res.status).toBe(200);
    expect(['high', 'medium', 'low']).toContain(res.body.priority);
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should get dashboard data', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('get', '/bookings/dashboard/data');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('upcoming');
    expect(res.body).toHaveProperty('today');
    expect(res.body).toHaveProperty('overdue');
    expect(res.body).toHaveProperty('stats');
    
    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should delete a booking', async () => {
    const { testData, lead, reply } = await createTestData();
    const booking = await prisma.booking.create({
      data: {
        calendlyLink: 'https://calendly.com/test/meeting',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        leadId: lead.id,
        companyId: testData.companyId,
      },
    });
    
    const res = await testSetup.makeAuthenticatedRequest('delete', `/bookings/${booking.id}`);
    expect(res.status).toBe(204);
    
    // Cleanup
    await prisma.reply.delete({ where: { id: reply.id } });
    await prisma.emailLog.delete({ where: { id: reply.emailLogId } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should fail to create a booking with invalid data', async () => {
    const { testData, lead } = await createTestData();
    
    const res = await testSetup.makeAuthenticatedRequest('post', '/bookings', {
      calendlyLink: 'not-a-valid-url',
      scheduledTime: 'invalid-date',
      leadId: lead.id,
    });
    expect(res.status).toBe(400);
    
    // Cleanup
    await prisma.lead.delete({ where: { id: lead.id } });
    await testSetup.cleanupTestData();
  });

  it('should fail to access bookings without auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/bookings');
    expect(res.status).toBe(401);
  });
}); 