import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Lead, UpdateLeadRequest } from '@/lib/types/dashboard';

const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'RESPONDED', 'BOOKED', 'FAILED']).optional(),
  full_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  linkedin_profile: z.string().url().optional()
});

// Mock data - replace with actual database queries
const mockLead: Lead = {
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
  company_size: '50-100',
  data: {
    location: 'San Francisco, CA',
    industry: 'Technology',
    experience: '5 years',
    skills: ['JavaScript', 'React', 'Node.js']
  },
  email_logs: [
    {
      id: 'email-1',
      lead_id: 'lead-1',
      email_type: 'SENT',
      subject: 'Introduction',
      created_at: '2024-01-15T11:00:00Z',
      status: 'DELIVERED'
    }
  ],
  booking: {
    id: 'booking-1',
    lead_id: 'lead-1',
    meeting_time: '2024-01-20T14:00:00Z',
    status: 'SCHEDULED',
    notes: 'Initial discovery call'
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // In a real implementation, you would query your database
    // SELECT * FROM leads WHERE id = ? AND company_id = ?
    
    if (id !== 'lead-1') {
      return NextResponse.json(
        { message: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(mockLead);
  } catch (error) {
    console.error('Get lead error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updateData = updateLeadSchema.parse(body);
    
    // In a real implementation, you would:
    // 1. Update the lead in the database
    // 2. Return success message
    
    if (id !== 'lead-1') {
      return NextResponse.json(
        { message: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Lead updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Update lead error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // In a real implementation, you would:
    // 1. Delete the lead from the database
    // 2. Return success message
    
    if (id !== 'lead-1') {
      return NextResponse.json(
        { message: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 