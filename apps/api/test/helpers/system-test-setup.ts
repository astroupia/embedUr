import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { CampaignStatus } from '../../src/campaigns/constants/campaign.constants';
import { LeadStatus } from '../../src/leads/constants/lead.constants';
import { WorkflowType } from '../../src/workflows/constants/workflow.constants';
import { EnrichmentProvider } from '../../src/enrichment/constants/enrichment.constants';
import { UserRole } from '../../src/constants/enums';

export interface SystemTestData {
  companyId: string;
  userId: string;
  aiPersonaId: string;
  workflowId: string;
  campaignId: string;
  leadId: string;
  replyId: string;
  bookingId: string;
  enrichmentId: string;
  authToken: string;
  userEmail: string;
  userPassword: string;
  companyName: string;
}

export interface TestUser {
  id: string;
  email: string;
  companyId: string;
  role: string;
  authToken: string;
}

export class SystemTestSetup {
  private prismaService: PrismaService;
  private app: INestApplication;
  private testData: SystemTestData | null = null;
  private testUsers: Map<string, TestUser> = new Map();

  constructor(app: INestApplication, prismaService: PrismaService) {
    this.app = app;
    this.prismaService = prismaService;
  }

  /**
   * Setup complete test environment with all necessary entities
   */
  async setupCompleteTestEnvironment(): Promise<SystemTestData> {
    if (this.testData) {
      return this.testData;
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const userEmail = `system${timestamp}${randomSuffix}@e2e.com`;
    const userPassword = 'password123';
    const companyName = `System Test Company ${timestamp}`;

    try {
      // 1. Create company
      const company = await this.prismaService.company.create({
        data: {
          name: companyName,
          schemaName: `system_test_schema_${timestamp}`,
          industry: 'Technology',
          employees: 10,
        },
      });

      // 2. Create user
      const hashedPassword = await bcrypt.hash(userPassword, 12);
      const user = await this.prismaService.user.create({
        data: {
          email: userEmail,
          password: hashedPassword,
          firstName: 'System',
          lastName: 'Test',
          role: UserRole.MEMBER,
          companyId: company.id,
        },
      });

      // 3. Authenticate user
      const loginResponse = await request(this.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: userPassword,
        });

      if (loginResponse.status !== 200) {
        throw new Error(`Failed to login test user: ${loginResponse.status} - ${JSON.stringify(loginResponse.body)}`);
      }

      const authToken = loginResponse.body.accessToken;

      // 4. Create AI persona
      const aiPersona = await this.prismaService.aIPersona.create({
        data: {
          name: 'System Test AI Persona',
          description: 'AI Persona for system E2E tests',
          prompt: 'You are a helpful assistant for system testing',
          companyId: company.id,
        },
      });

      // 5. Create workflow
      const workflow = await this.prismaService.workflow.create({
        data: {
          name: 'System Test Workflow',
          type: 'LEAD_ROUTING',
          n8nWorkflowId: 'system-test-n8n-workflow-id',
          companyId: company.id,
        },
      });

      // 6. Create campaign
      const campaign = await this.prismaService.campaign.create({
        data: {
          name: 'System Test Campaign',
          description: 'Campaign for system E2E tests',
          status: 'DRAFT',
          companyId: company.id,
          aiPersonaId: aiPersona.id,
          workflowId: workflow.id,
        },
      });

      // 7. Create lead
      const lead = await this.prismaService.lead.create({
        data: {
          fullName: 'System Test Lead',
          email: 'system.test.lead@example.com',
          linkedinUrl: 'https://linkedin.com/in/systemtestlead',
          status: 'NEW',
          campaignId: campaign.id,
          companyId: company.id,
        },
      });

      // 8. Create email log for reply
      const emailLog = await this.prismaService.emailLog.create({
        data: {
          leadId: lead.id,
          campaignId: campaign.id,
          companyId: company.id,
          status: 'SENT',
        },
      });

      // 9. Create reply
      const reply = await this.prismaService.reply.create({
        data: {
          content: 'System test reply content',
          classification: 'NEUTRAL',
          leadId: lead.id,
          emailLogId: emailLog.id,
          companyId: company.id,
        },
      });

      // 10. Create booking
      const booking = await this.prismaService.booking.create({
        data: {
          calendlyLink: `https://calendly.com/test/${Date.now()}`,
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          status: 'BOOKED',
          leadId: lead.id,
          companyId: company.id,
        },
      });

      // 11. Create enrichment request
      const enrichment = await this.prismaService.enrichmentRequest.create({
        data: {
          leadId: lead.id,
          provider: 'APOLLO',
          requestData: { email: 'system.test.lead@example.com' },
          status: 'PENDING',
          companyId: company.id,
        },
      });

      this.testData = {
        companyId: company.id,
        userId: user.id,
        aiPersonaId: aiPersona.id,
        workflowId: workflow.id,
        campaignId: campaign.id,
        leadId: lead.id,
        replyId: reply.id,
        bookingId: booking.id,
        enrichmentId: enrichment.id,
        authToken,
        userEmail,
        userPassword,
        companyName,
      };

      console.log('Complete system test environment created:', {
        companyId: company.id,
        userId: user.id,
        hasToken: !!authToken,
      });

      return this.testData;
    } catch (error) {
      console.error('Error in setupCompleteTestEnvironment:', error);
      throw error;
    }
  }

