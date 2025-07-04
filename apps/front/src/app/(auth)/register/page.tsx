"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpPage, type Testimonial } from '@/components/ui/sign-up';
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (mode === 'new-company') {
        const company_name = formData.get('company_name') as string;
        const industry = formData.get('industry') as string;
        const employees = formData.get('employees') as string;

        // Generate payloads according to Prisma schema
        const companyPayload: CompanyPayload = {
          name: company_name,
          schemaName: generateSchemaName(company_name),
          email: email, // Primary contact email for the company
          industry: industry,
          employees: parseEmployeesCount(employees),
          // Default values for required fields
          status: 'ACTIVE',
          // Optional fields can be omitted or set to null
          planId: null,
          location: null,
          website: null,
          description: null,
          logoUrl: null,
          bannerUrl: null,
          revenue: null,
          linkedinUsername: null,
          twitterUsername: null,
          facebookUsername: null,
          instagramUsername: null
        };

        const userPayload: UserPayload = {
          email: email,
          firstName: company_name, // Using company name as firstName
          lastName: 'Admin', // Hardcoded as per requirements
          password: password,
          // Default values for required fields
          isVerified: false,
          role: 'ADMIN', // First user is admin
          // Optional fields can be omitted or set to null
          linkedinUrl: null,
          profileUrl: null,
          twitterUsername: null,
          facebookUsername: null,
          instagramUsername: null
        };

        const requestPayload: CreateCompanyRequest = {
          company: companyPayload,
          user: userPayload
        };

        // Send to company creation endpoint
        const response = await fetch('/api/auth/create-company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Company creation failed');
        }

        // Redirect to login with success message
        router.push('/login?registered=true&mode=company');
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
          throw new Error(data.message || 'User creation failed');
        }

        // Redirect to login with success message
        router.push('/login?registered=true&mode=user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
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
      />
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md w-full bg-destructive/15 text-destructive p-4 rounded-lg shadow-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <p className="text-sm">Creating your account...</p>
          </div>
        </div>
      )}
    </div>
  );
}
