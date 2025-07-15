const axios = require('axios');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.TEST_JWT_TOKEN || 'your-test-jwt-token';
const COMPANY_ID = process.env.TEST_COMPANY_ID || 'test-company-id';

// Test data
const testLead = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  linkedinUrl: 'https://linkedin.com/in/johndoe',
  campaignId: 'test-campaign-id',
};

const testWorkflowCompletion = {
  workflowId: 'test-workflow-id',
  leadId: 'test-lead-id',
  companyId: COMPANY_ID,
  status: 'SUCCESS',
  outputData: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    jobTitle: 'Senior Developer',
  },
  errorMessage: null,
};

const testWorkflowLog = {
  leadId: 'test-lead-id',
  companyId: COMPANY_ID,
  nodeName: 'LinkedIn Scraper',
  outputData: {
    scrapedData: {
      name: 'John Doe',
      company: 'Acme Corp',
    },
  },
  timestamp: new Date().toISOString(),
};

const testSmartleadReply = {
  leadId: 'test-lead-id',
  emailId: 'test-email-id',
  content: 'Hi, I\'m interested in learning more about your solution.',
  companyId: COMPANY_ID,
};

// Headers
const headers = {
  'Authorization': `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json',
};

// Test functions
async function testCreateLead() {
  console.log('Testing lead creation...');
  try {
    const response = await axios.post(`${BASE_URL}/api/leads`, testLead, { headers });
    console.log('✅ Lead created successfully:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('❌ Lead creation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testWorkflowCompletion() {
  console.log('Testing workflow completion...');
  try {
    const response = await axios.post(`${BASE_URL}/api/n8n/complete`, testWorkflowCompletion, { headers });
    console.log('✅ Workflow completion handled successfully:', response.data);
  } catch (error) {
    console.error('❌ Workflow completion failed:', error.response?.data || error.message);
  }
}

async function testWorkflowLog() {
  console.log('Testing workflow log...');
  try {
    const response = await axios.post(`${BASE_URL}/api/n8n/log`, testWorkflowLog, { headers });
    console.log('✅ Workflow log handled successfully:', response.data);
  } catch (error) {
    console.error('❌ Workflow log failed:', error.response?.data || error.message);
  }
}

async function testSmartleadReply() {
  console.log('Testing Smartlead reply webhook...');
  try {
    const response = await axios.post(`${BASE_URL}/api/n8n/replies/webhook`, testSmartleadReply, { headers });
    console.log('✅ Smartlead reply handled successfully:', response.data);
  } catch (error) {
    console.error('❌ Smartlead reply failed:', error.response?.data || error.message);
  }
}

async function testGetLeads() {
  console.log('Testing get leads...');
  try {
    const response = await axios.get(`${BASE_URL}/api/leads?limit=10`, { headers });
    console.log('✅ Leads retrieved successfully:', response.data);
  } catch (error) {
    console.error('❌ Get leads failed:', error.response?.data || error.message);
  }
}

async function testGetWorkflowExecutions() {
  console.log('Testing get workflow executions...');
  try {
    const response = await axios.get(`${BASE_URL}/api/workflows/executions?limit=10`, { headers });
    console.log('✅ Workflow executions retrieved successfully:', response.data);
  } catch (error) {
    console.error('❌ Get workflow executions failed:', error.response?.data || error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting workflow integration tests...\n');

  // Test basic API endpoints
  await testGetLeads();
  await testGetWorkflowExecutions();

  console.log('\n--- Testing n8n Integration ---\n');

  // Test n8n webhook endpoints
  await testWorkflowCompletion();
  await testWorkflowLog();
  await testSmartleadReply();

  console.log('\n✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCreateLead,
  testWorkflowCompletion,
  testWorkflowLog,
  testSmartleadReply,
  testGetLeads,
  testGetWorkflowExecutions,
  runTests,
}; 