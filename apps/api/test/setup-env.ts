// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.N8N_ENRICHMENT_WEBHOOK = 'http://localhost:5678/webhook/test';
process.env.N8N_CAMPAIGN_ACTIVATION_WEBHOOK = 'http://localhost:5678/webhook/campaign-activation';
process.env.N8N_CAMPAIGN_PAUSE_WEBHOOK = 'http://localhost:5678/webhook/campaign-pause';
process.env.N8N_CAMPAIGN_COMPLETION_WEBHOOK = 'http://localhost:5678/webhook/campaign-completion';
process.env.N8N_CAMPAIGN_STATUS_CHANGE_WEBHOOK = 'http://localhost:5678/webhook/campaign-status-change';
process.env.N8N_LEAD_ASSIGNMENT_WEBHOOK = 'http://localhost:5678/webhook/lead-assignment';
process.env.N8N_ANALYTICS_UPDATE_WEBHOOK = 'http://localhost:5678/webhook/analytics-update';

// Mock API keys
process.env.SMARTLEAD_API_KEY = 'test-smartlead-key';
process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
process.env.AIRTABLE_API_KEY = 'test-airtable-key';

// Mock other required env vars
process.env.BACKEND_URL = 'http://localhost:3000';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';

// Disable email sending for tests
process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
process.env.FROM_EMAIL = 'test@example.com';

console.log('Test environment variables set up'); 