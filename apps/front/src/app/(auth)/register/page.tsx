"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpPage, type Testimonial } from '@/components/ui/sign-up';
import { authApi, type RegisterRequest } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { 
  type RegistrationMode, 
  type CompanyPayload, 
  type UserPayload,
  type CreateCompanyRequest 
} from '@/lib/types/auth';

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
    text: "This service has transformed how we work. Clean design, powerful features, and excellent support."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for teams."
  },
];

// Helper function to generate unique schema name
const generateSchemaName = (companyName: string): string => {
  const cleanName = companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${cleanName}${randomSuffix}`;
};

// Helper function to parse employees count
const parseEmployeesCount = (employeesRange: string): number => {
  const ranges = {
    '1-10': 5,
    '11-50': 30,
    '51-200': 125,
    '201-500': 350,
    '501-1000': 750,
    '1000+': 1500
  };
  return ranges[employeesRange as keyof typeof ranges] || 1;
};

export default function RegisterPage() {
  const [mode, setMode] = useState<RegistrationMode>('new-company');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (mode === 'new-company') {
        const company_name = formData.get('company_name') as string;
        const firstName = formData.get('firstName') as string || company_name;
        const lastName = formData.get('lastName') as string || 'Admin';

        // Create registration payload
        const registerPayload: RegisterRequest = {
          email,
          password,
          companyName: company_name,
          firstName,
          lastName,
        };

        try {
          // Call the registration API
          const response = await authApi.register(registerPayload);
          
          // Show success message from API
          showSuccess(response.message);
          
          // Redirect to login with success message
          router.push('/login?registered=true&mode=company');
        } catch (apiError) {
          // Handle API errors - show the error message from the API
          if (apiError instanceof Error) {
            showError(apiError.message);
          } else {
            showError('An unexpected error occurred during registration');
          }
        }
      } else {
        // Handle create user mode (existing logic)
        const invite_code = formData.get('invite_code') as string;
        
        const payload = { email, password, invite_code };

        const response = await fetch('/api/auth/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          showError(data.message || 'User creation failed');
        } else {
          // Show success message
          showSuccess(data.message || 'User created successfully');
          
          // Redirect to login with success message
          router.push('/login?registered=true&mode=user');
        }
      }
    } catch (err) {
      // Handle any other errors
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // TODO: Implement Google sign up
    console.log('Google sign up clicked');
  };



  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <SignUpPage 
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={sampleTestimonials}
        mode={mode}
        onModeChange={setMode}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        isLoading={isLoading}
      />
    
    </div>
  );
}
