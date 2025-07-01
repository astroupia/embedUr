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
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  companyId: string;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  schemaName: string;
  email: string;
  industry: string | null;
  employees: number;
  status: string;
  createdAt: string;
}

// In-memory storage for demo purposes - replace with your database
const users: User[] = [];
const companies: Company[] = [];

// Helper function to generate unique schema name
const generateSchemaName = (companyName: string): string => {
  const cleanName = companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${cleanName}${randomSuffix}`;
};

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

    // Check if company name already exists
    const companyExists = companies.some(company => company.name === company_name);
    if (companyExists) {
      return NextResponse.json(
        { message: 'Company with this name already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create company with updated schema
    const companyId = `comp_${uuidv4()}`;
    const company = {
      id: companyId,
      name: company_name,
      schemaName: generateSchemaName(company_name),
      email: email, // Primary contact email for the company
      industry: industry || null,
      employees: 1, // Default to 1 for demo
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    companies.push(company);

    // Create user with updated schema
    const userId = `user_${uuidv4()}`;
    const newUser = {
      id: userId,
      email,
      firstName: company_name, // Using company name as firstName
      lastName: 'Admin', // Hardcoded as per requirements
      password: hashedPassword,
      role: 'ADMIN', // First user is admin
      companyId: companyId,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);

    // Return success response (without sensitive data)
    const { password: _unusedPassword, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      message: 'Registration successful',
      userId: userId,
      companyId: companyId,
      company: {
        id: company.id,
        name: company.name,
        schemaName: company.schemaName,
        email: company.email,
        industry: company.industry,
        employees: company.employees,
        status: company.status,
      },
      user: userWithoutPassword,
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