  /**
   * Create a test user with authentication
   */
  async createTestUser(role: string = 'MEMBER', companyId?: string): Promise<TestUser> {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const email = `user${timestamp}${randomSuffix}@test.com`;
    const password = 'password123';

    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const company = await this.prismaService.company.create({
        data: {
          name: `Test Company ${timestamp}`,
          schemaName: `test_schema_${timestamp}`,
          industry: 'Technology',
          employees: 10,
        },
      });
      targetCompanyId = company.id;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: role as UserRole,
        companyId: targetCompanyId,
      },
    });

    const loginResponse = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      });

    if (loginResponse.status !== 200) {
      throw new Error(`Failed to login test user: ${loginResponse.status}`);
    }

    const testUser: TestUser = {
      id: user.id,
      email,
      companyId: targetCompanyId,
      role,
      authToken: loginResponse.body.accessToken,
    };

    this.testUsers.set(user.id, testUser);
    return testUser;
  }

  /**
   * Create multiple test users for the same company
   */
  async createTestUsersForCompany(companyId: string, count: number = 2): Promise<TestUser[]> {
    const users: TestUser[] = [];
    const roles = ['MEMBER', 'ADMIN'];

    for (let i = 0; i < count; i++) {
      const user = await this.createTestUser(roles[i % roles.length], companyId);
      users.push(user);
    }

    return users;
  }

  /**
   * Create a test lead with optional campaign association
   */
  async createTestLead(data: {
    fullName?: string;
    email: string;
    linkedinUrl?: string;
    phone?: string;
    company?: string;
    position?: string;
    status?: string;
    campaignId?: string;
    companyId?: string;
  }, companyId?: string): Promise<{ id: string; [key: string]: any }> {
    const timestamp = Date.now();
    const targetCompanyId = companyId || data.companyId || (this.testData?.companyId);
    
    if (!targetCompanyId) {
      throw new Error('Company ID is required');
    }

    return this.prismaService.lead.create({
      data: {
        fullName: data.fullName || `Test Lead ${timestamp}`,
        email: data.email,
        linkedinUrl: data.linkedinUrl,
        status: (data.status as LeadStatus) || LeadStatus.NEW,
        campaignId: data.campaignId || this.testData?.campaignId || '',
        companyId: targetCompanyId,
      },
    });
  }

  /**
   * Create a test campaign with optional AI persona and workflow
   */
  async createTestCampaign(data: {
    name: string;
    description?: string;
    status?: string;
    aiPersonaId?: string;
    workflowId?: string;
    companyId?: string;
  }): Promise<{ id: string; [key: string]: any }> {
    const companyId = data.companyId || (this.testData?.companyId);
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    return this.prismaService.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        status: (data.status as CampaignStatus) || CampaignStatus.DRAFT,
        aiPersonaId: data.aiPersonaId,
        workflowId: data.workflowId,
        companyId,
      },
    });
  }

  /**
   * Create a test workflow
   */
  async createTestWorkflow(data: {
    name: string;
    type: string;
    n8nWorkflowId: string;
    description?: string;
    companyId?: string;
  }): Promise<{ id: string; [key: string]: any }> {
    const companyId = data.companyId || (this.testData?.companyId);
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    return this.prismaService.workflow.create({
      data: {
        name: data.name,
        type: data.type as WorkflowType,
        n8nWorkflowId: data.n8nWorkflowId,
        companyId,
      },
    });
  }

  /**
   * Create a test AI persona
   */
  async createTestAIPersona(data: {
    name: string;
    description?: string;
    prompt: string;
    parameters?: Record<string, any>;
    companyId?: string;
  }): Promise<{ id: string; [key: string]: any }> {
    const companyId = data.companyId || (this.testData?.companyId);
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    return this.prismaService.aIPersona.create({
      data: {
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        parameters: data.parameters,
        companyId,
      },
    });
  }

  /**
   * Create a test reply
   */
  async createTestReply(data: {
    leadId: string;
    campaignId: string;
    content: string;
    type?: string;
    status?: string;
    companyId?: string;
  }, companyId?: string): Promise<{ id: string; [key: string]: any }> {
    const targetCompanyId = companyId || data.companyId || (this.testData?.companyId);
    
    if (!targetCompanyId) {
      throw new Error('Company ID is required');
    }

    // First create an email log since Reply requires an emailLogId
    const emailLog = await this.prismaService.emailLog.create({
      data: {
        leadId: data.leadId,
        campaignId: data.campaignId,
        companyId: targetCompanyId,
        status: 'SENT',
      },
    });

    return this.prismaService.reply.create({
      data: {
        content: data.content,
        classification: 'NEUTRAL',
        leadId: data.leadId,
        emailLogId: emailLog.id,
        companyId: targetCompanyId,
      },
    });
  }

  /**
   * Create a test booking
   */
  async createTestBooking(data: {
    leadId: string;
    campaignId: string;
    scheduledAt: Date;
    duration?: number;
    type?: string;
    status?: string;
    companyId?: string;
  }): Promise<{ id: string; [key: string]: any }> {
    const companyId = data.companyId || (this.testData?.companyId);
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    return this.prismaService.booking.create({
      data: {
        calendlyLink: `https://calendly.com/test/${Date.now()}`,
        scheduledTime: data.scheduledAt,
        status: 'BOOKED',
        leadId: data.leadId,
        companyId,
      },
    });
  }

  /**
   * Create a test enrichment request
   */
  async createTestEnrichment(data: {
    leadId: string;
    provider?: string;
    status?: string;
    companyId?: string;
  }): Promise<{ id: string; [key: string]: any }> {
    const companyId = data.companyId || (this.testData?.companyId);
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    return this.prismaService.enrichmentRequest.create({
      data: {
        provider: (data.provider as EnrichmentProvider) || 'APOLLO',
        requestData: { email: 'test@example.com' },
        status: data.status || 'PENDING',
        leadId: data.leadId,
        companyId,
      },
    });
  }

  /**
   * Create a test workflow execution
   */
  async createTestWorkflowExecution(data: {
    workflowId: string;
    status: string;
    inputData: any;
    outputData?: any;
    startTime?: Date;
    endTime?: Date;
    durationMs?: number;
  }): Promise<{ id: string; [key: string]: any }> {
    const companyId = this.testData?.companyId;
    
    if (!companyId) {
      throw new Error('Test data not initialized. Call setupCompleteTestEnvironment() first.');
    }

    return this.prismaService.workflowExecution.create({
      data: {
        workflowId: data.workflowId,
        status: data.status,
        triggeredBy: this.testData?.userId || 'system',
        inputData: data.inputData,
        outputData: data.outputData,
        startTime: data.startTime || new Date(),
        endTime: data.endTime,
        durationMs: data.durationMs,
        companyId,
      },
    });
  }

  /**
   * Make authenticated request with a specific user's token
   */
  async makeAuthenticatedRequest(
    method: string,
    url: string,
    data?: any,
    user?: TestUser
  ): Promise<any> {
    const token = user?.authToken || this.testData?.authToken;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const requestBuilder = request(this.app.getHttpServer())
      [method.toLowerCase()](url)
      .set('Authorization', `Bearer ${token}`);

    if (data) {
      requestBuilder.send(data);
    }

    return requestBuilder;
  }

  /**
   * Make authenticated request with the default test user
   */
  async makeRequest(method: string, url: string, data?: any): Promise<any> {
    return this.makeAuthenticatedRequest(method, url, data);
  }

  /**
   * Get the current test data
   */
  getTestData(): SystemTestData | null {
    return this.testData;
  }

  /**
   * Get a specific test user
   */
  getTestUser(userId: string): TestUser | undefined {
    return this.testUsers.get(userId);
  }

  /**
   * Get all test users
   */
  getAllTestUsers(): TestUser[] {
    return Array.from(this.testUsers.values());
  }

  /**
   * Clean up all test data
   */
  async cleanupAllTestData(): Promise<void> {
    try {
      // Clean up test users
      for (const [userId, testUser] of this.testUsers) {
        await this.prismaService.user.deleteMany({
          where: { id: userId },
        });
      }
      this.testUsers.clear();

      // Clean up main test data
      if (this.testData) {
        console.log('Cleaning up system test data for company:', this.testData.companyId);
        
        // Clean up in reverse order of dependencies
        await this.prismaService.adminActionLog.deleteMany({
          where: { 
            OR: [
              { performedBy: this.testData.userId },
              { targetId: this.testData.companyId }
            ]
          },
        });
        
        await this.prismaService.usageMetric.deleteMany({
          where: { companyId: this.testData.companyId },
        });
        
        await this.prismaService.booking.deleteMany({
          where: { companyId: this.testData.companyId },
        });
        
        await this.prismaService.reply.deleteMany({
          where: { companyId: this.testData.companyId },
        });
        
        await this.prismaService.enrichmentRequest.deleteMany({
          where: { companyId: this.testData.companyId },
        });
        
        await this.prismaService.lead.deleteMany({
          where: { companyId: this.testData.companyId },
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
        
        console.log('System test data cleanup completed');
      }
    } catch (error) {
      console.error('Error cleaning up system test data:', error);
    } finally {
      this.testData = null;
    }
  }

  /**
   * Clean up test data for a specific company
   */
  async cleanupCompanyData(companyId: string): Promise<void> {
    try {
      console.log('Cleaning up test data for company:', companyId);
      
      await this.prismaService.adminActionLog.deleteMany({
        where: { targetId: companyId },
      });
      
      await this.prismaService.usageMetric.deleteMany({
        where: { companyId },
      });
      
      await this.prismaService.booking.deleteMany({
        where: { companyId },
      });
      
      await this.prismaService.reply.deleteMany({
        where: { companyId },
      });
      
      await this.prismaService.enrichmentRequest.deleteMany({
        where: { companyId },
      });
      
      await this.prismaService.lead.deleteMany({
        where: { companyId },
      });
      
      await this.prismaService.campaign.deleteMany({
        where: { companyId },
      });
      
      await this.prismaService.aIPersona.deleteMany({
        where: { companyId },
      });
      
      await this.prismaService.workflow.deleteMany({
        where: { companyId },
      });
      
      await this.prismaService.user.deleteMany({
        where: { companyId },
      });
      
      await this.prismaService.company.deleteMany({
        where: { id: companyId },
      });
      
      console.log('Company test data cleanup completed');
    } catch (error) {
      console.error('Error cleaning up company test data:', error);
    }
  }

  /**
   * Wait for a specific condition to be met (useful for async operations)
   */
  async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 10000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Generate test data for API requests
   */
  generateTestData(type: string): any {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);

    switch (type) {
      case 'lead':
        return {
          fullName: `Test Lead ${timestamp}`,
          email: `lead${timestamp}${randomSuffix}@test.com`,
          linkedinUrl: `https://linkedin.com/in/testlead${timestamp}`,
          phone: '+1234567890',
          company: 'Test Company',
          position: 'Software Engineer',
        };
      
      case 'campaign':
        return {
          name: `Test Campaign ${timestamp}`,
          description: `Test campaign description ${timestamp}`,
          status: 'DRAFT',
        };
      
      case 'workflow':
        return {
          name: `Test Workflow ${timestamp}`,
          type: 'LEAD_ROUTING',
          n8nWorkflowId: `test-workflow-${timestamp}`,
          description: `Test workflow description ${timestamp}`,
        };
      
      case 'aiPersona':
        return {
          name: `Test AI Persona ${timestamp}`,
          description: `Test AI persona description ${timestamp}`,
          prompt: 'You are a helpful assistant for testing purposes.',
          parameters: {
            temperature: 0.7,
            maxTokens: 1000,
          },
        };
      
      case 'reply':
        return {
          content: `Test reply content ${timestamp}`,
          type: 'EMAIL',
          status: 'SENT',
        };
      
      case 'booking':
        return {
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 30,
          type: 'CALL',
          status: 'SCHEDULED',
        };
      
      case 'enrichment':
        return {
          provider: 'APOLLO',
        };
      
      default:
        throw new Error(`Unknown test data type: ${type}`);
    }
  }
} 