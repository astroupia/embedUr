import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { LeadStatus } from '../src/leads/constants/lead.constants';
import { TestSetup } from './helpers/test-setup';

describe('Leads Integration (e2e)', () => {
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

  describe('Lead CRUD Operations', () => {
    it('should create, read, update, and delete a lead', async () => {
      const testData = testSetup.getTestData();

      // 1. Create lead
      const createDto = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        companyId: testData.companyId,
        campaignId: testData.campaignId,
      };

      const createResponse = await testSetup.makeAuthenticatedRequest('post', '/leads', createDto);
      expect(createResponse.status).toBe(201);

      const leadId = createResponse.body.id;
      expect(createResponse.body.fullName).toBe(createDto.fullName);
      expect(createResponse.body.email).toBe(createDto.email);
      expect(createResponse.body.status).toBe(LeadStatus.NEW);
      expect(createResponse.body.verified).toBe(false);

      // 2. Read lead
      const readResponse = await testSetup.makeAuthenticatedRequest('get', `/leads/${leadId}`);
      expect(readResponse.status).toBe(200);

      expect(readResponse.body.id).toBe(leadId);
      expect(readResponse.body.fullName).toBe(createDto.fullName);
      expect(readResponse.body.campaign).toBeDefined();

      // 3. Update lead
      const updateDto = {
        fullName: 'John Smith',
        status: LeadStatus.CONTACTED,
        verified: true,
      };

      const updateResponse = await testSetup.makeAuthenticatedRequest('patch', `/leads/${leadId}`, updateDto);
      expect(updateResponse.status).toBe(200);

      expect(updateResponse.body.fullName).toBe(updateDto.fullName);
      expect(updateResponse.body.status).toBe(updateDto.status);
      expect(updateResponse.body.verified).toBe(updateDto.verified);

      // 4. Delete lead
      const deleteResponse = await testSetup.makeAuthenticatedRequest('delete', `/leads/${leadId}`);
      expect(deleteResponse.status).toBe(204);

      // 5. Verify deletion
      const verifyResponse = await testSetup.makeAuthenticatedRequest('get', `/leads/${leadId}`);
      expect(verifyResponse.status).toBe(404);
    });

    it('should create lead with enrichment data', async () => {
      const testData = testSetup.getTestData();

      const createDto = {
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
        linkedinUrl: 'https://linkedin.com/in/janesmith',
        enrichmentData: {
          company: 'Tech Corp',
          title: 'Senior Developer',
          location: 'San Francisco, CA',
          industry: 'Technology',
          phone: '+1-555-0123',
        },
        companyId: testData.companyId,
        campaignId: testData.campaignId,
      };

      const response = await testSetup.makeAuthenticatedRequest('post', '/leads', createDto);
      expect(response.status).toBe(201);

      expect(response.body.enrichmentData).toEqual(createDto.enrichmentData);
      expect(response.body.hasEnrichmentData).toBe(true);
      expect(response.body.companyName).toBe('Tech Corp');
      expect(response.body.jobTitle).toBe('Senior Developer');
    });
  });

  describe('Lead Status Transitions', () => {
    it('should handle valid status transitions', async () => {
      const testData = testSetup.getTestData();

      // Create lead
      const lead = await testSetup.createTestLead({
        fullName: 'Status Test Lead',
        email: 'status.test@example.com',
        status: LeadStatus.NEW,
      });

      // 1. NEW -> CONTACTED
      const contactedResponse = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        status: LeadStatus.CONTACTED,
      });
      expect(contactedResponse.status).toBe(200);
      expect(contactedResponse.body.status).toBe(LeadStatus.CONTACTED);

      // 2. CONTACTED -> INTERESTED
      const interestedResponse = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        status: LeadStatus.INTERESTED,
      });
      expect(interestedResponse.status).toBe(200);
      expect(interestedResponse.body.status).toBe(LeadStatus.INTERESTED);

      // 3. INTERESTED -> BOOKED
      const bookedResponse = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        status: LeadStatus.BOOKED,
      });
      expect(bookedResponse.status).toBe(200);
      expect(bookedResponse.body.status).toBe(LeadStatus.BOOKED);

      // 4. BOOKED -> NOT_INTERESTED
      const notInterestedResponse = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        status: LeadStatus.NOT_INTERESTED,
      });
      expect(notInterestedResponse.status).toBe(200);
      expect(notInterestedResponse.body.status).toBe(LeadStatus.NOT_INTERESTED);

      // 5. NOT_INTERESTED -> DO_NOT_CONTACT
      const doNotContactResponse = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        status: LeadStatus.DO_NOT_CONTACT,
      });
      expect(doNotContactResponse.status).toBe(200);
      expect(doNotContactResponse.body.status).toBe(LeadStatus.DO_NOT_CONTACT);
    });

    it('should reject invalid status transitions', async () => {
      const testData = testSetup.getTestData();

      // Create lead in NEW status
      const lead = await testSetup.createTestLead({
        fullName: 'Invalid Transition Lead',
        email: 'invalid.transition@example.com',
        status: LeadStatus.NEW,
      });

      // Try to transition NEW -> BOOKED (should fail)
      const invalidResponse = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        status: LeadStatus.BOOKED,
      });
      expect(invalidResponse.status).toBe(400);

      // Try to transition NEW -> INTERESTED (should fail)
      const invalidResponse2 = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        status: LeadStatus.INTERESTED,
      });
      expect(invalidResponse2.status).toBe(400);
    });

    it('should calculate lead score correctly', async () => {
      const testData = testSetup.getTestData();

      // Create lead with minimal data
      const lead = await testSetup.createTestLead({
        fullName: 'Score Test Lead',
        email: 'score.test@example.com',
        status: LeadStatus.NEW,
      });

      // Initial score should be 0 (no verified, no linkedin, no enrichment)
      expect(lead.score).toBe(0);

      // Update with verified email and linkedin
      const updatedLead = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        verified: true,
        linkedinUrl: 'https://linkedin.com/in/scoretest',
      });
      expect(updatedLead.status).toBe(200);
      expect(updatedLead.body.score).toBe(15); // 10 for verified + 5 for linkedin

      // Update with enrichment data
      const enrichedLead = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        enrichmentData: {
          company: 'Test Company',
          title: 'Developer',
        },
      });
      expect(enrichedLead.status).toBe(200);
      expect(enrichedLead.body.score).toBe(30); // 10 + 5 + 15 for enrichment

      // Update status to CONTACTED first (valid transition)
      const contactedLead = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        status: LeadStatus.CONTACTED,
      });
      expect(contactedLead.status).toBe(200);
      expect(contactedLead.body.score).toBe(40); // 30 + 10 for CONTACTED status

      // Now update status to INTERESTED (valid transition)
      const interestedLead = await testSetup.makeAuthenticatedRequest('patch', `/leads/${lead.id}`, {
        status: LeadStatus.INTERESTED,
      });
      expect(interestedLead.status).toBe(200);
      expect(interestedLead.body.score).toBe(60); // 30 + 30 for INTERESTED status
    });
  });

  describe('Lead List and Filtering', () => {
    it('should list leads with pagination and filtering', async () => {
      const testData = testSetup.getTestData();

      // Create multiple leads with different statuses
      await testSetup.createTestLead({
        fullName: 'New Lead 1',
        email: 'new.lead1@example.com',
        status: LeadStatus.NEW,
      });

      await testSetup.createTestLead({
        fullName: 'Contacted Lead 1',
        email: 'contacted.lead1@example.com',
        status: LeadStatus.CONTACTED,
      });

      await testSetup.createTestLead({
        fullName: 'New Lead 2',
        email: 'new.lead2@example.com',
        status: LeadStatus.NEW,
      });

      // 1. Get all leads
      const allResponse = await testSetup.makeAuthenticatedRequest('get', '/leads?take=10');
      expect(allResponse.status).toBe(200);

      expect(allResponse.body.data).toBeDefined();
      expect(allResponse.body.data.length).toBeGreaterThanOrEqual(3);

      // 2. Filter by status
      const newLeadsResponse = await testSetup.makeAuthenticatedRequest('get', `/leads/status/${LeadStatus.NEW}`);
      expect(newLeadsResponse.status).toBe(200);

      newLeadsResponse.body.forEach((lead: any) => {
        expect(lead.status).toBe(LeadStatus.NEW);
      });

      // 3. Search by name
      const searchResponse = await testSetup.makeAuthenticatedRequest('get', '/leads?search=New');
      expect(searchResponse.status).toBe(200);

      searchResponse.body.data.forEach((lead: any) => {
        expect(lead.fullName).toContain('New');
      });

      // 4. Get lead statistics
      const statsResponse = await testSetup.makeAuthenticatedRequest('get', '/leads/stats');
      expect(statsResponse.status).toBe(200);

      expect(statsResponse.body).toHaveProperty('total');
      expect(statsResponse.body).toHaveProperty('byStatus');
      expect(statsResponse.body.byStatus).toHaveProperty(LeadStatus.NEW);
      expect(statsResponse.body.byStatus).toHaveProperty(LeadStatus.CONTACTED);
    });

    it('should filter leads by campaign', async () => {
      const testData = testSetup.getTestData();

      // Create leads for the test campaign
      await testSetup.createTestLead({
        fullName: 'Campaign Lead 1',
        email: 'campaign.lead1@example.com',
        status: LeadStatus.NEW,
      });

      await testSetup.createTestLead({
        fullName: 'Campaign Lead 2',
        email: 'campaign.lead2@example.com',
        status: LeadStatus.CONTACTED,
      });

      // Get leads for the specific campaign
      const campaignLeadsResponse = await testSetup.makeAuthenticatedRequest('get', `/leads?campaignId=${testData.campaignId}`);
      expect(campaignLeadsResponse.status).toBe(200);

      campaignLeadsResponse.body.data.forEach((lead: any) => {
        expect(lead.campaignId).toBe(testData.campaignId);
      });
    });
  });

  describe('Lead Enrichment', () => {
    it('should trigger enrichment for a lead', async () => {
      const testData = testSetup.getTestData();

      // Create lead without enrichment data
      const lead = await testSetup.createTestLead({
        fullName: 'Enrichment Test Lead',
        email: 'enrichment.test@example.com',
        status: LeadStatus.NEW,
      });

      expect(lead.enrichmentData).toBeNull();
      expect(lead.hasEnrichmentData).toBe(false);

      // Trigger enrichment
      const enrichmentResponse = await testSetup.makeAuthenticatedRequest('post', `/leads/${lead.id}/enrich`);
      expect(enrichmentResponse.status).toBe(200);

      // Note: In a real scenario, enrichment would be async and might require polling
      // For this test, we're just verifying the endpoint works
    });

    it('should handle lead with enrichment data', async () => {
      const testData = testSetup.getTestData();

      const enrichmentData = {
        company: 'Enrichment Corp',
        title: 'Senior Engineer',
        location: 'New York, NY',
        industry: 'Technology',
        linkedinProfile: 'https://linkedin.com/in/enrichmenttest',
        phone: '+1-555-9999',
        website: 'https://enrichmentcorp.com',
      };

      const lead = await testSetup.createTestLead({
        fullName: 'Enriched Lead',
        email: 'enriched.lead@example.com',
        enrichmentData,
        status: LeadStatus.NEW,
      });

      expect(lead.enrichmentData).toEqual(enrichmentData);
      expect(lead.hasEnrichmentData).toBe(true);
      expect(lead.companyName).toBe('Enrichment Corp');
      expect(lead.jobTitle).toBe('Senior Engineer');
      expect(lead.location).toBe('New York, NY');
    });
  });

  describe('Lead Business Logic', () => {
    it('should determine lead qualification correctly', async () => {
      const testData = testSetup.getTestData();

      // Create unqualified lead (low score)
      const unqualifiedLead = await testSetup.createTestLead({
        fullName: 'Unqualified Lead',
        email: 'unqualified@example.com',
        status: LeadStatus.NEW,
      });

      expect(unqualifiedLead.score).toBe(0);
      expect(unqualifiedLead.isQualified).toBe(false);

      // Create qualified lead (high score)
      const qualifiedLead = await testSetup.createTestLead({
        fullName: 'Qualified Lead',
        email: 'qualified@example.com',
        status: LeadStatus.INTERESTED,
        verified: true,
        linkedinUrl: 'https://linkedin.com/in/qualified',
        enrichmentData: {
          company: 'Qualified Corp',
          title: 'Manager',
        },
      });

      expect(qualifiedLead.score).toBeGreaterThanOrEqual(20);
      expect(qualifiedLead.isQualified).toBe(true);

      // Create DO_NOT_CONTACT lead (should not be qualified regardless of score)
      const doNotContactLead = await testSetup.createTestLead({
        fullName: 'Do Not Contact Lead',
        email: 'donotcontact@example.com',
        status: LeadStatus.DO_NOT_CONTACT,
        verified: true,
        linkedinUrl: 'https://linkedin.com/in/donotcontact',
        enrichmentData: {
          company: 'Do Not Contact Corp',
          title: 'Director',
        },
      });

      expect(doNotContactLead.isQualified).toBe(false);
    });

    it('should handle lead with campaign and AI persona', async () => {
      const testData = testSetup.getTestData();

      const lead = await testSetup.createTestLead({
        fullName: 'Campaign AI Lead',
        email: 'campaign.ai@example.com',
        status: LeadStatus.NEW,
      });

      // Verify campaign relationship
      expect(lead.campaignId).toBe(testData.campaignId);

      // Get lead with campaign details
      const leadWithCampaign = await testSetup.makeAuthenticatedRequest('get', `/leads/${lead.id}`);
      expect(leadWithCampaign.status).toBe(200);
      expect(leadWithCampaign.body.campaign).toBeDefined();
      expect(leadWithCampaign.body.campaign.id).toBe(testData.campaignId);
      expect(leadWithCampaign.body.campaign.name).toBeDefined();
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without authentication', async () => {
      // Try to create lead without auth
      const createResponse = await request(app.getHttpServer())
        .post('/leads')
        .send({ 
          fullName: 'Unauthorized Lead',
          email: 'unauthorized@example.com',
          companyId: 'test-company',
          campaignId: 'test-campaign',
        });
      expect(createResponse.status).toBe(401);

      // Try to get leads without auth
      const getResponse = await request(app.getHttpServer())
        .get('/leads');
      expect(getResponse.status).toBe(401);

      // Try to get lead stats without auth
      const statsResponse = await request(app.getHttpServer())
        .get('/leads/stats');
      expect(statsResponse.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', 'Bearer invalid-token')
        .send({ 
          fullName: 'Invalid Token Lead',
          email: 'invalid.token@example.com',
          companyId: 'test-company',
          campaignId: 'test-campaign',
        });
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent lead gracefully', async () => {
      // Try to get non-existent lead
      const getResponse = await testSetup.makeAuthenticatedRequest('get', '/leads/non-existent-id');
      expect(getResponse.status).toBe(404);

      // Try to update non-existent lead
      const updateResponse = await testSetup.makeAuthenticatedRequest('patch', '/leads/non-existent-id', { 
        fullName: 'Updated Name' 
      });
      expect(updateResponse.status).toBe(404);

      // Try to delete non-existent lead
      const deleteResponse = await testSetup.makeAuthenticatedRequest('delete', '/leads/non-existent-id');
      expect(deleteResponse.status).toBe(404);
    });

    it('should handle validation errors', async () => {
      // Try to create lead without required fields
      const response = await testSetup.makeAuthenticatedRequest('post', '/leads', { 
        email: 'invalid-email',
        companyId: 'test-company',
        campaignId: 'test-campaign',
      });
      expect(response.status).toBe(400);

      // Try to create lead with invalid email
      const invalidEmailResponse = await testSetup.makeAuthenticatedRequest('post', '/leads', {
        fullName: 'Test Lead',
        email: 'invalid-email-format',
        companyId: 'test-company',
        campaignId: 'test-campaign',
      });
      expect(invalidEmailResponse.status).toBe(400);
    });

    it('should handle invalid campaign ID', async () => {
      const response = await testSetup.makeAuthenticatedRequest('post', '/leads', {
        fullName: 'Invalid Campaign Lead',
        email: 'invalid.campaign@example.com',
        companyId: 'test-company',
        campaignId: 'invalid-campaign-id',
      });
      expect(response.status).toBe(400);
    });
  });
}); 