# n8n Workflow Integration Guide

This document provides a comprehensive guide for integrating n8n workflows with the NestJS backend for the cold email outreach platform.

## Overview

The system orchestrates four main n8n workflows that automate the entire cold email outreach process:

1. **Lead Validation and LinkedIn Scraping** - Validates leads and scrapes LinkedIn profiles
2. **Lead Enrichment and Verification** - Enriches lead data and verifies email addresses
3. **Email Drafting and Smartlead Sending** - Drafts personalized emails and sends via Smartlead
4. **Reply Handling and Meeting Scheduling** - Classifies replies and schedules meetings

## Architecture

### Backend Components

- **N8nController** (`/api/n8n/*`) - Handles webhook callbacks from n8n
- **LeadEventsService** - Orchestrates workflow triggering and chaining
- **WorkflowExecutionService** - Tracks workflow execution status and history
- **LeadService** - Integrates with workflow events for lead management

### Database Models

- **WorkflowExecution** - Tracks each workflow run with status, timing, and data
- **Lead** - Stores enriched lead data and status
- **EmailLog** - Records sent emails with Smartlead metadata
- **Reply** - Stores and classifies email replies
- **Booking** - Manages meeting scheduling via Calendly
- **AuditTrail** - Logs all workflow activities

## Workflow Integration Details

### 1. Lead Validation and LinkedIn Scraping

**Purpose**: Validates lead data, scrapes LinkedIn profiles, and structures data using AI.

**Trigger**: 
- When a lead is created with a LinkedIn URL
- Manual trigger via API endpoint

**Backend Actions**:
```typescript
// Triggered from LeadService.create() or update()
await this.leadEvents.triggerLinkedInScraping({
  id: lead.id,
  fullName: lead.fullName,
  email: lead.email,
  linkedinUrl: lead.linkedinUrl,
  companyId: lead.companyId,
  campaignId: lead.campaignId,
});
```

**Payload Structure**:
```json
{
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "leadId": "lead_123",
  "name": "John Doe",
  "email": "john@example.com",
  "companyId": "company_456",
  "campaignId": "campaign_789",
  "credentials": {
    "airtableApiKey": "key_123",
    "openRouterApiKey": "key_456",
    "scrapingBeeApiKey": "key_789"
  },
  "config": {
    "airtableBaseId": "base_123",
    "airtableTableName": "Leads",
    "backendLogUrl": "https://api.example.com/api/n8n/log",
    "backendCompleteUrl": "https://api.example.com/api/n8n/complete"
  },
  "prompts": {
    "structureDataPrompt": "Parse LinkedIn data into { leadId, name, email, company, jobTitle }"
  }
}
```

**Completion Handler**:
- Updates Lead with scraped data (name, email, company, jobTitle)
- Sets `verified: true` if email is found
- Triggers Lead Enrichment workflow

### 2. Lead Enrichment and Verification

**Purpose**: Enriches lead data with industry and company size, verifies email addresses.

**Trigger**: Completion callback from LinkedIn Scraping workflow

**Payload Structure**:
```json
{
  "leadId": "lead_123",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "jobTitle": "Senior Developer",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "companyId": "company_456",
  "campaignId": "campaign_789",
  "credentials": {
    "airtableApiKey": "key_123",
    "openRouterApiKey": "key_456",
    "emailVerificationApiKey": "key_789",
    "clearbitApiKey": "key_101"
  },
  "config": {
    "airtableBaseId": "base_123",
    "airtableTableName": "Leads",
    "backendLogUrl": "https://api.example.com/api/n8n/log",
    "backendCompleteUrl": "https://api.example.com/api/n8n/complete"
  },
  "prompts": {
    "enrichmentPrompt": "Enrich with industry and company size from web search"
  }
}
```

**Completion Handler**:
- Updates Lead with industry, companySize, emailVerified
- Creates EnrichmentRequest record for auditing
- Triggers Email Drafting workflow

### 3. Email Drafting and Smartlead Sending

**Purpose**: Drafts personalized emails using AI and sends via Smartlead.

**Trigger**: Completion callback from Lead Enrichment workflow

