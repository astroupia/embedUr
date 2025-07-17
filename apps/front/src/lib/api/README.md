# API Client Documentation

This directory contains the API client for communicating with the backend NestJS API.

## Available APIs

- **AuthAPI** - Authentication and user management
- **LeadsAPI** - Lead management and operations
- **CampaignsAPI** - Campaign management
- **WorkflowsAPI** - Workflow execution and management
- **RepliesAPI** - Reply management
- **BookingsAPI** - Booking management
- **AIPersonasAPI** - AI persona management
- **EnrichmentAPI** - Lead enrichment operations
- **UsageMetricsAPI** - Usage metrics and analytics
- **AdminAPI** - Admin operations
- **TargetAudienceTranslatorAPI** - Target audience translation and AI processing

## Quick Start

```typescript
import { 
  auth, 
  leads, 
  campaigns, 
  workflows, 
  replies, 
  bookings, 
  aiPersonas, 
  enrichment, 
  usageMetrics, 
  admin,
  targetAudienceTranslator 
} from '@/lib/api';

// Set authentication token
auth.setAccessToken('your-jwt-token');

// Use any API
const campaigns = await campaigns.getAll();
const newLead = await leads.create({ /* lead data */ });
```

## Target Audience Translator API

The Target Audience Translator API allows you to convert natural language descriptions of target audiences into structured lead data and enrichment requirements.

### Basic Usage

```typescript
import { targetAudienceTranslator, InputFormat } from '@/lib/api';

// Create a translation with free text
const translation = await targetAudienceTranslator.createWithFreeText(
  "I want to target CTOs at B2B SaaS companies in Europe with 50-200 employees that are VC-backed."
);

// Poll for completion
const completedTranslation = await targetAudienceTranslator.pollForCompletion(translation.id);

// Access results
console.log('Generated leads:', completedTranslation.leads);
console.log('Enrichment schema:', completedTranslation.enrichmentSchema);
console.log('Confidence score:', completedTranslation.confidence);
```

### Input Formats

#### 1. Free Text (Natural Language)
```typescript
const translation = await targetAudienceTranslator.createWithFreeText(
  "Target marketing managers at e-commerce startups in New York with Series A funding"
);
```

#### 2. Structured JSON
```typescript
const translation = await targetAudienceTranslator.createWithStructuredJson(
  JSON.stringify({
    jobTitles: ["CTO", "VP Engineering"],
    industries: ["B2B SaaS"],
    location: "Europe",
    companySize: "50-200 employees",
    fundingStatus: "VC-backed"
  })
);
```

#### 3. CSV Upload
```typescript
const csvData = `jobTitle,industry,location,companySize
CTO,B2B SaaS,London,50-200
VP Engineering,Technology,Berlin,100-500`;

const translation = await targetAudienceTranslator.createWithCsvUpload(csvData);
```

#### 4. Form Input
```typescript
const formData = {
  jobTitles: ["CEO"],
  industries: ["Finance"],
  location: "New York"
};

const translation = await targetAudienceTranslator.createWithFormInput(formData);
```

### Advanced Usage

#### Get Statistics
```typescript
const stats = await targetAudienceTranslator.getStats();
console.log('Total translations:', stats.total);
console.log('Success rate:', stats.successful / stats.total);
```

#### Filter by Status
```typescript
const pendingTranslations = await targetAudienceTranslator.getByStatus('PENDING');
const successfulTranslations = await targetAudienceTranslator.getByStatus('SUCCESS');
```

#### Filter by Input Format
```typescript
const freeTextTranslations = await targetAudienceTranslator.getByFormat(InputFormat.FREE_TEXT);
const csvTranslations = await targetAudienceTranslator.getByFormat(InputFormat.CSV_UPLOAD);
```

#### Retry Failed Translations
```typescript
const failedTranslation = await targetAudienceTranslator.getById('translation-id');
if (failedTranslation.status === 'FAILED') {
  const retryTranslation = await targetAudienceTranslator.retry(failedTranslation.id);
}
```

### Response Structure

```typescript
interface TargetAudienceTranslator {
  id: string;
  inputFormat: InputFormat;
  targetAudienceData: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  leads?: GeneratedLead[];           // Generated sample leads
  enrichmentSchema?: EnrichmentSchema; // Required/optional fields for enrichment
  interpretedCriteria?: InterpretedCriteria; // Extracted targeting criteria
  reasoning?: string;                // AI reasoning for the interpretation
  confidence?: number;               // Confidence score (0-1)
  errorMessage?: string;             // Error message if failed
  createdAt: Date;
  updatedAt: Date;
}
```

### Integration with Campaigns

The target audience translator is designed to integrate seamlessly with the campaign creation workflow:

```typescript
// 1. Define target audience
const translation = await targetAudienceTranslator.createWithFreeText(
  "Target CTOs at B2B SaaS companies"
);

// 2. Wait for processing
const completedTranslation = await targetAudienceTranslator.pollForCompletion(translation.id);

// 3. Create campaign with generated data
const campaign = await campaigns.create({
  name: "CTO Outreach Campaign",
  description: "Targeting CTOs based on AI analysis",
  // The generated leads and enrichment schema can be used
  // to configure the campaign's targeting and enrichment
});
```

## Error Handling

All API methods throw errors that include:
- `message`: Human-readable error message
- `statusCode`: HTTP status code
- `error`: Additional error details

```typescript
try {
  const translation = await targetAudienceTranslator.createWithFreeText("invalid input");
} catch (error) {
  console.error('Translation failed:', error.message);
  // Handle error appropriately
}
```

## Authentication

All API calls require authentication. Set the JWT token:

```typescript
import { auth } from '@/lib/api';

// After login
auth.setAccessToken(loginResponse.accessToken);

// Clear on logout
auth.clearAuth();
```

## Pagination

Most list endpoints support cursor-based pagination:

```typescript
const firstPage = await targetAudienceTranslator.getAll({ take: 20 });
const nextPage = await targetAudienceTranslator.getAll({ 
  take: 20, 
  cursor: firstPage.nextCursor 
});
```

## TypeScript Support

All APIs are fully typed with TypeScript interfaces. Import types as needed:

```typescript
import type { 
  TargetAudienceTranslator, 
  CreateTargetAudienceTranslatorRequest,
  InputFormat 
} from '@/lib/api';
``` 