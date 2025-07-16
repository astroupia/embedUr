import { apiClient } from './client';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  LogoutRequest,
} from './client';

// Auth API class that uses the base client
export class AuthAPI {
  private client = apiClient;
  /**
   * Register a new user and company
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.client.register(data);
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.login(data);
    
    // Automatically set the access token after successful login
    if (response.accessToken) {
      this.client.setAccessToken(response.accessToken);
    }
    
    return response;
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    const response = await this.client.refreshToken(data);
    
    // Update the access token after refresh
    if (response.accessToken) {
      this.client.setAccessToken(response.accessToken);
    }
    
    return response;
  }

  /**
   * Logout user
   */
  async logout(data: LogoutRequest): Promise<void> {
    await this.client.logout(data);
    
    // Clear auth tokens after logout
    this.client.clearAuth();
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.client.verifyEmail(token);
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.client.forgotPassword(email);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.client.resetPassword(token, password);
  }
}

// Export types for convenience
export type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  LogoutRequest,
}; 