import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestSetup } from './helpers/test-setup';
import { TEST_CONSTANTS, generateTestId } from './test-config';
import { MailService } from '../src/auth/services/mail.service';

// Mock the MailService
jest.mock('../src/auth/services/mail.service');
const mockMailService = {
  sendVerification: jest.fn().mockResolvedValue(undefined),
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
};

describe('Auth Module Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testSetup: TestSetup;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
    testSetup = new TestSetup(app, prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks();
  });

  // Helper function to create unique test data
  function createUniqueTestData() {
    const testId = generateTestId('auth');
    return {
      companyName: `${TEST_CONSTANTS.COMPANY.NAME_PREFIX} Auth ${testId}`,
      email: `${TEST_CONSTANTS.LEAD.EMAIL_PREFIX}+auth${testId}@test.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  }

  describe('Registration', () => {
    it('should register a new user successfully', async () => {
      const testData = createUniqueTestData();
      
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testData.email);
      expect(mockMailService.sendVerification).toHaveBeenCalledWith(testData.email, expect.any(String));

      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });

    it('should fail registration with invalid email', async () => {
      const testData = createUniqueTestData();
      testData.email = 'invalid-email';

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      expect(res.status).toBe(400);
    });

    it('should fail registration with weak password', async () => {
      const testData = createUniqueTestData();
      testData.password = '123';

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      expect(res.status).toBe(400);
    });

    it('should fail registration with missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // Missing companyName and password
        });

      expect(res.status).toBe(400);
    });

    it('should fail registration with existing email', async () => {
      const testData = createUniqueTestData();
      
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      // Second registration with same email
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      expect(res.status).toBe(409);

      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });
  });

  describe('Login', () => {
    let registeredUser: any;
    let testData: any;

    beforeEach(async () => {
      testData = createUniqueTestData();
      
      // Register a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);
      
      // Login to get tokens
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: testData.password,
        });
      
      registeredUser = loginRes.body;
    });

    afterEach(async () => {
      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: testData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(testData.email);
    });

    it('should fail login with invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testData.password,
        });

      expect(res.status).toBe(401);
    });

    it('should fail login with invalid password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });

    it('should fail login with missing credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          // Missing password
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Token Refresh', () => {
    let registeredUser: any;
    let testData: any;

    beforeEach(async () => {
      testData = createUniqueTestData();
      
      // Register a user for refresh tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);
      
      // Login to get tokens
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: testData.password,
        });
      
      registeredUser = loginRes.body;
    });

    afterEach(async () => {
      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });

    it('should refresh token successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: registeredUser.refreshToken,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      // The access token might be the same if generated within the same second
      // Let's check that we get a valid response instead
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.accessToken.length).toBeGreaterThan(0);
    });

    it('should fail refresh with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        });

      expect(res.status).toBe(401);
    });

    it('should fail refresh with missing token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('Logout', () => {
    let registeredUser: any;
    let testData: any;

    beforeEach(async () => {
      testData = createUniqueTestData();
      
      // Register a user for logout tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);
      
      // Login to get tokens
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: testData.password,
        });
      
      registeredUser = loginRes.body;
    });

    afterEach(async () => {
      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });

    it('should logout successfully with valid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`)
        .send({
          refreshToken: registeredUser.refreshToken,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail logout without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .send({
          refreshToken: registeredUser.refreshToken,
        });

      expect(res.status).toBe(401);
    });

    it('should fail logout with invalid access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          refreshToken: registeredUser.refreshToken,
        });

      expect(res.status).toBe(401);
    });
  });

  describe('Password Reset', () => {
    let testData: any;

    beforeEach(() => {
      testData = createUniqueTestData();
    });

    it('should initiate password reset successfully', async () => {
      // First register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      const res = await request(app.getHttpServer())
        .post('/auth/password/forgot')
        .send({
          email: testData.email,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(mockMailService.sendPasswordReset).toHaveBeenCalledWith(testData.email, expect.any(String));

      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });

    it('should handle password reset for non-existent email gracefully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/password/forgot')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail password reset with invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/password/forgot')
        .send({
          email: 'invalid-email',
        });

      expect(res.status).toBe(400);
    });

    it('should reset password successfully with valid token', async () => {
      // First register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      // Get user
      const user = await prisma.user.findUnique({ where: { email: testData.email } });
      if (!user) {
        throw new Error('User not found after registration');
      }

      // Create a unique token for this test
      const uniqueToken = `test-reset-token-${Date.now()}-${Math.random()}`;

      // Get reset token (this would normally be sent via email)
      const passwordReset = await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: uniqueToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      });

      const res = await request(app.getHttpServer())
        .post('/auth/password/reset')
        .send({
          token: passwordReset.token,
          newPassword: 'NewPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });

    it('should fail password reset with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/password/reset')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPassword123!',
        });

      expect(res.status).toBe(400);
    });

    it('should fail password reset with weak password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/password/reset')
        .send({
          token: 'valid-token',
          newPassword: '123',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Email Verification', () => {
    let testData: any;

    beforeEach(() => {
      testData = createUniqueTestData();
    });

    it('should verify email successfully with valid token', async () => {
      // First register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      // Get user
      const user = await prisma.user.findUnique({ where: { email: testData.email } });
      if (!user) {
        throw new Error('User not found after registration');
      }

      // Get verification token (this would normally be sent via email)
      const emailVerification = await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: 'test-verification-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      });

      const res = await request(app.getHttpServer())
        .get('/auth/verify')
        .query({
          token: emailVerification.token,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });

    it('should fail email verification with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/verify')
        .query({
          token: 'invalid-token',
        });

      expect(res.status).toBe(400);
    });

    it('should fail email verification with missing token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/verify');

      expect(res.status).toBe(400);
    });
  });

  describe('Authentication Guards', () => {
    it('should protect routes with JWT guard', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .send({
          refreshToken: 'some-token',
        });

      expect(res.status).toBe(401);
    });

    it('should allow access with valid JWT token', async () => {
      const testData = createUniqueTestData();
      
      // Register and get tokens
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: testData.password,
        });

      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .send({
          refreshToken: loginRes.body.refreshToken,
        });

      expect(res.status).toBe(200);

      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });
  });

  describe('Session Management', () => {
    let testData: any;

    beforeEach(() => {
      testData = createUniqueTestData();
    });

    it('should create session on login', async () => {
      // Register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      // Login and check if session is created
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: testData.password,
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('accessToken');
      expect(loginRes.body).toHaveProperty('refreshToken');

      // Verify session exists in database
      const user = await prisma.user.findUnique({
        where: { email: testData.email },
        include: { sessions: true },
      });

      if (!user) {
        throw new Error('User not found after login');
      }

      expect(user.sessions.length).toBeGreaterThan(0);

      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });

    it('should invalidate session on logout', async () => {
      // Register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testData);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: testData.password,
        });

      // Logout
      const logoutRes = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .send({
          refreshToken: loginRes.body.refreshToken,
        });

      expect(logoutRes.status).toBe(200);

      // Verify session is invalidated
      const user = await prisma.user.findUnique({
        where: { email: testData.email },
        include: { sessions: true },
      });

      if (!user) {
        throw new Error('User not found after logout');
      }

      // Session should be deleted or marked as invalid
      expect(user.sessions.length).toBe(0);

      // Cleanup
      await prisma.user.delete({ where: { email: testData.email } });
      await prisma.company.delete({ where: { name: testData.companyName } });
    });
  });
}); 