**Payload Structure**:
```json
{
  "leadId": "lead_123",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "jobTitle": "Senior Developer",
  "industry": "Technology",
  "companySize": "50-200",
  "emailVerified": true,
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "companyId": "company_456",
  "campaignId": "campaign_789",
  "campaignName": "Q1 Outreach",
  "credentials": {
    "airtableApiKey": "key_123",
    "openRouterApiKey": "key_456",
    "smartleadApiKey": "key_789"
  },
  "config": {
    "airtableBaseId": "base_123",
    "airtableTableName": "Leads",
    "backendLogUrl": "https://api.example.com/api/n8n/log",
    "backendCompleteUrl": "https://api.example.com/api/n8n/complete",
    "smartleadCampaignId": "campaign_123"
  },
  "prompts": {
    "emailDraftPrompt": "Draft a personalized cold email for outreach"
  }
}
```

**Completion Handler**:
- Creates EmailLog with Smartlead emailId
- Updates Lead status to CONTACTED
- No further workflow chaining

### 4. Reply Handling and Meeting Scheduling

**Purpose**: Classifies email replies and schedules meetings for positive responses.

**Trigger**: Smartlead webhook for email replies

**Webhook Endpoint**: `POST /api/n8n/replies/webhook`

**Payload Structure**:
```json
{
  "leadId": "lead_123",
  "emailId": "email_456",
  "replyId": "reply_789",
  "replyContent": "Hi, I'm interested in learning more...",
  "companyId": "company_456",
  "credentials": {
    "airtableApiKey": "key_123",
    "openRouterApiKey": "key_456",
    "calendlyApiKey": "key_789"
  },
  "config": {
    "airtableBaseId": "base_123",
    "airtableTableName": "Leads",
    "backendLogUrl": "https://api.example.com/api/n8n/log",
    "backendCompleteUrl": "https://api.example.com/api/n8n/complete",
    "calendlyEventTypeId": "event_123"
  },
  "prompts": {
    "classifyReplyPrompt": "Classify reply as INTERESTED, NOT_INTERESTED, AUTO_REPLY, UNSUBSCRIBE, or QUESTION",
    "meetingPrompt": "If interested, suggest a meeting and provide Calendly link"
  }
}
```

**Completion Handler**:
- Updates Reply with AI classification
- Creates Booking if meeting is scheduled
- Updates Lead status to BOOKED for positive replies
- Creates SystemNotification for sales team

## API Endpoints

### Workflow Completion
```
POST /api/n8n/complete
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "workflowId": "workflow_123",
  "leadId": "lead_456",
  "companyId": "company_789",
  "status": "SUCCESS",
  "outputData": { ... },
  "errorMessage": null
}
```

### Workflow Logging
```
POST /api/n8n/log
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "leadId": "lead_123",
  "companyId": "company_456",
  "nodeName": "LinkedIn Scraper",
  "outputData": { ... },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Smartlead Reply Webhook
```
POST /api/n8n/replies/webhook
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "leadId": "lead_123",
  "emailId": "email_456",
  "content": "Hi, I'm interested...",
  "companyId": "company_789"
}
```

## Environment Variables

### Required n8n Configuration
```bash
# n8n Webhook URLs
N8N_LEAD_VALIDATION_WEBHOOK=https://your-n8n-instance.app.n8n.cloud/webhook/lead-validation
N8N_ENRICHMENT_WEBHOOK=https://your-n8n-instance.app.n8n.cloud/webhook/enrichment
N8N_EMAIL_SENDING_WEBHOOK=https://your-n8n-instance.app.n8n.cloud/webhook/email-sending
N8N_REPLY_HANDLING_WEBHOOK=https://your-n8n-instance.app.n8n.cloud/webhook/reply-handling

# n8n Workflow IDs
N8N_LEAD_VALIDATION_WORKFLOW_ID=lead-validation-workflow-id
N8N_ENRICHMENT_WORKFLOW_ID=enrichment-workflow-id
N8N_EMAIL_SENDING_WORKFLOW_ID=email-sending-workflow-id
N8N_REPLY_HANDLING_WORKFLOW_ID=reply-handling-workflow-id

