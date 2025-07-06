# Authentication System Setup

This document explains how to set up and use the authentication system (registration and login) that connects to your NestJS backend.

## Environment Setup

1. Copy the environment variables from `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

2. Update the environment variables in `.env.local`:

```env
# NestJS Backend URL (for server-side API routes)
NESTJS_BACKEND_URL=http://localhost:8000

# Public API URL (for client-side API calls)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How It Works

### 1. API Client (`/lib/api/auth.ts`)
- Provides a clean interface for authentication operations
- Handles API calls to your NestJS backend
- Includes proper error handling and type safety

### 2. Authentication Context (`/lib/auth-context.tsx`)
- Manages user state across the application
- Handles token storage and retrieval
- Provides login/logout functions
- Persists authentication state in localStorage

### 3. Registration Flow
1. User fills out the registration form
2. Form data is validated and sent to `/api/auth/register`
3. The API route forwards the request to your NestJS backend
4. Response is handled and displayed via toast notifications
5. User is redirected to login on success

### 4. Login Flow
1. User enters email and password
2. Credentials are validated and sent to `/api/auth/login`
3. The API route forwards the request to your NestJS backend
4. On success, tokens and user data are stored in context
5. User is redirected to dashboard
6. Toast notification confirms successful login

### 5. Middleware (`/middleware.ts`)
- Handles authentication routing at the edge
- Redirects authenticated users away from login/register pages
- Redirects unauthenticated users to login from protected pages
- Uses cookies for server-side authentication checks

### 6. Protected Routes
- Dashboard and other protected pages are wrapped with `ProtectedRoute`
- Unauthenticated users are automatically redirected to login
- Loading states are handled gracefully

### 7. Toast Notifications
- Success messages are shown in green
- Error messages are shown in red
- Toasts auto-dismiss after 5 seconds
- Users can manually dismiss toasts
- API response messages are displayed as toasts

### 8. Loading States
- Clean loading states on buttons during API calls
- Spinner animation with descriptive text
- Buttons are disabled during loading
- No duplicate loading overlays

## API Endpoints

### Registration
- **URL**: `POST /auth/register`
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "companyName": "Company Name",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully. Please check your email to verify your account.",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "companyId": "company_id"
    }
  }
  ```

### Login
- **URL**: `POST /auth/login`
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN",
      "companyId": "company_id"
    }
  }
  ```

### Logout
- **URL**: `POST /auth/logout`
- **Payload**:
  ```json
  {
    "refreshToken": "your_refresh_token_here"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

## Testing

### Registration Test
You can test the registration endpoint using curl:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "companyName": "Test Company",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login Test
Test the login endpoint with the user you registered:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "miketest@gmail.com",
    "password": "12345678"
  }'
```

## Error Handling

The system handles various error scenarios:

1. **Validation Errors**: Form validation errors are displayed as toasts
2. **Network Errors**: Connection issues are caught and displayed as toasts
3. **Server Errors**: Backend errors (like "Internal server error") are displayed as toasts
4. **User Already Exists**: Conflict errors are handled gracefully with toast messages
5. **API Response Messages**: All API response messages are shown as toasts, including success and error messages

## Components

### Toast Component (`/components/ui/toast.tsx`)
- Reusable toast notification system
- Supports success, error, info, and warning types
- Auto-dismiss functionality
- Manual dismiss option

### API Client (`/lib/api/auth.ts`)
- Type-safe API client
- Centralized error handling
- Easy to extend for other auth operations

### Auth Context (`/lib/auth-context.tsx`)
- Manages authentication state globally
- Handles token storage and user data
- Provides login/logout functions
- Persists state across page refreshes

### Protected Route (`/components/auth/protected-route.tsx`)
- Wraps protected pages
- Redirects unauthenticated users to login
- Shows loading states during auth checks

### Cookie Utilities (`/lib/cookies.ts`)
- Handles cookie operations consistently
- Provides clean API for setting/getting/deleting cookies
- Used by auth context and middleware

## Next Steps

1. Start your NestJS backend on port 8000
2. Start your Next.js frontend: `npm run dev`
3. Navigate to `/register` to test the registration flow
4. Navigate to `/login` to test the login flow
5. Check that toast notifications appear for success/error states
6. Test protected routes by accessing `/dashboard`
7. Test logout functionality from the dashboard header
8. Test middleware redirects:
   - Try accessing `/login` while authenticated (should redirect to dashboard)
   - Try accessing `/dashboard` while not authenticated (should redirect to login)
   - Check that redirect URLs are preserved after login
9. Test loading states and toasts:
   - Click register/login buttons and see loading spinners
   - Test with invalid credentials to see error toasts
   - Test with valid credentials to see success toasts
   - Verify API response messages appear as toasts 