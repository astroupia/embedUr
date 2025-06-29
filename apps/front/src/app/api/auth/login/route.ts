import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcryptjs';

// Mock user data - replace with your actual database queries
const mockUser = {
  id: '123',
  email: 'user@example.com',
  name: 'Test User',
  role: 'admin',
  company_id: 'company-123',
  // Hashed version of 'password123'
  password: '$2a$10$XFDJ5X5hLqjBqL5h5v5YueUjQNvLJ5Lf5J5J5J5J5J5J5J5J5J5J5',
};

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // In a real app, you would fetch the user from your database
    if (email !== mockUser.email) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await compare(password, mockUser.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create a JWT token
    const token = sign(
      {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        companyId: mockUser.company_id,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Return the token and user data (without the password)
    const { password: _, ...userWithoutPassword } = mockUser;
    
    return NextResponse.json({
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
