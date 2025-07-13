# Enrichment Workflow Integration with n8n Workflow 2

## Overview

This document describes the integration between the Enrichment module and n8n Workflow 2 (Lead Enrichment & Verification) for automated lead enrichment and verification processes.

## Architecture

### Components

1. **Enrichment Module** - Handles enrichment requests and webhook processing
2. **n8n Workflow 2** - External workflow for lead enrichment and verification
3. **Webhook Endpoint** - Receives completion notifications from n8n
4. **Auth Module** - Provides API key authentication for webhook security

### Security

- **API Key Authentication**: Webhook endpoints are protected using the `ApiKeyGuard` from the auth module
- **Environment Variable**: `ENRICHMENT_WEBHOOK_API_KEY` must be set for production
- **Header Validation**: Webhooks must include `x-api-key` or `authorization` header

## API Endpoints

### Webhook Endpoint

```
POST /api/enrichment/complete
```

**Authentication**: API Key (via `ApiKeyGuard` from auth module)
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "leadId": "string",
  "companyId": "string", 
  "enrichmentId": "string",
  "status": "COMPLETED|FAILED",
  "enrichedData": {
    "fullName": "string",
    "email": "string",
    "linkedinUrl": "string",
    "company": "string",
    "title": "string",
    "location": "string",
    "phone": "string",
    "verified": boolean
  },
  "verificationData": {
    "emailVerified": boolean,
    "linkedinVerified": boolean,
    "confidenceScore": number
  },
  "metadata": {
    "workflowExecutionId": "string",
    "processingTime": number,
    "provider": "string"
  }
}
```

**Response**:
```json
{
  "success": true
}
```

## Integration Flow

### 1. Trigger Enrichment

When a lead is created or enrichment is manually triggered:

```typescript
// In EnrichmentService
await this.triggerEnrichmentWorkflow(leadId, companyId);
```

### 2. n8n Workflow Processing

1. n8n receives the enrichment request
2. Performs lead enrichment using multiple providers
3. Verifies lead information
4. Sends completion webhook to our API

### 3. Webhook Processing

The webhook endpoint:

1. **Validates API Key** - Using `ApiKeyGuard` from auth module
2. **Validates Payload** - Ensures required fields are present
3. **Updates Lead** - Merges enriched data with existing lead
4. **Updates Enrichment Request** - Marks as completed/failed
5. **Triggers Events** - Notifies other systems of completion
6. **Audit Logging** - Records the enrichment completion

## Configuration

### Environment Variables

```bash
# Required for webhook authentication
ENRICHMENT_WEBHOOK_API_KEY=your-secure-api-key

# n8n workflow configuration
N8N_WORKFLOW_2_URL=https://your-n8n-instance.com/webhook/enrichment
N8N_WORKFLOW_2_API_KEY=your-n8n-api-key
```

### n8n Workflow Setup

1. **Webhook Trigger**: Configure to receive enrichment requests
2. **Enrichment Nodes**: Add Apollo, DropContact, Clearbit nodes
3. **Verification Nodes**: Add email and LinkedIn verification
4. **HTTP Request**: Send completion webhook to our API

## Error Handling

### Webhook Errors

- **401 Unauthorized**: Invalid or missing API key
- **400 Bad Request**: Invalid payload structure
- **404 Not Found**: Lead or enrichment request not found
- **500 Internal Server Error**: Processing error

### Retry Logic

- Failed enrichments can be retried manually
- Automatic retry with exponential backoff
- Provider fallback for failed requests

## Testing

### Manual Testing

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/enrichment/complete \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "leadId": "lead_123",
    "companyId": "company_456",
    "enrichmentId": "enrichment_789",
    "status": "COMPLETED",
    "enrichedData": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "title": "CEO",
      "company": "Example Corp"
    },
    "verificationData": {
      "emailVerified": true,
      "confidenceScore": 0.95
    }
  }'
```

### Integration Testing

Use the provided test script:

```bash
node test-enrichment-integration.js
```

## Monitoring

### Logs

- Enrichment requests and completions are logged
- Webhook processing events are tracked
- Error conditions are logged with context

### Metrics

- Enrichment success/failure rates
- Processing time statistics
- Provider performance metrics

## Security Considerations

1. **API Key Protection**: Store API keys securely in environment variables
2. **Request Validation**: Validate all webhook payloads
3. **Rate Limiting**: Implement rate limiting for webhook endpoints
4. **Audit Logging**: Log all webhook interactions for security
5. **Error Handling**: Don't expose sensitive information in error responses

## Next Steps

1. **Deploy API Key**: Set `ENRICHMENT_WEBHOOK_API_KEY` in production
2. **Configure n8n**: Set up Workflow 2 with proper webhook configuration
3. **Test Integration**: Run end-to-end tests with real data
4. **Monitor Performance**: Set up monitoring and alerting
5. **Scale**: Add additional enrichment providers as needed 