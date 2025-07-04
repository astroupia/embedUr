import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas for the payloads
const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  schemaName: z.string().min(1, 'Schema name is required'),
  email: z.string().email('Invalid email address'),
  industry: z.string().min(1, 'Industry is required'),
  employees: z.number().min(1, 'Number of employees must be at least 1'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_DELETION']).default('ACTIVE'),
  planId: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  revenue: z.number().nullable().optional(),
  linkedinUsername: z.string().nullable().optional(),
  twitterUsername: z.string().nullable().optional(),
  facebookUsername: z.string().nullable().optional(),
  instagramUsername: z.string().nullable().optional(),
});

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  isVerified: z.boolean().default(false),
  role: z.enum(['ADMIN', 'MEMBER', 'READ_ONLY']).default('ADMIN'),
  linkedinUrl: z.string().nullable().optional(),
  profileUrl: z.string().nullable().optional(),
  twitterUsername: z.string().nullable().optional(),
  facebookUsername: z.string().nullable().optional(),
  instagramUsername: z.string().nullable().optional(),
});

const createCompanySchema = z.object({
  company: companySchema,
  user: userSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, user } = createCompanySchema.parse(body);

    // Get the NestJS backend URL from environment variables
    const backendUrl = process.env.NESTJS_BACKEND_URL || 'http://localhost:3001';
    
    // Forward the request to NestJS backend
    const response = await fetch(`${backendUrl}/api/companies/create-with-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any additional headers your NestJS backend expects
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        company,
        user
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward the error from NestJS backend
      return NextResponse.json(
        { 
          message: data.message || 'Company creation failed',
          errors: data.errors || null 
        },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json({
      message: 'Company and admin user created successfully',
      companyId: data.companyId,
      userId: data.userId,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Validation error', 
          errors: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Company creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 