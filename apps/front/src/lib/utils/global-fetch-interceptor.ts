/**
 * Global fetch interceptor for handling authentication errors
 * This intercepts all fetch requests and handles 401/403 errors globally
 */

import { authErrorHandler, AuthErrorHandler } from './auth-error-handler';

// Store original fetch
const originalFetch = globalThis.fetch;

// Create intercepted fetch
const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    const response = await originalFetch(input, init);
    
    // Check for authentication errors
    if (response.status === 401 || response.status === 403) {
      // Create an error object that matches our auth error format
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      (error as any).response = { status: response.status };
      
      // Handle the auth error
      authErrorHandler.handleAuthError(error);
      
      // Still return the response so the calling code can handle it if needed
      return response;
    }
    
    return response;
  } catch (error) {
    // Check if the error is an auth error
    if (AuthErrorHandler.isAuthError(error)) {
      authErrorHandler.handleAuthError(error);
    }
    
    // Re-throw the error
    throw error;
  }
};

/**
 * Install the global fetch interceptor
 * Call this once when the app starts
 */
export function installGlobalFetchInterceptor(): void {
  if (typeof window !== 'undefined') {
    // Only install in browser environment
    globalThis.fetch = interceptedFetch;
  }
}

/**
 * Restore the original fetch
 * Useful for testing or if you need to remove the interceptor
 */
export function restoreOriginalFetch(): void {
  if (typeof window !== 'undefined') {
    globalThis.fetch = originalFetch;
  }
}

/**
 * Check if the interceptor is installed
 */
export function isInterceptorInstalled(): boolean {
  return globalThis.fetch === interceptedFetch;
} 