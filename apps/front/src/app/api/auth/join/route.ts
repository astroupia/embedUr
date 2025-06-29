import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Mock data - replace with your database queries
const mockInvite = {
  code: 'INVITE123',
  company_id: 'company-123',
  email: 'user@example.com', // Optional: specific email this invite is for
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  used: false,
  created_by: 'admin-user-id',
};

const joinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  invite_code: z.string().min(1, 'Invite code is required'),
});

// In-memory storage for demo purposes - replace with your database
const users: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, invite_code } = joinSchema.parse(body);

    // Check if user already exists
    const userExists = users.some(user => user.email === email);
    if (userExists) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Validate invite code (in a real app, verify against your database)
    if (invite_code !== mockInvite.code) {
      return NextResponse.json(
        { message: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Check if invite is already used
    if (mockInvite.used) {
      return NextResponse.json(
        { message: 'This invite code has already been used' },
        { status: 400 }
      );
    }

    // Check if invite is expired
    if (new Date(mockInvite.expires_at) < new Date()) {
      return NextResponse.json(
        { message: 'This invite code has expired' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create user
    const userId = `user_${uuidv4()}`;
    const newUser = {
      id: userId,
      email,
      name: email.split('@')[0], // Default name from email
      password: hashedPassword,
      role: 'member', // Default role for invited users
      company_id: mockInvite.company_id,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);

    // In a real app, you would mark the invite as used here
    // await markInviteAsUsed(invite_code, userId);

    // Return success response (without sensitive data)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      message: 'Registration successful',
      user_id: userId,
      company_id: mockInvite.company_id,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Join error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
