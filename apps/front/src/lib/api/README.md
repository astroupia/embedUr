# Frontend API Client

A clean, comprehensive Axios-based API client for the NestJS backend. This client provides a well-structured interface for all backend operations with proper TypeScript support.

## Features

- ✅ **Type-safe**: Full TypeScript support with proper interfaces
- ✅ **Modular**: Organized into domain-specific API modules
- ✅ **Clean Architecture**: Follows repository pattern principles
- ✅ **Error Handling**: Consistent error handling across all endpoints
- ✅ **Authentication**: Automatic token management
- ✅ **Pagination**: Cursor-based pagination support
- ✅ **Comprehensive**: Covers all backend endpoints

## Quick Start

```typescript
import { auth, leads, campaigns, workflows } from '@/lib/api';

// Authentication
const loginResponse = await auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Create a lead
const newLead = await leads.create({
  fullName: 'John Doe',
  email: 'john@example.com',
  campaignId: 'campaign_123'
});

// Get campaigns with pagination
const campaignsResponse = await campaigns.getAll({
  take: 20,
  status: 'ACTIVE'
});
```

## API Modules

### Authentication (`auth`)
```typescript
import { auth } from '@/lib/api';

// Register new user and company
await auth.register({
  email: 'user@example.com',
  password: 'password123',
  companyName: 'My Company',
  firstName: 'John',
  lastName: 'Doe'
});

// Login
const response = await auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Refresh token
await auth.refreshToken({
  refreshToken: 'refresh_token_here'
});

// Logout
await auth.logout({
  refreshToken: 'refresh_token_here'
});

// Email verification
await auth.verifyEmail('verification_token');

// Password reset
await auth.forgotPassword('user@example.com');
await auth.resetPassword('reset_token', 'new_password');
```

### Leads (`leads`)
```typescript
import { leads } from '@/lib/api';

// Create lead
const lead = await leads.create({
  fullName: 'John Doe',
  email: 'john@example.com',
  linkedinUrl: 'https://linkedin.com/in/johndoe',
  campaignId: 'campaign_123'
});

// Get all leads with filtering
const leadsResponse = await leads.getAll({
  take: 20,
  status: 'NEW',
  search: 'john',
  campaignId: 'campaign_123'
});

// Get specific lead
const lead = await leads.getById('lead_123');

// Update lead
await leads.update('lead_123', {
  status: 'CONTACTED',
  enrichmentData: { company: 'Tech Corp' }
});

// Delete lead
await leads.delete('lead_123');
```

### Campaigns (`campaigns`)
```typescript
import { campaigns } from '@/lib/api';

// Create campaign
const campaign = await campaigns.create({
  name: 'Q1 Outreach',
  description: 'First quarter outreach campaign',
  aiPersonaId: 'persona_123',
  workflowId: 'workflow_123'
});

// Get all campaigns
const campaignsResponse = await campaigns.getAll({
  take: 20,
  status: 'ACTIVE'
});

// Update campaign
await campaigns.update('campaign_123', {
  status: 'PAUSED'
});
```

### Workflows (`workflows`)
```typescript
import { workflows } from '@/lib/api';

// Create workflow
const workflow = await workflows.create({
  name: 'Lead Enrichment',
  type: 'ENRICHMENT',
  n8nWorkflowId: 'n8n_workflow_123'
});

// Execute workflow
const execution = await workflows.execute('workflow_123', {
  inputData: { leadId: 'lead_123' },
  leadId: 'lead_123'
});

// Get executions
const executions = await workflows.getExecutions({
  workflowId: 'workflow_123',
  status: 'COMPLETED'
});
```

### Replies (`replies`)
```typescript
import { replies } from '@/lib/api';

// Create reply
const reply = await replies.create({
  content: 'Thank you for your interest!',
  leadId: 'lead_123',
  emailLogId: 'email_123',
  source: 'EMAIL'
});

// Get replies with filtering
const repliesResponse = await replies.getAll({
  classification: 'INTERESTED',
  leadId: 'lead_123'
});
```

