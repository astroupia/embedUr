import { ConfigModule } from '@nestjs/config';

export const TestConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env.test',
});

export const testDatabaseConfig = {
  url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
  shadowDatabaseUrl: process.env.TEST_SHADOW_DATABASE_URL || process.env.SHADOW_DATABASE_URL,
};

export const testJwtConfig = {
  secret: process.env.JWT_SECRET || 'test-secret-key',
  expiresIn: '1h',
};

export const testAppConfig = {
  port: parseInt(process.env.TEST_PORT || '3001', 10),
  host: process.env.TEST_HOST || 'localhost',
};

// Test data constants
export const TEST_CONSTANTS = {
  COMPANY: {
    NAME_PREFIX: 'Test Company E2E',
    INDUSTRY: 'Technology',
    EMPLOYEES: 50,
  },
  USER: {
    EMAIL_PREFIX: 'test',
    FIRST_NAME: 'Test',
    LAST_NAME: 'User',
    PASSWORD: 'password123',
    ROLE: 'MEMBER',
  },
  AI_PERSONA: {
    NAME: 'Test AI Persona',
    DESCRIPTION: 'Test AI Persona for E2E tests',
    PROMPT: 'You are a helpful assistant',
  },
  WORKFLOW: {
    NAME: 'Test Workflow',
    TYPE: 'LEAD_ROUTING',
    N8N_WORKFLOW_ID: 'test-n8n-workflow-id',
  },
  CAMPAIGN: {
    NAME_PREFIX: 'Test Campaign',
    DESCRIPTION: 'Test campaign for integration testing',
  },
  LEAD: {
    FULL_NAME_PREFIX: 'Test Lead',
    EMAIL_PREFIX: 'test.lead',
  },
};

// Test timeout configurations
export const TEST_TIMEOUTS = {
  SHORT: 5000, // 5 seconds
  MEDIUM: 10000, // 10 seconds
  LONG: 30000, // 30 seconds
  VERY_LONG: 60000, // 1 minute
};

// Test retry configurations
export const TEST_RETRY = {
  MAX_ATTEMPTS: 3,
  DELAY: 1000, // 1 second
};

// Helper function to generate unique test identifiers
export const generateTestId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to wait for async operations
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to retry async operations
export const retry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = TEST_RETRY.MAX_ATTEMPTS,
  delay: number = TEST_RETRY.DELAY,
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delay);
      }
    }
  }
  
  throw lastError!;
}; 