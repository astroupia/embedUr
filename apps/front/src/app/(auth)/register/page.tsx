"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 238d278 (Feat: authentication integrated with UI)
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
<<<<<<< HEAD
=======
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
>>>>>>> 55e844a (v1)
=======
>>>>>>> 238d278 (Feat: authentication integrated with UI)

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
<<<<<<< HEAD
<<<<<<< HEAD
  const [mode, setMode] = useState<RegistrationMode>('new-company');
  const [isLoading, setIsLoading] = useState(false);
=======
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RegistrationData>({
    company: {
      name: '',
      schemaName: '',
      email: '',
      industry: '',
      employees: 1,
      website: '',
      description: '',
    },
    user: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, error, clearError } = useAuth();
>>>>>>> 55e844a (v1)
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
=======
  const [mode, setMode] = useState<RegistrationMode>('new-company');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
>>>>>>> 238d278 (Feat: authentication integrated with UI)

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
    if (!validateStep1() || !validateStep2()) return;

    setIsSubmitting(true);
    clearError();

    try {
      const { confirmPassword, ...userData } = data.user;
      await register({
        company: data.company,
        user: userData,
      });
      
      // Redirect to login after successful registration
      router.push('/login?message=Registration successful! Please check your email to verify your account.');
    } catch (error) {
      // Error is handled by the auth store
>>>>>>> 55e844a (v1)
=======
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
>>>>>>> 238d278 (Feat: authentication integrated with UI)
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 238d278 (Feat: authentication integrated with UI)
  const handleGoogleSignUp = () => {
    // TODO: Implement Google sign up
    console.log('Google sign up clicked');
  };



  const handleSignIn = () => {
    router.push('/login');
  };

<<<<<<< HEAD
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
    
=======
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
              
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={data.company.name}
                  onChange={(e) => handleCompanyChange('name', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
                  Company Email *
                </label>
                <input
                  id="companyEmail"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={data.company.email}
                  onChange={(e) => handleCompanyChange('email', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry *
                </label>
                <select
                  id="industry"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={data.company.industry}
                  onChange={(e) => handleCompanyChange('industry', e.target.value)}
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="employees" className="block text-sm font-medium text-gray-700">
                  Company Size *
                </label>
                <select
                  id="employees"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={data.company.employees}
                  onChange={(e) => handleCompanyChange('employees', parseInt(e.target.value))}
                >
                  {EMPLOYEE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website (optional)
                </label>
                <input
                  id="website"
                  type="url"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={data.company.website}
                  onChange={(e) => handleCompanyChange('website', e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!validateStep1()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Admin Account</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={data.user.firstName}
                    onChange={(e) => handleUserChange('firstName', e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={data.user.lastName}
                    onChange={(e) => handleUserChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="userEmail"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={data.user.email}
                  onChange={(e) => handleUserChange('email', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={data.user.password}
                  onChange={(e) => handleUserChange('password', e.target.value)}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={data.user.confirmPassword}
                  onChange={(e) => handleUserChange('confirmPassword', e.target.value)}
                />
                {data.user.password && data.user.confirmPassword && data.user.password !== data.user.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !validateStep2()}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
>>>>>>> 55e844a (v1)
=======
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
    
>>>>>>> 238d278 (Feat: authentication integrated with UI)
    </div>
  );
}
