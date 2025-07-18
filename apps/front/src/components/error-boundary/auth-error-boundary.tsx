"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { authErrorHandler, AuthErrorHandler } from '@/lib/utils/auth-error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an authentication error
    if (AuthErrorHandler.isAuthError(error)) {
      // Handle auth error immediately
      authErrorHandler.handleAuthError(error);
      return { hasError: true, error };
    }

    // For non-auth errors, just update state
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    
    // If it's an auth error, handle it
    if (AuthErrorHandler.isAuthError(error)) {
      authErrorHandler.handleAuthError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      // If it's an auth error, don't render anything (redirect will happen)
      if (this.state.error && AuthErrorHandler.isAuthError(this.state.error)) {
        return null;
      }

      // For other errors, show fallback or error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 