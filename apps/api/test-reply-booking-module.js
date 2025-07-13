#!/usr/bin/env node

/**
 * Test Script for Reply & Booking Module
 * 
 * This script tests the main endpoints of the Reply & Booking Module
 * to ensure they are working correctly.
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'your_jwt_token_here';
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || 'your_webhook_token_here';

// Test data
const TEST_COMPANY_ID = 'test_company_123';
const TEST_LEAD_ID = 'test_lead_456';
const TEST_EMAIL_LOG_ID = 'test_email_789';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Helper functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logError = (message) => log(`❌ ${message}`, colors.red);
const logWarning = (message) => log(`⚠️  ${message}`, colors.yellow);
const logInfo = (message) => log(`ℹ️  ${message}`, colors.blue);
const logHeader = (message) => log(`\n${colors.bold}${message}${colors.reset}`);

// HTTP client with auth
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Test functions
async function testReplyEndpoints() {
  logHeader('Testing Reply Endpoints');

  try {
    // Test 1: Create Reply
    logInfo('Creating a test reply...');
    const createReplyData = {
      content: 'I am very interested in your solution! This looks exactly like what we need.',
      leadId: TEST_LEAD_ID,
      emailLogId: TEST_EMAIL_LOG_ID,
      source: 'MANUAL',
      metadata: {
        subject: 'Re: Cold Outreach - Very Interested',
        from: 'prospect@testcompany.com',
        test: true
      }
    };

    const createResponse = await api.post('/replies', createReplyData);
    const replyId = createResponse.data.id;
    logSuccess(`Reply created with ID: ${replyId}`);

    // Test 2: Get Reply by ID
    logInfo('Fetching reply by ID...');
    const getResponse = await api.get(`/replies/${replyId}`);
    logSuccess(`Reply retrieved: ${getResponse.data.content.substring(0, 50)}...`);

    // Test 3: Update Reply
    logInfo('Updating reply classification...');
    const updateResponse = await api.put(`/replies/${replyId}`, {
      classification: 'INTERESTED',
      handledBy: 'test_user_123'
    });
    logSuccess(`Reply updated with classification: ${updateResponse.data.classification}`);

    // Test 4: Get Replies with Pagination
    logInfo('Fetching replies with pagination...');
    const listResponse = await api.get('/replies?limit=10&classification=INTERESTED');
    logSuccess(`Retrieved ${listResponse.data.data.length} replies`);

    // Test 5: Get Reply Statistics
    logInfo('Fetching reply statistics...');
    const statsResponse = await api.get('/replies/stats/overview');
    logSuccess(`Reply stats: ${statsResponse.data.total} total replies`);

    // Test 6: Get Replies Requiring Attention
    logInfo('Fetching replies requiring attention...');
    const attentionResponse = await api.get('/replies/attention/required');
    logSuccess(`Found ${attentionResponse.data.length} replies requiring attention`);

    // Test 7: Manually Classify Reply
    logInfo('Manually classifying reply...');
    const classifyResponse = await api.post(`/replies/${replyId}/classify`, {
      classification: 'INTERESTED'
    });
    logSuccess(`Reply classified as: ${classifyResponse.data.classification}`);

    // Test 8: Mark Reply as Handled
    logInfo('Marking reply as handled...');
    const handleResponse = await api.post(`/replies/${replyId}/handle`);
    logSuccess(`Reply marked as handled by: ${handleResponse.data.handledBy}`);

    // Test 9: Get Reply Priority
    logInfo('Getting reply priority...');
    const priorityResponse = await api.get(`/replies/${replyId}/priority`);
    logSuccess(`Reply priority: ${priorityResponse.data.priority}`);

    return replyId;

  } catch (error) {
    logError(`Reply endpoint test failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testBookingEndpoints(replyId) {
  logHeader('Testing Booking Endpoints');

  try {
    // Test 1: Create Booking
    logInfo('Creating a test booking...');
    const createBookingData = {
      calendlyLink: 'https://calendly.com/testcompany/discovery-call',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      leadId: TEST_LEAD_ID,
      replyId: replyId,
      metadata: {
        duration: 30,
        meetingType: 'discovery',
        test: true
      }
    };

    const createResponse = await api.post('/bookings', createBookingData);
    const bookingId = createResponse.data.id;
    logSuccess(`Booking created with ID: ${bookingId}`);

    // Test 2: Get Booking by ID
    logInfo('Fetching booking by ID...');
    const getResponse = await api.get(`/bookings/${bookingId}`);
    logSuccess(`Booking retrieved: ${getResponse.data.calendlyLink}`);

    // Test 3: Update Booking
    logInfo('Updating booking...');
    const updateResponse = await api.put(`/bookings/${bookingId}`, {
      metadata: {
        ...getResponse.data.metadata,
        updatedAt: new Date().toISOString()
      }
    });
    logSuccess(`Booking updated successfully`);

    // Test 4: Get Bookings with Pagination
    logInfo('Fetching bookings with pagination...');
    const listResponse = await api.get('/bookings?limit=10&status=BOOKED');
    logSuccess(`Retrieved ${listResponse.data.data.length} bookings`);

    // Test 5: Get Booking Statistics
    logInfo('Fetching booking statistics...');
    const statsResponse = await api.get('/bookings/stats/overview');
    logSuccess(`Booking stats: ${statsResponse.data.total} total bookings`);

    // Test 6: Get Upcoming Bookings
    logInfo('Fetching upcoming bookings...');
    const upcomingResponse = await api.get('/bookings/upcoming?limit=5');
    logSuccess(`Found ${upcomingResponse.data.length} upcoming bookings`);

    // Test 7: Get Today's Bookings
    logInfo('Fetching today\'s bookings...');
    const todayResponse = await api.get('/bookings/today');
    logSuccess(`Found ${todayResponse.data.length} bookings for today`);

    // Test 8: Get Dashboard Data
    logInfo('Fetching booking dashboard data...');
    const dashboardResponse = await api.get('/bookings/dashboard/data');
    logSuccess(`Dashboard data retrieved: ${dashboardResponse.data.upcoming.length} upcoming, ${dashboardResponse.data.today.length} today`);

    // Test 9: Get Booking Priority
    logInfo('Getting booking priority...');
    const priorityResponse = await api.get(`/bookings/${bookingId}/priority`);
    logSuccess(`Booking priority: ${priorityResponse.data.priority}`);

    // Test 10: Reschedule Booking
    logInfo('Rescheduling booking...');
    const rescheduleResponse = await api.post(`/bookings/${bookingId}/reschedule`, {
      calendlyLink: 'https://calendly.com/testcompany/discovery-call-rescheduled',
      scheduledTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      reason: 'Conflict with existing meeting'
    });
    logSuccess(`Booking rescheduled: ${rescheduleResponse.data.status}`);

    // Test 11: Cancel Booking
    logInfo('Cancelling booking...');
    const cancelResponse = await api.post(`/bookings/${bookingId}/cancel`, {
      reason: 'Prospect unavailable'
    });
    logSuccess(`Booking cancelled: ${cancelResponse.data.status}`);

    return bookingId;

  } catch (error) {
    logError(`Booking endpoint test failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testWebhookEndpoints() {
  logHeader('Testing Webhook Endpoints');

  try {
    // Test 1: Smartlead Webhook
    logInfo('Testing Smartlead webhook...');
    const smartleadPayload = {
      leadId: TEST_LEAD_ID,
      emailId: TEST_EMAIL_LOG_ID,
      replyContent: 'This looks very interesting! I would like to learn more.',
      replySubject: 'Re: Cold Outreach - Very Interested',
      replyFrom: 'prospect@testcompany.com',
      timestamp: new Date().toISOString()
    };

    const smartleadResponse = await axios.post(`${BASE_URL}/webhooks/replies/smartlead`, smartleadPayload, {
      headers: {
        'X-Smartlead-Signature': 'test_signature',
        'Content-Type': 'application/json'
      }
    });
    logSuccess(`Smartlead webhook processed: ${smartleadResponse.data.message}`);

    // Test 2: Generic Webhook
    logInfo('Testing generic webhook...');
    const genericPayload = {
      leadId: TEST_LEAD_ID,
      emailLogId: TEST_EMAIL_LOG_ID,
      content: 'Generic webhook test reply content',
      metadata: {
        source: 'test_integration',
        test: true
      }
    };

    const genericResponse = await axios.post(`${BASE_URL}/webhooks/replies/generic`, genericPayload, {
      headers: {
        'X-Webhook-Token': WEBHOOK_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    logSuccess(`Generic webhook processed: ${genericResponse.data.message}`);

    // Test 3: Manual Reply Creation
    logInfo('Testing manual reply creation...');
    const manualPayload = {
      leadId: TEST_LEAD_ID,
      emailLogId: TEST_EMAIL_LOG_ID,
      content: 'Manual reply creation test',
      companyId: TEST_COMPANY_ID,
      metadata: {
        createdManually: true,
        test: true
      }
    };

    const manualResponse = await axios.post(`${BASE_URL}/webhooks/replies/manual`, manualPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    logSuccess(`Manual reply created: ${manualResponse.data.replyId}`);

    // Test 4: Health Check
    logInfo('Testing webhook health check...');
    const healthResponse = await axios.post(`${BASE_URL}/webhooks/replies/health`);
    logSuccess(`Webhook health: ${healthResponse.data.status}`);

  } catch (error) {
    logError(`Webhook endpoint test failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testErrorHandling() {
  logHeader('Testing Error Handling');

  try {
    // Test 1: Invalid Reply Creation
    logInfo('Testing invalid reply creation...');
    try {
      await api.post('/replies', {
        // Missing required fields
        content: ''
      });
      logError('Should have failed with missing fields');
    } catch (error) {
      if (error.response?.status === 400) {
        logSuccess('Correctly rejected invalid reply data');
      } else {
        throw error;
      }
    }

    // Test 2: Invalid Booking Creation
    logInfo('Testing invalid booking creation...');
    try {
      await api.post('/bookings', {
        // Missing required fields
        calendlyLink: 'invalid-url',
        scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Past date
      });
      logError('Should have failed with invalid booking data');
    } catch (error) {
      if (error.response?.status === 400) {
        logSuccess('Correctly rejected invalid booking data');
      } else {
        throw error;
      }
    }

    // Test 3: Non-existent Resource
    logInfo('Testing non-existent resource...');
    try {
      await api.get('/replies/non-existent-id');
      logError('Should have failed with 404');
    } catch (error) {
      if (error.response?.status === 404) {
        logSuccess('Correctly returned 404 for non-existent resource');
      } else {
        throw error;
      }
    }

    // Test 4: Unauthorized Access
    logInfo('Testing unauthorized access...');
    try {
      await axios.get(`${BASE_URL}/replies`, {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      });
      logError('Should have failed with 401');
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly rejected invalid token');
      } else {
        throw error;
      }
    }

  } catch (error) {
    logError(`Error handling test failed: ${error.message}`);
    throw error;
  }
}

// Main test runner
async function runTests() {
  logHeader('🚀 Starting Reply & Booking Module Tests');
  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`Auth Token: ${AUTH_TOKEN ? 'Provided' : 'Missing'}`);
  logInfo(`Webhook Token: ${WEBHOOK_TOKEN ? 'Provided' : 'Missing'}`);

  if (!AUTH_TOKEN || AUTH_TOKEN === 'your_jwt_token_here') {
    logWarning('Please set AUTH_TOKEN environment variable for authenticated tests');
  }

  if (!WEBHOOK_TOKEN || WEBHOOK_TOKEN === 'your_webhook_token_here') {
    logWarning('Please set WEBHOOK_TOKEN environment variable for webhook tests');
  }

  try {
    // Run tests in sequence
    const replyId = await testReplyEndpoints();
    const bookingId = await testBookingEndpoints(replyId);
    await testWebhookEndpoints();
    await testErrorHandling();

    logHeader('🎉 All Tests Completed Successfully!');
    logSuccess('Reply & Booking Module is working correctly');
    logInfo(`Test Reply ID: ${replyId}`);
    logInfo(`Test Booking ID: ${bookingId}`);

  } catch (error) {
    logHeader('💥 Test Suite Failed');
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testReplyEndpoints,
  testBookingEndpoints,
  testWebhookEndpoints,
  testErrorHandling,
  runTests
}; 