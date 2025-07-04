import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for logout
const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = logoutSchema.parse(body);

    // Get the NestJS backend URL from environment variables
    const backendUrl = process.env.NESTJS_BACKEND_URL || 'http://localhost:8000';
    
    // Forward the request to NestJS backend
    const response = await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward the error from NestJS backend
      return NextResponse.json(
        { 
          message: data.message || 'Logout failed',
          error: data.error || null,
          statusCode: data.statusCode || response.status
        },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Validation error', 
          errors: error.errors,
          statusCode: 400
        },
        { status: 400 }
      );
    }

    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        statusCode: 500
      },
      { status: 500 }
    );
  }
} 