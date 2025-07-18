import React from 'react';
import { apiClient } from './client';
import { useAuth } from '../auth-context';

/**
 * Hook that provides an authenticated API client
 * Ensures the client has the latest tokens before making requests
 */
export function useAuthenticatedClient() {
  const { accessToken, refreshToken, isAuthenticated, isInitialized } = useAuth();

  // Update API client tokens when they change
  React.useEffect(() => {
    if (isInitialized && isAuthenticated && accessToken) {
      apiClient.setAccessToken(accessToken);
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken);
      }
    }
  }, [isInitialized, isAuthenticated, accessToken, refreshToken]);

  return {
    client: apiClient,
    isAuthenticated,
    isInitialized,
  };
}

/**
 * Higher-order function that ensures authentication before API calls
 */
export function withAuth<T extends any[], R>(
  apiCall: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token available. Please log in.');
    }
    
    // Ensure token is set in API client
    apiClient.setAccessToken(token);
    
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      apiClient.setRefreshToken(refreshToken);
    }
    
    return apiCall(...args);
  };
} 