import { useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';
import { apiClient } from '../api/client';

export const useAuth = () => {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken: refreshTokenAction,
    setUser,
    setError,
    clearError,
  } = useAuthStore();

  // Set token in API client when it changes
  useEffect(() => {
    apiClient.setToken(accessToken);
  }, [accessToken]);

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const tokenExpiry = getTokenExpiry(accessToken);
    if (!tokenExpiry) return;

    const timeUntilExpiry = tokenExpiry.getTime() - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0); // Refresh 5 minutes before expiry

    const timeout = setTimeout(() => {
      refreshTokenAction().catch(console.error);
    }, refreshTime);

    return () => clearTimeout(timeout);
  }, [accessToken, refreshToken, refreshTokenAction]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    setUser,
    setError,
    clearError,
    
    // Computed
    isAdmin: user?.role === 'ADMIN',
    isMember: user?.role === 'MEMBER',
    isReadOnly: user?.role === 'READ_ONLY',
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
  };
};

// Helper function to get token expiry
function getTokenExpiry(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
} 