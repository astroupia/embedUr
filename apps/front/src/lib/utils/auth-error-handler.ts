/**
 * Global authentication error handler
 * Handles 401 errors and redirects to login page
 */

export interface AuthErrorHandlerOptions {
  redirectToLogin?: boolean;
  preserveCurrentPath?: boolean;
  clearStorage?: boolean;
}

export class AuthErrorHandler {
  private static instance: AuthErrorHandler;
  private isHandling = false;

  private constructor() {}

  static getInstance(): AuthErrorHandler {
    if (!AuthErrorHandler.instance) {
      AuthErrorHandler.instance = new AuthErrorHandler();
    }
    return AuthErrorHandler.instance;
  }

  /**
   * Handle authentication errors (401, 403, etc.)
   */
  handleAuthError(
    error: any, 
    options: AuthErrorHandlerOptions = {}
  ): void {
    const {
      redirectToLogin = true,
      preserveCurrentPath = true,
      clearStorage = true
    } = options;

    // Prevent multiple simultaneous redirects
    if (this.isHandling) {
      return;
    }

    this.isHandling = true;

    try {
      // Clear authentication data
      if (clearStorage) {
        this.clearAuthData();
      }

      // Redirect to login if requested
      if (redirectToLogin && typeof window !== 'undefined') {
        this.redirectToLogin(preserveCurrentPath);
      }
    } finally {
      // Reset handling flag after a delay to prevent immediate re-triggering
      setTimeout(() => {
        this.isHandling = false;
      }, 1000);
    }
  }

  /**
   * Clear all authentication-related data
   */
  private clearAuthData(): void {
    if (typeof window === 'undefined') return;

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Clear cookies
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';

    // Clear sessionStorage if any
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  }

  /**
   * Redirect to login page with optional redirect parameter
   */
  private redirectToLogin(preserveCurrentPath: boolean): void {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname + window.location.search;
    
    // Don't redirect if already on login page
    if (currentPath === '/login') {
      return;
    }

    // Build login URL with redirect parameter
    const loginUrl = preserveCurrentPath 
      ? `/login?redirect=${encodeURIComponent(currentPath)}`
      : '/login';

    // Use window.location.href for full page reload to clear any cached state
    window.location.href = loginUrl;
  }

  /**
   * Check if an error is an authentication error
   */
  static isAuthError(error: any): boolean {
    if (!error) return false;

    // Check for HTTP status codes
    if (error.response?.status) {
      return [401, 403].includes(error.response.status);
    }

    // Check for error messages
    if (error.message) {
      const authErrorMessages = [
        'unauthorized',
        'forbidden',
        'invalid token',
        'token expired',
        'authentication failed',
        'access denied'
      ];
      
      return authErrorMessages.some(msg => 
        error.message.toLowerCase().includes(msg)
      );
    }

    return false;
  }

  /**
   * Create a global error handler for fetch requests
   */
  static createGlobalFetchHandler(): (error: any) => void {
    const handler = AuthErrorHandler.getInstance();
    
    return (error: any) => {
      if (AuthErrorHandler.isAuthError(error)) {
        handler.handleAuthError(error);
      }
    };
  }
}

// Export singleton instance
export const authErrorHandler = AuthErrorHandler.getInstance(); 