# Backend URLs
BACKEND_URL=https://api.example.com
```

### Third-party API Keys
```bash
# Airtable
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_TABLE_NAME=your-airtable-table-name

# AI and Scraping
OPENROUTER_API_KEY=your-openrouter-api-key
SCRAPINGBEE_API_KEY=your-scrapingbee-api-key
NEVERBOUNCE_API_KEY=your-neverbounce-api-key
CLEARBIT_API_KEY=your-clearbit-api-key

# Email and Scheduling
SMARTLEAD_API_KEY=your-smartlead-api-key
SMARTLEAD_CAMPAIGN_ID=your-smartlead-campaign-id
CALENDLY_API_KEY=your-calendly-api-key
CALENDLY_EVENT_TYPE_ID=your-calendly-event-type-id
```

## Security Considerations

### Authentication
- All n8n webhook endpoints require JWT authentication
- Validate companyId against authenticated user's company
- Log unauthorized access attempts to AuditTrail

### Data Validation
- Validate all required fields in webhook payloads
- Ensure lead belongs to the authenticated company
- Sanitize and validate all input data

### Error Handling
- Implement retry logic for failed workflows
- Log all errors to AuditTrail
- Create system notifications for critical failures
- Graceful degradation when third-party services are unavailable

## Monitoring and Debugging

### Workflow Execution Tracking
```typescript
// Get workflow execution stats
const stats = await this.workflowExecutionService.getExecutionStats(companyId);

// Find pending executions
const pending = await this.workflowExecutionService.findPendingExecutions(leadId, companyId);

// Retry failed execution
await this.workflowExecutionService.retryExecution(executionId, companyId);
```

### Audit Trail
All workflow activities are logged to the AuditTrail table:
- Workflow starts and completions
- Node-level logs from n8n
- Error messages and retries
- Status changes and data updates

### System Notifications
Critical events trigger system notifications:
- Workflow failures
- Positive reply received
- Meeting scheduled
- Data enrichment completed

## Testing

### Manual Workflow Testing
```bash
# Test LinkedIn scraping
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "campaignId": "campaign_123"
  }'

# Test workflow completion
curl -X POST http://localhost:3000/api/n8n/complete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "workflow_123",
    "leadId": "lead_456",
    "companyId": "company_789",
    "status": "SUCCESS",
    "outputData": {
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "jobTitle": "Senior Developer"
    }
  }'
```

### Integration Testing
- Test workflow chaining end-to-end
- Verify data consistency across all models
- Test error handling and retry logic
- Validate security and authentication

## Troubleshooting

### Common Issues

1. **Workflow not triggering**
   - Check environment variables are set correctly
   - Verify n8n webhook URLs are accessible
   - Check authentication tokens

2. **Workflow completion not received**
   - Verify backendCompleteUrl is correct
   - Check network connectivity between n8n and backend
   - Review n8n workflow logs for errors

3. **Data not updating**
   - Check workflow execution status in database
   - Verify payload structure matches expected format
   - Review error logs for validation failures

4. **Authentication errors**
   - Verify JWT tokens are valid
   - Check companyId matches authenticated user
   - Review AuditTrail for unauthorized access attempts

### Debug Commands
```bash
# Check workflow execution status
SELECT * FROM "WorkflowExecution" WHERE "leadId" = 'lead_123' ORDER BY "startTime" DESC;

# View audit trail
SELECT * FROM "AuditTrail" WHERE "entityId" = 'lead_123' ORDER BY "timestamp" DESC;

# Check system notifications
SELECT * FROM "SystemNotification" WHERE "companyId" = 'company_123' ORDER BY "createdAt" DESC;
```

## Best Practices

1. **Idempotency**: Ensure workflows can be safely retried
2. **Error Recovery**: Implement graceful error handling and recovery
3. **Monitoring**: Set up alerts for workflow failures and performance issues
4. **Security**: Regularly rotate API keys and review access logs
5. **Testing**: Test workflows in staging environment before production
6. **Documentation**: Keep workflow documentation updated with any changes
7. **Backup**: Regularly backup workflow configurations and execution data 