### Bookings (`bookings`)
```typescript
import { bookings } from '@/lib/api';

// Create booking
const booking = await bookings.create({
  calendlyLink: 'https://calendly.com/meeting',
  scheduledTime: '2024-01-15T10:00:00Z',
  leadId: 'lead_123'
});

// Reschedule booking
await bookings.reschedule('booking_123', {
  scheduledTime: '2024-01-16T14:00:00Z'
});

// Cancel booking
await bookings.cancel('booking_123', {
  reason: 'Client requested cancellation'
});
```

### AI Personas (`aiPersonas`)
```typescript
import { aiPersonas } from '@/lib/api';

// Create AI persona
const persona = await aiPersonas.create({
  name: 'Sales Rep',
  description: 'Professional sales representative',
  prompt: 'You are a professional sales representative...',
  parameters: { tone: 'professional' }
});

// Get all personas
const personas = await aiPersonas.getAll();
```

### Enrichment (`enrichment`)
```typescript
import { enrichment } from '@/lib/api';

// Trigger enrichment
const enrichmentRequest = await enrichment.trigger({
  leadId: 'lead_123',
  provider: 'APOLLO'
});

// Get enrichment requests
const requests = await enrichment.getAll({
  status: 'COMPLETED',
  leadId: 'lead_123'
});

// Retry failed enrichment
await enrichment.retry({
  enrichmentId: 'enrichment_123'
});
```

### Usage Metrics (`usageMetrics`)
```typescript
import { usageMetrics } from '@/lib/api';

// Create usage metric
await usageMetrics.create({
  metricName: 'LEADS_CREATED',
  value: 1,
  period: '2024-01'
});

// Get usage overview
const overview = await usageMetrics.getOverview();
```

### Admin (`admin`)
```typescript
import { admin } from '@/lib/api';

// Get admin action logs
const logs = await admin.getActionLogs({
  action: 'USER_CREATED',
  startDate: '2024-01-01'
});

// Update company status
await admin.updateCompanyStatus('company_123', {
  status: 'SUSPENDED'
});

// Get global metrics
const globalMetrics = await admin.getGlobalMetricsSummary();
```

## Types

All TypeScript interfaces are exported from the main module:

```typescript
import type {
  Lead,
  Campaign,
  Workflow,
  User,
  Company,
  PaginatedResponse,
  // ... and many more
} from '@/lib/api';
```

## Error Handling

The API client provides consistent error handling:

```typescript
try {
  const lead = await leads.create(leadData);
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
  }
}
```

## Configuration

The API client uses the following environment variables:

- `NEXT_PUBLIC_API_URL`: Base URL for the API (defaults to `http://localhost:8000`)

## Architecture

The API client follows clean architecture principles:

1. **Base Client** (`client.ts`): Core Axios instance with authentication and error handling
2. **Domain Modules**: Separate modules for each domain (auth, leads, campaigns, etc.)
3. **Type Safety**: Comprehensive TypeScript interfaces for all requests and responses
4. **Singleton Pattern**: Shared instances for easy use across the application

## Best Practices

1. **Use the modular API**: Import specific modules instead of the base client
2. **Handle errors**: Always wrap API calls in try-catch blocks
3. **Type your data**: Use the provided TypeScript interfaces
4. **Use pagination**: For large datasets, use cursor-based pagination
5. **Manage authentication**: The client automatically handles token management

## Examples

### Complete Lead Management Flow
```typescript
import { leads, enrichment, replies, bookings } from '@/lib/api';

// 1. Create a lead
const lead = await leads.create({
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  campaignId: 'campaign_123'
});

// 2. Enrich the lead
const enrichmentRequest = await enrichment.trigger({
  leadId: lead.id,
  provider: 'APOLLO'
});

// 3. Handle a reply
const reply = await replies.create({
  content: 'I would love to learn more!',
  leadId: lead.id,
  emailLogId: 'email_123',
  classification: 'INTERESTED'
});

// 4. Schedule a meeting
const booking = await bookings.create({
  calendlyLink: 'https://calendly.com/meeting',
  scheduledTime: '2024-01-20T15:00:00Z',
  leadId: lead.id,
  replyId: reply.id
});
```

This API client provides a clean, type-safe, and comprehensive interface to your NestJS backend, making it easy to build robust frontend applications. 