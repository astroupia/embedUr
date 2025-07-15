import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { CampaignStatus } from '../../src/campaigns/constants/campaign.constants';

export interface TestData {
  companyId: string;
  userId: string;
  aiPersonaId: string;
  workflowId: string;
  campaignId: string;
  authToken: string;
  userEmail: string;
  userPassword: string;
}

export class TestSetup {
  private prismaService: PrismaService;
  private app: INestApplication;
  private testData: TestData | null = null;

  constructor(app: INestApplication, prismaService: PrismaService) {
    this.app = app;
    this.prismaService = prismaService;
  }

  async setupTestData(): Promise<TestData> {
    if (this.testData) {
      return this.testData;
    }

    // Generate unique test identifiers
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const userEmail = `test${timestamp}${randomSuffix}@e2e.com`;
    const userPassword = 'password123';
    const companyName = `Test Company E2E ${timestamp}`;

    try {
      // 1. Create company directly in database
      const company = await this.prismaService.company.create({
        data: {
          name: companyName,
          schemaName: `test_schema_${timestamp}`,
          industry: 'Technology',
          employees: 10,
        },
      });

      // 2. Create user directly in database (bypass email verification)
      const hashedPassword = await bcrypt.hash(userPassword, 12);
      const user = await this.prismaService.user.create({
        data: {
          email: userEmail,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'MEMBER',
          companyId: company.id,
        },
      });

      // 3. Login to get authentication token
      const loginResponse = await request(this.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: userPassword,
        });

      if (loginResponse.status !== 200) {
        console.error('Login failed:', loginResponse.body);
        throw new Error(`Failed to login test user: ${loginResponse.status} - ${JSON.stringify(loginResponse.body)}`);
      }

      const authToken = loginResponse.body.accessToken;
      const userId = user.id;
      const companyId = company.id;

      // 3. Create test AI persona
      const aiPersona = await this.prismaService.aIPersona.create({
        data: {
          name: 'Test AI Persona',
          description: 'Test AI Persona for E2E tests',
          prompt: 'You are a helpful assistant',
          companyId: companyId,
        },
      });

      // 4. Create test workflow
      const workflow = await this.prismaService.workflow.create({
        data: {
          name: 'Test Workflow',
          type: 'LEAD_ROUTING',
          n8nWorkflowId: 'test-n8n-workflow-id',
          companyId: companyId,
        },
      });

      // 5. Create test campaign
      const campaign = await this.prismaService.campaign.create({
        data: {
          name: 'Test Campaign',
          description: 'Test Campaign for E2E tests',
          status: 'DRAFT',
          companyId: companyId,
          aiPersonaId: aiPersona.id,
          workflowId: workflow.id,
        },
      });

      this.testData = {
        companyId,
        userId,
        aiPersonaId: aiPersona.id,
        workflowId: workflow.id,
        campaignId: campaign.id,
        authToken,
        userEmail,
        userPassword,
      };

      return this.testData;
    } catch (error) {
      console.error('Error in setupTestData:', error);
      throw error;
    }
  }

  async cleanupTestData(): Promise<void> {
    if (!this.testData) {
      return;
    }

    try {
      console.log('Cleaning up test data for company:', this.testData.companyId);
      
      // Clean up in reverse order of dependencies
      // First delete admin action logs that reference users
      await this.prismaService.adminActionLog.deleteMany({
        where: { 
          OR: [
            { performedBy: this.testData.userId },
            { targetId: this.testData.companyId }
          ]
        },
      });
      
      await this.prismaService.campaign.deleteMany({
        where: { companyId: this.testData.companyId },
      });
      await this.prismaService.aIPersona.deleteMany({
        where: { companyId: this.testData.companyId },
      });
      await this.prismaService.workflow.deleteMany({
        where: { companyId: this.testData.companyId },
      });
      await this.prismaService.user.deleteMany({
        where: { companyId: this.testData.companyId },
      });
      await this.prismaService.company.deleteMany({
        where: { id: this.testData.companyId },
      });
      
      console.log('Test data cleanup completed');
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    } finally {
      this.testData = null;
    }
  }

  async createTestCampaign(data: {
    name: string;
    description?: string;
    status?: string;
    aiPersonaId?: string;
    workflowId?: string;
  }): Promise<{ id: string; [key: string]: any }> {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }

    return this.prismaService.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        status: (data.status as CampaignStatus) || CampaignStatus.DRAFT,
        aiPersonaId: data.aiPersonaId,
        workflowId: data.workflowId,
        companyId: this.testData.companyId,
      },
    });
  }

  async createTestLead(data: {
    fullName?: string;
    email: string;
    linkedinUrl?: string;
    enrichmentData?: Record<string, any>;
    verified?: boolean;
    status?: string;
    campaignId?: string;
  }): Promise<{ id: string; [key: string]: any }> {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }

    // Use the API endpoint to create the lead so we get the proper response with business logic properties
    const response = await this.makeAuthenticatedRequest('post', '/leads', {
      fullName: data.fullName || 'Test Lead',
      email: data.email,
      linkedinUrl: data.linkedinUrl,
      enrichmentData: data.enrichmentData,
      verified: data.verified || false,
      status: data.status || 'NEW',
      campaignId: data.campaignId || this.testData.campaignId,
    });

    if (response.status !== 201) {
      throw new Error(`Failed to create test lead: ${response.status} - ${JSON.stringify(response.body)}`);
    }

    return response.body;
  }

  async createTestAIPersona(data: {
    name: string;
    description?: string;
    prompt: string;
    parameters?: Record<string, any>;
  }): Promise<{ id: string; [key: string]: any }> {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }

    // Use the API endpoint to create the AI persona so we get the proper response with business logic properties
    const response = await this.makeAuthenticatedRequest('post', '/ai-personas', {
      name: data.name,
      description: data.description,
      prompt: data.prompt,
      parameters: data.parameters,
    });

    if (response.status !== 201) {
      throw new Error(`Failed to create test AI persona: ${response.status} - ${JSON.stringify(response.body)}`);
    }

    return response.body;
  }

  async createTestWorkflow(data: {
    name: string;
    type: string;
    n8nWorkflowId: string;
  }): Promise<{ id: string; [key: string]: any }> {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }

    // Use the API endpoint to create the workflow so we get the proper response with business logic properties
    const response = await this.makeAuthenticatedRequest('post', '/workflows', {
      name: data.name,
      type: data.type,
      n8nWorkflowId: data.n8nWorkflowId,
    });

    if (response.status !== 201) {
      throw new Error(`Failed to create test workflow: ${response.status} - ${JSON.stringify(response.body)}`);
    }

    return response.body;
  }

  async createTestWorkflowExecution(data: {
    workflowId: string;
    status: string;
    inputData: any;
    outputData?: any;
    startTime?: Date;
    endTime?: Date;
    durationMs?: number;
  }): Promise<{ id: string; [key: string]: any }> {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }

    // Create workflow execution directly in database
    return this.prismaService.workflowExecution.create({
      data: {
        workflowId: data.workflowId,
        companyId: this.testData.companyId,
        triggeredBy: this.testData.userId,
        status: data.status as any,
        inputData: data.inputData,
        outputData: data.outputData,
        startTime: data.startTime || new Date(),
        endTime: data.endTime,
        durationMs: data.durationMs,
      },
    });
  }

  async deleteAllWorkflowExecutionsForWorkflow(workflowId: string): Promise<void> {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }
    await this.prismaService.workflowExecution.deleteMany({
      where: {
        workflowId,
        companyId: this.testData.companyId,
      },
    });
  }

  getAuthToken(): string {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }
    return this.testData.authToken;
  }

  getTestData(): TestData {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }
    return this.testData;
  }

  // Helper method to refresh the auth token if needed
  async refreshAuthToken(): Promise<string> {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }

    const loginResponse = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        email: this.testData.userEmail,
        password: this.testData.userPassword,
      });

    if (loginResponse.status !== 200) {
      throw new Error('Failed to refresh auth token');
    }

    this.testData.authToken = loginResponse.body.accessToken;
    return this.testData.authToken;
  }

  // Helper method to make authenticated requests with automatic token refresh
  async makeAuthenticatedRequest(method: string, url: string, data?: any): Promise<any> {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call setupTestData() first.');
    }

    let response = await request(this.app.getHttpServer())
      [method.toLowerCase()](url)
      .set('Authorization', `Bearer ${this.testData.authToken}`)
      .send(data);

    // If we get 401, try to refresh the token and retry once
    if (response.status === 401) {
      console.log('Token expired, refreshing...');
      await this.refreshAuthToken();
      
      response = await request(this.app.getHttpServer())
        [method.toLowerCase()](url)
        .set('Authorization', `Bearer ${this.testData.authToken}`)
        .send(data);
    }

    return response;
  }
} 