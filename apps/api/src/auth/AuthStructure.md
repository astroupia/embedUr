# Auth Module — Prisma-Based Implementation

This module provides complete authentication functionality using **Prisma**, **PostgreSQL**, and **NestJS**.

## Features

- ✅ Company + User registration
- ✅ JWT access + refresh tokens
- ✅ Session-based refresh token storage
- ✅ Email verification
- ✅ Password reset
- ✅ Role-based access control
- ✅ Secure password hashing with bcrypt
- ✅ Email delivery via SendGrid

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user and company
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user (requires auth)

### Email Verification

- `GET /auth/verify?token=...` - Verify email address

### Password Management

- `POST /auth/password/forgot` - Request password reset
- `POST /auth/password/reset` - Reset password with token

## Environment Variables

Add these to your `.env` file:

```env
# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
MAIL_FROM=noreply@yourdomain.com

# App URL
APP_URL=http://localhost:3000
```

## Database Schema

The module uses these Prisma models:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  password  String
  role      UserRole @default(MEMBER)
  companyId String
  // ... other fields
  sessions  Session[]
  emailVerifications EmailVerification[]
  passwordResets PasswordReset[]
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String
  ip           String
  userAgent    String
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model EmailVerification {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordReset {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Usage Examples

### Register a new user and company

```typescript
// POST /auth/register
{
  "companyName": "Acme Corp",
  "email": "john@acme.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}

// Response
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "clx123...",
    "email": "john@acme.com",
    "firstName": "John",
    "lastName": "Doe",
    "companyId": "clx456..."
  }
}
```

### Login

```typescript
// POST /auth/login
{
  "email": "john@acme.com",
  "password": "securepassword123"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123...",
    "email": "john@acme.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "MEMBER",
    "companyId": "clx456..."
  }
}
```

### Refresh token

```typescript
// POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Forgot password

```typescript
// POST /auth/password/forgot
{
  "email": "john@acme.com"
}

// Response
{
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

### Reset password

```typescript
// POST /auth/password/reset
{
  "token": "abc123...",
  "newPassword": "newsecurepassword123"
}

// Response
{
  "message": "Password reset successfully"
}
```

## Security Features

- **Password Hashing**: Uses bcrypt with salt rounds of 12
- **JWT Tokens**: Separate access (15min) and refresh (7 days) tokens
- **Session Management**: Refresh tokens stored in database with IP and user agent
- **Token Expiration**: All tokens have configurable expiration times
- **Email Verification**: Required for new accounts
- **Password Reset**: Secure token-based password reset
- **Rate Limiting**: Can be added via NestJS interceptors

## Testing

The module includes comprehensive unit tests for:

- Password validation
- Token generation and validation
- Email verification flow
- Password reset flow
- Session management

## Dependencies

- `@nestjs/jwt` - JWT handling
- `@nestjs/passport` - Authentication strategies
- `passport-jwt` - JWT strategy
- `bcrypt` - Password hashing
- `@sendgrid/mail` - Email delivery
- `class-validator` - Input validation

## Architecture

```
auth/
├── controllers/          # API endpoints
│   ├── auth.controller.ts
│   ├── verification.controller.ts
│   └── password.controller.ts
├── services/            # Business logic
│   ├── auth.service.ts
│   └── mail.service.ts
├── repositories/        # Data access layer
│   ├── user.repository.ts
│   ├── session.repository.ts
│   ├── company.repository.ts
│   └── token.repository.ts
├── entities/           # Type definitions
│   ├── user.entity.ts
│   ├── company.entity.ts
│   ├── session.entity.ts
│   ├── email-verification.entity.ts
│   └── password-reset.entity.ts
├── dtos/              # Request/response validation
│   ├── register.dto.ts
│   ├── login.dto.ts
│   ├── refresh-token.dto.ts
│   ├── verify-email.dto.ts
│   ├── forgot-password.dto.ts
│   └── reset-password.dto.ts
├── guards/            # Authentication guards
│   └── jwt-auth.guard.ts
├── strategies/        # Passport strategies
│   └── jwt.strategy.ts
└── auth.module.ts     # Module configuration
```

This implementation provides a production-ready authentication system with proper separation of concerns, security best practices, and comprehensive error handling.
