# Target Audience Translator (Workflow 0) - Implementation Guide

## Overview

The Target Audience Translator is a new "Workflow 0" that comes before Workflow 1 (Lead Enrichment). It allows users to define their target audience in natural language or structured formats, and uses AI to interpret this into structured lead data and enrichment requirements.

## Architecture

### Clean Architecture Implementation

The implementation follows the clean architecture pattern with proper separation of concerns:

```
src/workflows/
├── dto/
│   └── target-audience-translator.dto.ts          # Data Transfer Objects
├── entities/
│   └── target-audience-translator.entity.ts       # Business entities
├── repositories/
│   └── target-audience-translator.repository.ts   # Data access layer
├── services/
│   ├── target-audience-translator.service.ts      # Main business logic
│   ├── target-audience-translator-ai.service.ts   # AI processing logic
│   └── target-audience-translator-events.service.ts # Event logging
└── controllers/
    └── target-audience-translator.controller.ts   # API endpoints
```

## Database Schema

### New Prisma Model

```prisma
model TargetAudienceTranslator {
  id                  String      @id @default(cuid())
  inputFormat         InputFormat
  targetAudienceData  String
  structuredData      Json?
  config              Json?
  leads               Json?
  enrichmentSchema    Json?
  interpretedCriteria Json?
  reasoning           String?
  confidence          Float?
  status              String      @default("PENDING")
  errorMessage        String?
  companyId           String
  createdBy           String
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  @@index([companyId])
  @@index([status])
  @@index([inputFormat])
  @@schema("public")
}

enum InputFormat {
  FREE_TEXT
  STRUCTURED_JSON
  CSV_UPLOAD
  FORM_INPUT

  @@schema("public")
}
```

## API Endpoints

### Core Endpoints

- `POST /target-audience-translator` - Create new translation request
- `GET /target-audience-translator` - List translations with pagination
- `GET /target-audience-translator/:id` - Get specific translation
- `GET /target-audience-translator/stats` - Get statistics
- `GET /target-audience-translator/status/:status` - Filter by status
- `GET /target-audience-translator/format/:format` - Filter by input format
- `POST /target-audience-translator/:id/retry` - Retry failed translation

## Input Formats Supported

### 1. Free Text (Natural Language)

**Example:**
```json
{
  "inputFormat": "FREE_TEXT",
  "targetAudienceData": "I want to target CTOs at B2B SaaS companies in Europe with 50-200 employees that are VC-backed."
}
```

**AI Processing:**
- Uses natural language processing to extract structured criteria
- Identifies job titles, industries, locations, company characteristics
- Generates confidence score based on clarity of input

### 2. Structured JSON

**Example:**
```json
{
  "inputFormat": "STRUCTURED_JSON",
  "targetAudienceData": "{\"jobTitles\":[\"CTO\",\"VP Engineering\"],\"industries\":[\"B2B SaaS\"],\"location\":\"Europe\",\"companySize\":\"50-200 employees\",\"fundingStatus\":\"VC-backed\"}"
}
```

**Processing:**
- Direct interpretation of structured data
- No AI processing required
- High confidence score

### 3. CSV Upload

**Example:**
```json
{
  "inputFormat": "CSV_UPLOAD",
  "targetAudienceData": "jobTitle,industry,location,companySize\nCTO,B2B SaaS,London,50-200\nVP Engineering,Technology,Berlin,100-500"
}
```

**Processing:**
- Parses CSV headers and data
- Extracts unique values for each column
- Maps to structured criteria

### 4. Form Input

**Example:**
```json
{
  "inputFormat": "FORM_INPUT",
  "targetAudienceData": "{\"jobTitles\":[\"CEO\"],\"industries\":[\"Finance\"],\"location\":\"New York\"}"
}
```

**Processing:**
- Similar to structured JSON
- Designed for future GUI form integration

## AI Processing Pipeline

### Step 1: Input Interpretation

The AI service processes different input formats:

```typescript
async processTargetAudience(
  inputFormat: InputFormat,
  targetAudienceData: string,
  structuredData?: StructuredTargetingData,
  config?: Record<string, any>,
): Promise<{
  leads: GeneratedLead[];
  enrichmentSchema: EnrichmentSchema;
  interpretedCriteria: InterpretedCriteria;
  reasoning: string;
  confidence: number;
}>
```

### Step 2: Enrichment Schema Generation

Based on interpreted criteria, the system generates an enrichment schema:

```typescript
interface EnrichmentSchema {
  requiredFields: EnrichmentField[];    // Must have for enrichment
  optionalFields: EnrichmentField[];    // Nice to have
  conditionalFields?: EnrichmentField[]; // Required based on criteria
}
```

**Example Schema:**
```json
{
  "requiredFields": [
    {"name": "fullName", "type": "REQUIRED", "description": "Full name of the person"},
    {"name": "email", "type": "REQUIRED", "description": "Email address"}
  ],
  "optionalFields": [
    {"name": "linkedinUrl", "type": "OPTIONAL", "description": "LinkedIn profile URL"},
    {"name": "jobTitle", "type": "OPTIONAL", "description": "Job title or position"}
  ],
  "conditionalFields": [
    {"name": "jobTitle", "type": "CONDITIONAL", "description": "Job title (required for this targeting criteria)"}
  ]
}
```

