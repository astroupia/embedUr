import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestSetup } from './helpers/test-setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { InputFormat } from '../src/workflows/dto/target-audience-translator.dto';

describe('Target Audience Translator Audit Trail', () => {
  let app: INestApplication;
  let testSetup: TestSetup;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
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
  });

  afterEach(async () => {
    await testSetup.cleanupTestData();
  });

  describe('Audit Trail Logging', () => {
    it('should log audit trail entries for target audience translator events', async () => {
      const testData = testSetup.getTestData();

      // Create a target audience translator
      const createResponse = await request(app.getHttpServer())
        .post('/target-audience-translator')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send({
          inputFormat: InputFormat.FREE_TEXT,
          targetAudienceData: 'Test input text for translation - targeting CTOs at B2B SaaS companies in Europe with 50-200 employees',
        })
        .expect(201);

      const translationId = createResponse.body.id;

      // Check that audit trail entries were created
      const auditLogs = await prismaService.adminActionLog.findMany({
        where: {
          targetType: 'TargetAudienceTranslator',
          targetId: translationId,
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      
      // Check for creation log
      const creationLog = auditLogs.find(log => 
        log.action === 'TARGET_AUDIENCE_TRANSLATOR_CREATED'
      );
      expect(creationLog).toBeDefined();
      if (creationLog) {
        expect(creationLog.targetId).toBe(translationId);
        expect(creationLog.performedBy).toBe(testData.userId);
      }

      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for completion log
      const updatedAuditLogs = await prismaService.adminActionLog.findMany({
        where: {
          targetType: 'TargetAudienceTranslator',
          targetId: translationId,
        },
        orderBy: { timestamp: 'desc' },
      });

      const completionLog = updatedAuditLogs.find(log => 
        log.action === 'TARGET_AUDIENCE_TRANSLATOR_COMPLETED'
      );
      expect(completionLog).toBeDefined();
      if (completionLog) {
        expect(completionLog.targetId).toBe(translationId);
      }
    });

    it('should log audit trail entries with proper details', async () => {
      const testData = testSetup.getTestData();

      // Create a target audience translator
      const createResponse = await request(app.getHttpServer())
        .post('/target-audience-translator')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send({
          inputFormat: InputFormat.FREE_TEXT,
          targetAudienceData: 'Test input text for translation - targeting CTOs at B2B SaaS companies in Europe with 50-200 employees',
        })
        .expect(201);

      const translationId = createResponse.body.id;

      // Check audit trail details
      const auditLog = await prismaService.adminActionLog.findFirst({
        where: {
          targetType: 'TargetAudienceTranslator',
          targetId: translationId,
          action: 'TARGET_AUDIENCE_TRANSLATOR_CREATED',
        },
      });

      expect(auditLog).toBeDefined();
      if (auditLog && auditLog.details) {
        const details = auditLog.details as any;
        expect(details.companyId).toBe(testData.companyId);
        expect(details.changes).toBeDefined();
        expect(details.timestamp).toBeDefined();
      }
    });
  });
}); 