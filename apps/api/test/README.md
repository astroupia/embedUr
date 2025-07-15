# End-to-End Testing Documentation

This directory contains comprehensive end-to-end (E2E) tests for the entire system, treating it as a black-box API to ensure all modules work together correctly.

## Overview

The E2E test suite is designed to test the entire system as a complete unit, verifying that:
- All modules integrate correctly
- Authentication and authorization work end-to-end
- Data flows correctly between different parts of the system
- Error handling works as expected
- Company isolation is properly enforced
- All CRUD operations work across all entities

## Test Structure

### 1. System E2E Tests (`system-e2e-spec.ts`)
**Comprehensive black-box testing of the entire system**

Tests all modules and their interactions:
- **System Health & Infrastructure**: Basic health checks and API availability
- **Authentication & Authorization**: Complete auth flow including register, login, refresh, logout
- **AI Persona Management**: Full CRUD operations for AI personas
- **Lead Management**: Complete lead lifecycle with pagination
- **Campaign Management**: Campaign creation, activation, and management
- **Workflow Management**: Workflow creation, execution, and monitoring
- **Enrichment Management**: Lead enrichment requests and processing
- **Reply Management**: Reply creation and management
- **Booking Management**: Booking scheduling, rescheduling, and cancellation
- **Usage Metrics**: Usage tracking and reporting
- **N8N Integration**: Webhook handling and external integrations
- **Error Handling & Edge Cases**: Proper error responses and edge case handling
- **System Integration Scenarios**: Complex workflows involving multiple modules
- **Company Isolation**: Multi-tenant security and data isolation

### 2. Module-Specific E2E Tests
Individual module tests for focused testing:
- `ai-persona-integration.e2e-spec.ts` - AI Persona module specific tests
- `auth-integration.e2e-spec.ts` - Authentication module tests
- `booking-integration.e2e-spec.ts` - Booking module tests
- `campaign-integration.e2e-spec.ts` - Campaign module tests
- `enrichment-integration.e2e-spec.ts` - Enrichment module tests
- `lead-integration.e2e-spec.ts` - Lead module tests
- `reply-integration.e2e-spec.ts` - Reply module tests
- `workflow-integration.e2e-spec.ts` - Workflow module tests

## Test Setup

### Prerequisites
- Node.js and npm/bun installed
- Database running and accessible
- Environment variables configured (see `setup-env.ts`)

### Environment Setup
The test environment is automatically configured via `setup-env.ts`:
- Sets `NODE_ENV=test`
- Configures mock webhook URLs for N8N
- Sets up mock API keys for external services
- Disables email sending for tests

### Test Data Management
Tests use isolated test data that is automatically cleaned up:
- Each test creates its own company and user
- Test data is cleaned up after each test
- No interference between test runs
- Proper company isolation testing

## Running Tests

### Available Commands

```bash
# Run all E2E tests
npm run test:all-e2e

# Run all E2E tests with verbose output
npm run test:all-e2e:verbose

# Run system E2E tests only
npm run test:system-e2e

# Run system E2E tests with verbose output
npm run test:system-e2e:verbose

# Run system E2E tests in watch mode
npm run test:system-e2e:watch

# Run the custom system E2E test runner
npm run test:system-e2e:runner

# Run individual module E2E tests
npm run test:e2e -- --testPathPattern=ai-persona-integration
npm run test:e2e -- --testPathPattern=auth-integration
npm run test:e2e -- --testPathPattern=booking-integration
# ... etc for other modules
```

### Test Runner Script
The `run-system-e2e.ts` script provides a custom test runner with:
- Detailed progress reporting
- Comprehensive test coverage
- Automatic cleanup
- Better error reporting

## Test Helpers

### SystemTestSetup (`system-test-setup.ts`)
Enhanced test setup helper for system-wide testing:

```typescript
// Setup complete test environment
const testData = await systemTestSetup.setupCompleteTestEnvironment();

// Create test users
const testUser = await systemTestSetup.createTestUser('MEMBER');
const adminUser = await systemTestSetup.createTestUser('ADMIN');

// Create test entities
const lead = await systemTestSetup.createTestLead({
  email: 'test@example.com',
  fullName: 'Test Lead'
});

// Make authenticated requests
const response = await systemTestSetup.makeAuthenticatedRequest(
  'post', 
  '/leads', 
  leadData, 
  testUser
);

// Generate test data
const testData = systemTestSetup.generateTestData('lead');
```

### TestSetup (`test-setup.ts`)
Original test setup helper for module-specific tests:

```typescript
// Setup basic test data
const testData = await testSetup.setupTestData();

// Create test entities
const campaign = await testSetup.createTestCampaign({
  name: 'Test Campaign',
  status: 'ACTIVE'
});

// Make authenticated requests
const response = await testSetup.makeAuthenticatedRequest(
  'get', 
  '/campaigns'
);
```

## Test Coverage

### Authentication & Authorization
- ✅ User registration
- ✅ User login/logout
- ✅ Token refresh
- ✅ Invalid credentials handling
- ✅ JWT token validation
- ✅ Role-based access control

### AI Persona Management
- ✅ Create, read, update, delete AI personas
- ✅ Prompt validation and security checks
- ✅ Parameter validation
- ✅ Company isolation
- ✅ Deletion constraints

### Lead Management
- ✅ Complete lead CRUD operations
- ✅ Lead enrichment
- ✅ Lead status management
- ✅ Campaign association
- ✅ Pagination and filtering

### Campaign Management
- ✅ Campaign creation and management
- ✅ Campaign activation/deactivation
- ✅ AI persona and workflow association
- ✅ Lead assignment
- ✅ Status transitions

