import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Lead, PaginatedResponse, CreateLeadRequest } from '@/lib/types/dashboard';

const createLeadSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  linkedin_profile: z.string().url().optional(),
  trigger_enrichment: z.boolean().optional()
});

// Mock data - replace with actual database queries
const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'NEW',
    verified: true,
    created_at: '2024-01-15T10:00:00Z',
    job_title: 'Software Engineer',
    linkedin_profile: 'https://linkedin.com/in/johndoe',
    phone: '+1234567890',
    company_name: 'Tech Corp',
    company_size: '50-100'
  },
  {
    id: 'lead-2',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'CONTACTED',
    verified: false,
    created_at: '2024-01-14T15:30:00Z',
    job_title: 'Marketing Manager',
    company_name: 'Marketing Inc'
  },
  {
    id: 'lead-3',
    full_name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    status: 'RESPONDED',
    verified: true,
    created_at: '2024-01-13T09:15:00Z',
    job_title: 'Sales Director',
    company_name: 'Sales Corp'
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // In a real implementation, you would query your database with pagination and search
    // SELECT * FROM leads WHERE company_id = ? AND (full_name ILIKE ? OR email ILIKE ?) LIMIT ? OFFSET ?
    
    let filteredLeads = mockLeads;
    
    if (search) {
      filteredLeads = mockLeads.filter(lead => 
        lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
    
    const response: PaginatedResponse<Lead> = {
      data: paginatedLeads,
      total: filteredLeads.length,
      page,
      limit,
      totalPages: Math.ceil(filteredLeads.length / limit)
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Leads list error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, linkedin_profile, trigger_enrichment } = createLeadSchema.parse(body);
    
    // In a real implementation, you would:
    // 1. Insert the lead into the database
    // 2. If trigger_enrichment is true, trigger the enrichment workflow
    // 3. Return the created lead
    
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      full_name,
      email,
      status: 'NEW',
      verified: false,
      created_at: new Date().toISOString(),
      linkedin_profile
    };
    
    // Mock enrichment trigger
    if (trigger_enrichment) {
      console.log('Triggering enrichment workflow for:', email);
    }
    
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Create lead error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 