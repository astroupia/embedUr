import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  company_name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
});

// Define interfaces for type safety
interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  company_id: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  industry: string | null;
  created_at: string;
}

// In-memory storage for demo purposes - replace with your database
const users: User[] = [];
const companies: Company[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, company_name, industry } = registerSchema.parse(body);

    // Check if user already exists
    const userExists = users.some(user => user.email === email);
    if (userExists) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create company
    const companyId = `comp_${uuidv4()}`;
    const company = {
      id: companyId,
      name: company_name,
      industry: industry || null,
      created_at: new Date().toISOString(),
    };
    companies.push(company);

    // Create user
    const userId = `user_${uuidv4()}`;
    const newUser = {
      id: userId,
      email,
      name: email.split('@')[0], // Default name from email
      password: hashedPassword,
      role: 'admin', // First user is admin
      company_id: companyId,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);

    // Return success response (without sensitive data)
    const { password: _unusedPassword, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      message: 'Registration successful',
      user_id: userId,
      company_id: companyId,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