### Workflow Management
- ✅ Workflow creation and configuration
- ✅ Workflow execution
- ✅ Execution monitoring
- ✅ Error handling
- ✅ N8N integration

### Reply Management
- ✅ Reply creation and tracking
- ✅ Reply status management
- ✅ Campaign association
- ✅ Lead association

### Booking Management
- ✅ Booking scheduling
- ✅ Booking rescheduling
- ✅ Booking cancellation
- ✅ Time slot management
- ✅ Lead and campaign association

### Enrichment Management
- ✅ Enrichment request creation
- ✅ Provider selection
- ✅ Status tracking
- ✅ Retry mechanisms

### Usage Metrics
- ✅ Metric creation
- ✅ Usage tracking
- ✅ Reporting
- ✅ Company-specific metrics

### N8N Integration
- ✅ Webhook handling
- ✅ Workflow completion
- ✅ Reply processing
- ✅ Error handling

### Error Handling
- ✅ Invalid requests
- ✅ Unauthorized access
- ✅ Resource not found
- ✅ Validation errors
- ✅ Company isolation violations

### System Integration
- ✅ Complete lead-to-reply workflow
- ✅ Campaign activation with lead assignment
- ✅ Multi-user scenarios
- ✅ Cross-module data flow

## Best Practices

### Test Organization
1. **Group related tests** in describe blocks
2. **Use descriptive test names** that explain what is being tested
3. **Setup and teardown** properly for each test
4. **Clean up test data** after each test

### Test Data Management
1. **Use unique identifiers** (timestamps, random suffixes)
2. **Isolate test data** by company
3. **Clean up thoroughly** after tests
4. **Avoid hardcoded values** that might conflict

### Assertions
1. **Test both success and failure cases**
2. **Verify response status codes**
3. **Check response body structure**
4. **Validate business logic**
5. **Test edge cases and error conditions**

### Performance
1. **Run tests in parallel** when possible
2. **Use efficient database operations**
3. **Minimize test setup time**
4. **Clean up resources promptly**

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Ensure database is running
npm run db:start

# Reset test database
npm run db:reset
```

**Environment Variable Issues**
```bash
# Check environment setup
cat test/setup-env.ts

# Ensure all required variables are set
```

**Test Timeout Issues**
```bash
# Increase timeout for slow tests
jest --testTimeout=30000

# Run tests with verbose output to identify slow tests
npm run test:system-e2e:verbose
```

**Cleanup Issues**
```bash
# Manual cleanup if tests fail
npm run db:reset

# Check for orphaned test data
npm run db:check-orphans
```

### Debugging Tests

**Enable Debug Logging**
```typescript
// Add to test file
process.env.DEBUG = 'true';
```

**Run Single Test**
```bash
npm run test:system-e2e -- --testNamePattern="should create AI persona"
```

**Inspect Test Data**
```typescript
// Add to test
console.log('Test data:', testData);
console.log('Response:', response.body);
```

## Continuous Integration

### GitHub Actions
The E2E tests are configured to run in CI:
- Runs on every pull request
- Uses test database
- Reports test results
- Fails build on test failures

### Local Development
```bash
# Run tests before committing
npm run test:all-e2e

# Run specific test suite
npm run test:system-e2e

# Run with coverage
npm run test:e2e -- --coverage
```

## Contributing

### Adding New Tests
1. **Follow existing patterns** in test files
2. **Use appropriate test helpers**
3. **Add proper cleanup**
4. **Document test purpose**
5. **Update this README**

### Test Naming Convention
- Use descriptive names: `should create lead with valid data`
- Group related tests: `describe('Lead Management', () => {`
- Use consistent patterns across test files

### Test Data Patterns
```typescript
// Good: Unique, descriptive data
const leadData = {
  fullName: `Test Lead ${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  linkedinUrl: 'https://linkedin.com/in/testlead'
};

// Bad: Hardcoded, non-unique data
const leadData = {
  fullName: 'Test Lead',
  email: 'test@example.com'
};
```

## Performance Benchmarks

### Test Execution Times
- **System E2E**: ~60-90 seconds
- **Module E2E**: ~15-30 seconds per module
- **Individual Tests**: ~1-3 seconds per test

### Database Operations
- **Setup**: ~2-5 seconds
- **Cleanup**: ~1-3 seconds
- **Test Execution**: ~0.5-2 seconds per test

### Memory Usage
- **Peak Memory**: ~200-300MB
- **Average Memory**: ~150-200MB
- **Cleanup**: Returns to baseline

## Monitoring and Reporting

### Test Metrics
- **Pass Rate**: Target >95%
- **Coverage**: Target >90%
- **Performance**: Target <2 minutes for full suite
- **Reliability**: Target >99% success rate

### Reporting
- **Jest HTML Reporter**: Generates detailed HTML reports
- **Coverage Reports**: Shows test coverage by module
- **Performance Reports**: Tracks test execution times
- **Error Reports**: Detailed error information for failures

## Future Enhancements

### Planned Improvements
1. **Visual Regression Testing**: Screenshot comparison for UI changes
2. **Load Testing**: Performance testing under load
3. **Security Testing**: Automated security vulnerability testing
4. **API Contract Testing**: Verify API contracts are maintained
5. **Database Migration Testing**: Test database schema changes

### Integration Testing
1. **External Service Mocking**: Better mocking of external APIs
2. **Webhook Testing**: Comprehensive webhook testing
3. **Third-party Integration**: Test integrations with external services
4. **Payment Processing**: Test payment flows
5. **Email Delivery**: Test email sending and delivery

This comprehensive E2E testing setup ensures the system works correctly as a whole, providing confidence in deployments and changes. 