### Step 3: Sample Lead Generation

The system generates sample leads based on the criteria:

```typescript
interface GeneratedLead {
  fullName?: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  linkedinUrl?: string;
  email?: string;
  additionalData?: Record<string, any>;
}
```

### Step 4: Confidence Scoring

The system calculates a confidence score (0-1) based on:
- Specificity of criteria
- Completeness of data
- Number of sample leads generated
- Quality of enrichment schema

## Output for Workflow 1

The Target Audience Translator outputs structured data that feeds directly into Workflow 1 (Lead Enrichment):

```typescript
{
  leads: [
    {
      fullName: "Sample Lead 1",
      jobTitle: "CTO",
      companyName: "Sample B2B SaaS Company 1",
      location: "Europe",
      additionalData: {
        industry: "B2B SaaS",
        companySize: "50-200 employees",
        fundingStatus: "VC-backed"
      }
    }
  ],
  enrichmentSchema: {
    requiredFields: [...],
    optionalFields: [...],
    conditionalFields: [...]
  },
  interpretedCriteria: {
    jobTitles: ["CTO", "VP Engineering"],
    industries: ["B2B SaaS"],
    location: "Europe",
    companySize: "50-200 employees",
    fundingStatus: "VC-backed"
  },
  reasoning: "Based on the description, I identified key targeting criteria...",
  confidence: 0.85
}
```

## Workflow Integration

### Integration with Existing Workflows

1. **Workflow 0** (Target Audience Translator) → Generates structured lead data
2. **Workflow 1** (Lead Enrichment) → Enriches the generated leads
3. **Workflow 2** (Email Sequence) → Sends targeted campaigns
4. **Workflow 3** (Lead Routing) → Routes leads to appropriate sales reps

### Event Flow

```typescript
// Workflow 0 creates translation request
await targetAudienceTranslatorService.create(dto, companyId, userId);

// AI processes the request asynchronously
// Updates status: PENDING → PROCESSING → SUCCESS/FAILED

// Output feeds into Workflow 1
const enrichmentInput = {
  leads: translation.leads,
  enrichmentSchema: translation.enrichmentSchema,
  criteria: translation.interpretedCriteria
};
```

## Business Logic

### Status Management

- **PENDING**: Request created, waiting for processing
- **PROCESSING**: AI is currently processing the request
- **SUCCESS**: Processing completed successfully
- **FAILED**: Processing failed with error

### Retry Logic

- Failed translations can be retried
- Creates new translation request with same input data
- Maintains audit trail of retry attempts

### Validation Rules

- Free text must be at least 10 characters
- JSON must be valid format
- CSV must have header row and at least one data row
- All input formats require non-empty target audience data

## Testing

### Integration Tests

The implementation includes comprehensive integration tests:

```typescript
describe('Target Audience Translator Integration (e2e)', () => {
  // CRUD operations
  // Input validation
  // Authentication
  // Error handling
});
```

### Test Coverage

- ✅ Free text processing
- ✅ Structured JSON processing
- ✅ CSV processing
- ✅ Pagination and filtering
- ✅ Statistics and reporting
- ✅ Error handling and validation
- ✅ Authentication and authorization

## Usage Examples

### Example 1: Natural Language Input

```bash
curl -X POST /target-audience-translator \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "inputFormat": "FREE_TEXT",
    "targetAudienceData": "I want to target mid-level marketers in VC-funded e-commerce startups in New York."
  }'
```

### Example 2: Structured Input

```bash
curl -X POST /target-audience-translator \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "inputFormat": "STRUCTURED_JSON",
    "targetAudienceData": "{\"jobTitles\":[\"Marketing Manager\",\"Head of Growth\"],\"industries\":[\"E-commerce\"],\"location\":\"New York\",\"fundingStatus\":\"VC-backed\"}"
  }'
```

### Example 3: CSV Upload

```bash
curl -X POST /target-audience-translator \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "inputFormat": "CSV_UPLOAD",
    "targetAudienceData": "jobTitle,industry,location\nMarketing Manager,E-commerce,New York\nHead of Growth,Technology,San Francisco"
  }'
```

## Future Enhancements

### Planned Features

1. **Real AI Integration**: Replace mock AI with OpenAI/Anthropic
2. **GUI Form Interface**: Web-based form for easier input
3. **Bulk Processing**: Handle multiple translation requests
4. **Advanced Analytics**: Detailed processing metrics
5. **Template System**: Save and reuse common targeting criteria

### Integration Opportunities

1. **Lead Generation APIs**: Direct integration with Apollo, Clearbit
2. **CRM Integration**: Push generated leads to Salesforce, HubSpot
3. **Marketing Automation**: Direct integration with email platforms
4. **Analytics Dashboard**: Real-time processing metrics

## Conclusion

The Target Audience Translator (Workflow 0) provides a powerful, user-friendly way to convert high-level targeting requirements into structured lead data. It bridges the gap between business requirements and technical implementation, making lead generation more accessible and efficient.

The implementation follows clean architecture principles, provides comprehensive API coverage, and includes robust testing. It's designed to scale and integrate seamlessly with the existing workflow system. 