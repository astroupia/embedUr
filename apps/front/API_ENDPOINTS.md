# API Endpoints Documentation

This document outlines the API endpoints that the frontend expects from the NestJS backend.

## Environment Variables

The frontend expects the following environment variable to be set:

```env
NESTJS_BACKEND_URL=http://localhost:3001
```

## Endpoints

### 1. Create Company with Admin User

**Endpoint:** `POST /api/companies/create-with-admin`

**Description:** Creates a new company and its associated admin user in a single transaction.

**Request Body:**
```typescript
{
  company: {
    name: string;                    // Required: Company name
    schemaName: string;              // Required: Unique schema name (auto-generated)
    email: string;                   // Required: Primary contact email for company
    industry: string;                // Required: Industry type
    employees: number;               // Required: Number of employees
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_DELETION'; // Default: 'ACTIVE'
    planId?: string | null;          // Optional: Plan ID
    location?: string | null;        // Optional: Company location
    website?: string | null;         // Optional: Company website
    description?: string | null;     // Optional: Company description
    logoUrl?: string | null;         // Optional: Company logo URL
    bannerUrl?: string | null;       // Optional: Company banner URL
    revenue?: number | null;         // Optional: Company revenue
    linkedinUsername?: string | null; // Optional: LinkedIn username
    twitterUsername?: string | null;  // Optional: Twitter username
    facebookUsername?: string | null; // Optional: Facebook username
    instagramUsername?: string | null; // Optional: Instagram username
  },
  user: {
    email: string;                   // Required: User email (same as company email)
    firstName: string;               // Required: User first name (company name)
    lastName: string;                // Required: User last name (hardcoded as 'Admin')
    password: string;                // Required: User password (min 8 chars)
    isVerified?: boolean;            // Optional: Default false
    role?: 'ADMIN' | 'MEMBER' | 'READ_ONLY'; // Optional: Default 'ADMIN'
    linkedinUrl?: string | null;     // Optional: LinkedIn URL
    profileUrl?: string | null;      // Optional: Profile URL
    twitterUsername?: string | null; // Optional: Twitter username
    facebookUsername?: string | null; // Optional: Facebook username
    instagramUsername?: string | null; // Optional: Instagram username
  }
}
```

**Response (Success - 201):**
```typescript
{
  message: string;                   // Success message
  companyId: string;                 // Created company ID
  userId: string;                    // Created user ID
}
```

**Response (Error - 400/500):**
```typescript
{
  message: string;                   // Error message
  errors?: Array<{                   // Validation errors (if applicable)
    field: string;
    message: string;
  }>;
}
```

### 2. Join Company (Create User)

**Endpoint:** `POST /api/auth/join`

**Description:** Creates a new user account using an invite code to join an existing company.

**Request Body:**
```typescript
{
  email: string;                     // Required: User email
  password: string;                  // Required: User password (min 8 chars)
  invite_code: string;               // Required: Invite code to join company
}
```

**Response (Success - 201):**
```typescript
{
  message: string;                   // Success message
  userId: string;                    // Created user ID
  companyId: string;                 // Company ID user joined
}
```

**Response (Error - 400/500):**
```typescript
{
  message: string;                   // Error message
  errors?: Array<{                   // Validation errors (if applicable)
    field: string;
    message: string;
  }>;
}
```

## Implementation Notes

### Company Creation Flow

1. **Schema Name Generation:** The frontend generates a unique `schemaName` by:
   - Cleaning the company name (removing special characters)
   - Converting to lowercase
   - Appending a random 6-character suffix

2. **User Role:** The first user created with a company is automatically assigned the `ADMIN` role.

3. **Email Consistency:** The user's email is used as both the user's email and the company's primary contact email.

4. **Employee Count:** The frontend sends employee ranges (e.g., "1-10", "11-50") which should be converted to numeric values in the backend.

### Validation Requirements

- **Email:** Must be a valid email format and unique across all users
- **Password:** Minimum 8 characters
- **Company Name:** Must be unique across all companies
- **Schema Name:** Must be unique across all companies
- **Industry:** Must be one of the predefined values
- **Employees:** Must be a positive integer

### Error Handling

The backend should return appropriate HTTP status codes:
- `201` for successful creation
- `400` for validation errors or business logic errors
- `409` for conflicts (duplicate email, company name, etc.)
- `500` for internal server errors

### Security Considerations

1. **Password Hashing:** Passwords should be hashed using bcrypt or similar
2. **Input Validation:** All inputs should be validated and sanitized
3. **Rate Limiting:** Consider implementing rate limiting for registration endpoints
4. **CORS:** Ensure proper CORS configuration for frontend-backend communication

## Example Implementation

Here's a basic example of how the NestJS controller might look:

```typescript
@Post('create-with-admin')
async createCompanyWithAdmin(@Body() createCompanyDto: CreateCompanyDto) {
  try {
    const result = await this.companyService.createWithAdmin(createCompanyDto);
    return {
      message: 'Company and admin user created successfully',
      companyId: result.companyId,
      userId: result.userId,
    };
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('Company name or email already exists');
    }
    throw new InternalServerErrorException('Failed to create company');
  }
}
``` 