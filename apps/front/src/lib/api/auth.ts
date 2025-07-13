<<<<<<< HEAD
// API client for authentication operations

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RegisterRequest {
  email: string;
  password: string;
  companyName: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyId: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
=======
import { apiClient } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  company: {
    name: string;
    schemaName: string;
    email: string;
    industry: string;
    employees: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_DELETION';
    planId?: string | null;
    location?: string | null;
    website?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    revenue?: number | null;
    linkedinUsername?: string | null;
    twitterUsername?: string | null;
    facebookUsername?: string | null;
    instagramUsername?: string | null;
  };
  user: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    isVerified?: boolean;
    role?: 'ADMIN' | 'MEMBER' | 'READ_ONLY';
    linkedinUrl?: string | null;
    profileUrl?: string | null;
    twitterUsername?: string | null;
    facebookUsername?: string | null;
    instagramUsername?: string | null;
  };
}

export interface JoinCompanyData {
  email: string;
  password: string;
  invite_code: string;
}

export interface AuthResponse {
>>>>>>> 55e844a (v1)
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
  };
}

<<<<<<< HEAD
export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle the specific error format from your backend
        const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

// Export a singleton instance
export const authApi = new ApiClient(API_BASE_URL); 
=======
export interface RefreshTokenData {
  refreshToken: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export const authApi = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  // Register new company and admin user
  async register(data: RegisterData): Promise<{ message: string; companyId: string; userId: string }> {
    return apiClient.post('/auth/register', data);
  },

  // Join existing company with invite code
  async joinCompany(data: JoinCompanyData): Promise<{ message: string; userId: string; companyId: string }> {
    return apiClient.post('/auth/join', data);
  },

  // Refresh access token
  async refreshToken(data: RefreshTokenData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', data);
  },

  // Logout user
  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  },

  // Request password reset
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return apiClient.post('/auth/password/forgot', data);
  },

  // Reset password with token
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return apiClient.post('/auth/password/reset', data);
  },

  // Verify email with token
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.get(`/auth/verify?token=${token}`);
  },

  // Get current user profile
  async getProfile(): Promise<{ user: any }> {
    return apiClient.get('/auth/profile');
  },
}; 
>>>>>>> 55e844a (v1)
