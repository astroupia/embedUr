"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setCookie, deleteCookie, getAllCookies } from './cookies';
import { apiClient } from './api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Add this new state
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false); // Add this state

  // Check for existing auth data on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedUser && storedAccessToken && storedRefreshToken) {
        try {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          apiClient.setAccessToken(storedAccessToken); // <-- set token in API client
          
          // Also set cookies if they don't exist
          const cookies = getAllCookies();
          
          if (!cookies.accessToken) {
            setCookie('accessToken', storedAccessToken, 7);
          }
          if (!cookies.refreshToken) {
            setCookie('refreshToken', storedRefreshToken, 7);
          }
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          logout();
        }
      } else {
        apiClient.clearAuth(); // clear token in API client if not logged in
      }
      setIsLoading(false);
      setIsInitialized(true); // Mark as initialized
    };

    initializeAuth();
  }, []);

  const login = (user: User, accessToken: string, refreshToken: string) => {
    setUser(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    apiClient.setAccessToken(accessToken); // <-- set token in API client
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Store in cookies for middleware access
    setCookie('accessToken', accessToken, 7);
    setCookie('refreshToken', refreshToken, 7);
  };

  const logout = async () => {
    // Call server-side logout if we have a refresh token
    if (refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Error during server-side logout:', error);
      }
    }

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    apiClient.clearAuth(); // <-- clear token in API client
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear cookies
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
  };

  const updateUser = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    isInitialized, // Add this to the context value
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 