"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInPage, type Testimonial } from '@/components/ui/sign-in';
import { authApi, type LoginRequest } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity."
  },
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Create login payload
      const loginPayload: LoginRequest = {
        email,
        password,
      };

      try {
        // Call the login API
        const response = await authApi.login(loginPayload);
        
        // Store auth data using context
        login(response.user, response.accessToken, response.refreshToken);
        
        // Show success message
        showSuccess('Login successful! Welcome back.');
        
        // Get redirect URL from query params or default to dashboard
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        
        // Redirect to the intended page or dashboard
        router.push(redirectTo);
      } catch (apiError) {
        // Handle API errors - show the error message from the API
        if (apiError instanceof Error) {
          showError(apiError.message);
        } else {
          showError('An unexpected error occurred during login');
        }
      }
    } catch (err) {
      // Handle any other errors
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  const handleResetPassword = () => {
    // TODO: Implement password reset flow
    console.log('Reset password clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      <SignInPage 
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignIn={handleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        isLoading={isLoading}
      />
    </div>
  );
}
