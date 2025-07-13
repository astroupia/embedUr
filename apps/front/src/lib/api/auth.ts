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