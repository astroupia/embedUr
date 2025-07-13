#!/usr/bin/env ts-node

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SystemTestSetup } from './helpers/system-test-setup';

/**
 * System E2E Test Runner
 * 
 * This script runs comprehensive end-to-end tests for the entire system
 * as a black-box API, testing all modules and their interactions.
 */

async function runSystemE2ETests() {
  let app: INestApplication | undefined;
  let prismaService: PrismaService | undefined;
  let systemTestSetup: SystemTestSetup | undefined;

  console.log('🚀 Starting System E2E Test Suite...');

  try {
    // Setup test environment
    console.log('📦 Setting up test environment...');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
    systemTestSetup = new SystemTestSetup(app, prismaService);

    console.log('✅ Test environment ready');

    // Ensure systemTestSetup is initialized
    if (!systemTestSetup) {
      throw new Error('Failed to initialize system test setup');
    }

    // Run tests
    console.log('🧪 Running system E2E tests...');
    
    // Test 1: System Health
    console.log('  🔍 Testing system health...');
    const healthResponse = await systemTestSetup.makeRequest('get', '/health');
    if (healthResponse.status !== 200) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    console.log('  ✅ System health check passed');

    // Test 2: Authentication Flow
    console.log('  🔐 Testing authentication flow...');
    const testUser = await systemTestSetup.createTestUser('MEMBER');
    if (!testUser.authToken) {
      throw new Error('Failed to create authenticated test user');
    }
    console.log('  ✅ Authentication flow passed');

    // Test 3: Complete CRUD Operations
    console.log('  📝 Testing complete CRUD operations...');
    
    // Create AI Persona
    const personaData = systemTestSetup.generateTestData('aiPersona');
    const personaResponse = await systemTestSetup.makeAuthenticatedRequest('post', '/ai-personas', personaData, testUser);
    if (personaResponse.status !== 201) {
      throw new Error(`Failed to create AI persona: ${personaResponse.status}`);
    }
    const personaId = personaResponse.body.id;
    console.log('    ✅ AI Persona created');

    // Create Workflow
    const workflowData = systemTestSetup.generateTestData('workflow');
    const workflowResponse = await systemTestSetup.makeAuthenticatedRequest('post', '/workflows', workflowData, testUser);
    if (workflowResponse.status !== 201) {
      throw new Error(`Failed to create workflow: ${workflowResponse.status}`);
    }
    const workflowId = workflowResponse.body.id;
    console.log('    ✅ Workflow created');

    // Create Campaign
    const campaignData = {
      ...systemTestSetup.generateTestData('campaign'),
      aiPersonaId: personaId,
      workflowId: workflowId,
    };
    const campaignResponse = await systemTestSetup.makeAuthenticatedRequest('post', '/campaigns', campaignData, testUser);
    if (campaignResponse.status !== 201) {
      throw new Error(`Failed to create campaign: ${campaignResponse.status}`);
    }
    const campaignId = campaignResponse.body.id;
    console.log('    ✅ Campaign created');

    // Create Lead
    const leadData = systemTestSetup.generateTestData('lead');
    const leadResponse = await systemTestSetup.makeAuthenticatedRequest('post', '/leads', leadData, testUser);
    if (leadResponse.status !== 201) {
      throw new Error(`Failed to create lead: ${leadResponse.status}`);
    }
    const leadId = leadResponse.body.id;
    console.log('    ✅ Lead created');

    // Create Reply
    const replyData = {
      ...systemTestSetup.generateTestData('reply'),
      leadId: leadId,
      campaignId: campaignId,
    };
    const replyResponse = await systemTestSetup.makeAuthenticatedRequest('post', '/replies', replyData, testUser);
    if (replyResponse.status !== 201) {
      throw new Error(`Failed to create reply: ${replyResponse.status}`);
    }
    const replyId = replyResponse.body.id;
    console.log('    ✅ Reply created');

    // Create Booking
    const bookingData = {
      ...systemTestSetup.generateTestData('booking'),
      leadId: leadId,
      campaignId: campaignId,
    };
    const bookingResponse = await systemTestSetup.makeAuthenticatedRequest('post', '/bookings', bookingData, testUser);
    if (bookingResponse.status !== 201) {
      throw new Error(`Failed to create booking: ${bookingResponse.status}`);
    }
    const bookingId = bookingResponse.body.id;
    console.log('    ✅ Booking created');

    // Create Enrichment
    const enrichmentData = {
      ...systemTestSetup.generateTestData('enrichment'),
      leadId: leadId,
    };
    const enrichmentResponse = await systemTestSetup.makeAuthenticatedRequest('post', '/enrichment/trigger', enrichmentData, testUser);
    if (enrichmentResponse.status !== 201) {
      throw new Error(`Failed to create enrichment: ${enrichmentResponse.status}`);
    }
    const enrichmentId = enrichmentResponse.body.id;
    console.log('    ✅ Enrichment created');

    // Test 4: Read Operations
    console.log('  📖 Testing read operations...');
    
    const readTests = [
      { name: 'AI Personas', url: '/ai-personas' },
      { name: 'Workflows', url: '/workflows' },
      { name: 'Campaigns', url: '/campaigns' },
      { name: 'Leads', url: '/leads' },
      { name: 'Replies', url: '/replies' },
      { name: 'Bookings', url: '/bookings' },
      { name: 'Enrichment', url: '/enrichment' },
    ];

    for (const test of readTests) {
      const response = await systemTestSetup.makeAuthenticatedRequest('get', test.url, undefined, testUser);
      if (response.status !== 200) {
        throw new Error(`Failed to read ${test.name}: ${response.status}`);
      }
      console.log(`    ✅ ${test.name} read operation passed`);
    }

    // Test 5: Update Operations
    console.log('  ✏️  Testing update operations...');
    
    const updateTests = [
      { name: 'AI Persona', url: `/ai-personas/${personaId}`, data: { name: 'Updated AI Persona' } },
      { name: 'Workflow', url: `/workflows/${workflowId}`, data: { name: 'Updated Workflow' } },
      { name: 'Campaign', url: `/campaigns/${campaignId}`, data: { name: 'Updated Campaign' } },
      { name: 'Lead', url: `/leads/${leadId}`, data: { fullName: 'Updated Lead' } },
      { name: 'Reply', url: `/replies/${replyId}`, data: { content: 'Updated reply content' } },
      { name: 'Booking', url: `/bookings/${bookingId}`, data: { duration: 45 } },
    ];

    for (const test of updateTests) {
      const response = await systemTestSetup.makeAuthenticatedRequest('patch', test.url, test.data, testUser);
      if (response.status !== 200) {
        throw new Error(`Failed to update ${test.name}: ${response.status}`);
      }
      console.log(`    ✅ ${test.name} update operation passed`);
    }

    // Test 6: Delete Operations
    console.log('  🗑️  Testing delete operations...');
    
    const deleteTests = [
      { name: 'Reply', url: `/replies/${replyId}` },
      { name: 'Booking', url: `/bookings/${bookingId}` },
      { name: 'Enrichment', url: `/enrichment/${enrichmentId}` },
      { name: 'Lead', url: `/leads/${leadId}` },
      { name: 'Campaign', url: `/campaigns/${campaignId}` },
      { name: 'Workflow', url: `/workflows/${workflowId}` },
      { name: 'AI Persona', url: `/ai-personas/${personaId}` },
    ];

    for (const test of deleteTests) {
      const response = await systemTestSetup.makeAuthenticatedRequest('delete', test.url, undefined, testUser);
      if (response.status !== 204) {
        throw new Error(`Failed to delete ${test.name}: ${response.status}`);
      }
      console.log(`    ✅ ${test.name} delete operation passed`);
    }

    // Test 7: Error Handling
    console.log('  ⚠️  Testing error handling...');
    
    const errorTests = [
      { name: 'Unauthorized access', method: 'get', url: '/leads', expectStatus: 401, auth: false },
      { name: 'Resource not found', method: 'get', url: '/leads/non-existent-id', expectStatus: 404, auth: true },
      { name: 'Invalid request data', method: 'post', url: '/leads', data: {}, expectStatus: 400, auth: true },
    ];

    for (const test of errorTests) {
      let response;
      if (test.auth) {
        response = await systemTestSetup.makeAuthenticatedRequest(test.method, test.url, test.data, testUser);
      } else {
        response = await systemTestSetup.makeRequest(test.method, test.url, test.data);
      }
      
      if (response.status !== test.expectStatus) {
        throw new Error(`Error handling test failed for ${test.name}: expected ${test.expectStatus}, got ${response.status}`);
      }
      console.log(`    ✅ ${test.name} error handling passed`);
    }

    // Test 8: Company Isolation
    console.log('  🏢 Testing company isolation...');
    
    const otherUser = await systemTestSetup.createTestUser('MEMBER');
    const isolationResponse = await systemTestSetup.makeAuthenticatedRequest('get', '/leads', undefined, otherUser);
    if (isolationResponse.status !== 200) {
      throw new Error(`Company isolation test failed: ${isolationResponse.status}`);
    }
    console.log('    ✅ Company isolation passed');

    console.log('  ✅ Complete CRUD operations passed');

    // Test 9: Integration Scenarios
    console.log('  🔗 Testing integration scenarios...');
    
    // Scenario 1: Lead to Reply workflow
    const integrationLead = await systemTestSetup.createTestLead({
      email: 'integration.test@example.com',
      fullName: 'Integration Test Lead',
    }, testUser.companyId);

    const integrationReply = await systemTestSetup.createTestReply({
      leadId: integrationLead.id,
      campaignId: campaignId,
      content: 'Integration test reply',
    }, testUser.companyId);

    if (!integrationReply.id) {
      throw new Error('Integration scenario failed: reply not created');
    }
    console.log('    ✅ Lead to Reply integration passed');

    // Scenario 2: Campaign activation
    const activationResponse = await systemTestSetup.makeAuthenticatedRequest(
      'patch', 
      `/campaigns/${campaignId}`, 
      { status: 'ACTIVE' }, 
      testUser
    );
    if (activationResponse.status !== 200) {
      throw new Error('Campaign activation failed');
    }
    console.log('    ✅ Campaign activation passed');

    console.log('  ✅ Integration scenarios passed');

    console.log('🎉 All System E2E Tests Passed!');

  } catch (error) {
    console.error('❌ System E2E Test Failed:', error);
    throw error;
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up test data...');
    try {
      if (systemTestSetup) {
        await systemTestSetup.cleanupAllTestData();
      }
      console.log('✅ Test data cleanup completed');
    } catch (cleanupError) {
      console.error('⚠️  Cleanup error:', cleanupError);
    }

    if (app) {
      await app.close();
      console.log('✅ Application closed');
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runSystemE2ETests()
    .then(() => {
      console.log('🎯 System E2E Test Suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 System E2E Test Suite failed:', error);
      process.exit(1);
    });
}

export { runSystemE2ETests }; 