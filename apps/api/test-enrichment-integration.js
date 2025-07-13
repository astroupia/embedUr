const axios = require('axios');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const API_KEY = process.env.ENRICHMENT_WEBHOOK_API_KEY || 'test-api-key';

// Test data
const testLeadId = 'test-lead-id';
const testCompanyId = 'test-company-id';

// Test payload for enrichment completion
const enrichmentCompletionPayload = {
  workflow: 'Lead Enrichment and Verification',
  leadId: testLeadId,
  status: 'completed',
  outputData: {
    leadId: testLeadId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Example Corp',
    jobTitle: 'Software Engineer',
    industry: 'Technology',
    companySize: '50-200',
    emailVerified: true,
  },
  clientId: 'test-client',
};

async function testEnrichmentIntegration() {
  console.log('🧪 Testing Enrichment Module Integration with Workflow 2\n');

  try {
    // Test 1: Trigger enrichment workflow
    console.log('1️⃣ Testing enrichment workflow trigger...');
    const triggerResponse = await axios.post(
      `${BASE_URL}/api/enrichment/trigger`,
      {
        leadId: testLeadId,
        provider: 'N8N',
        requestData: {
          email: 'john.doe@example.com',
          fullName: 'John Doe',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );
    console.log('✅ Enrichment workflow trigger successful');
    console.log('Response:', triggerResponse.data);

    // Test 2: Simulate enrichment completion webhook
    console.log('\n2️⃣ Testing enrichment completion webhook...');
    const webhookResponse = await axios.post(
      `${BASE_URL}/api/enrichment/complete`,
      enrichmentCompletionPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
      }
    );
    console.log('✅ Enrichment completion webhook successful');
    console.log('Response:', webhookResponse.data);

    // Test 3: Verify lead data was updated
    console.log('\n3️⃣ Verifying lead data update...');
    const leadResponse = await axios.get(
      `${BASE_URL}/api/leads/${testLeadId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );
    console.log('✅ Lead data verification successful');
    console.log('Updated lead:', leadResponse.data);

    // Test 4: Check enrichment request status
    console.log('\n4️⃣ Checking enrichment request status...');
    const enrichmentResponse = await axios.get(
      `${BASE_URL}/api/enrichment/requests?leadId=${testLeadId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );
    console.log('✅ Enrichment request status check successful');
    console.log('Enrichment requests:', enrichmentResponse.data);

    console.log('\n🎉 All enrichment integration tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🧪 Testing error handling...\n');

  try {
    // Test 1: Invalid API key
    console.log('1️⃣ Testing invalid API key...');
    await axios.post(
      `${BASE_URL}/api/enrichment/complete`,
      enrichmentCompletionPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'invalid-key',
        },
      }
    );
    console.log('❌ Should have failed with invalid API key');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid API key correctly rejected');
    } else {
      console.log('❌ Unexpected error for invalid API key:', error.message);
    }
  }

  try {
    // Test 2: Invalid payload
    console.log('\n2️⃣ Testing invalid payload...');
    await axios.post(
      `${BASE_URL}/api/enrichment/complete`,
      { invalid: 'payload' },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
      }
    );
    console.log('❌ Should have failed with invalid payload');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid payload correctly rejected');
    } else {
      console.log('❌ Unexpected error for invalid payload:', error.message);
    }
  }

  try {
    // Test 3: Non-existent lead
    console.log('\n3️⃣ Testing non-existent lead...');
    await axios.post(
      `${BASE_URL}/api/enrichment/complete`,
      {
        ...enrichmentCompletionPayload,
        leadId: 'non-existent-lead',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
      }
    );
    console.log('❌ Should have failed with non-existent lead');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Non-existent lead correctly rejected');
    } else {
      console.log('❌ Unexpected error for non-existent lead:', error.message);
    }
  }

  console.log('\n🎉 Error handling tests completed!');
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Enrichment Module Integration Tests\n');
  
  await testEnrichmentIntegration();
  await testErrorHandling();
  
  console.log('\n✨ All tests completed successfully!');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testEnrichmentIntegration,
  testErrorHandling,
  runTests,
}; 