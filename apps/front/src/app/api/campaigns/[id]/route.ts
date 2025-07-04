import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Campaign, UpdateCampaignRequest } from '@/lib/types/dashboard';

const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  routing_config: z.record(z.any()).optional()
});

// Mock data - replace with actual database queries
const mockCampaign: Campaign = {
  id: 'campaign-1',
  name: 'Q1 Outreach',
  status: 'ACTIVE',
  ai_persona_id: 'persona-1',
  ai_persona_name: 'Sales Pro',
  workflow_type: 'email_sequence',
  created_at: '2024-01-15T10:00:00Z',
  description: 'Q1 sales outreach campaign',
  lead_source: 'linkedin',
  routing_config: {
    sequence: [
      { day: 1, template: 'introduction' },
      { day: 3, template: 'follow_up' },
      { day: 7, template: 'final_attempt' }
    ],
    conditions: {
      max_emails: 3,
      wait_between_emails: 2
    }
  },
  email_logs: [
    {
      id: 'email-1',
      lead_id: 'lead-1',
      email_type: 'SENT',
      subject: 'Introduction from Sales Pro',
      created_at: '2024-01-15T11:00:00Z',
      status: 'DELIVERED'
    }
  ],
  stats: {
    emails_sent: 150,
    open_rate: 24.5,
    reply_rate: 8.2,
    booking_rate: 2.1
  },
  workflow_runs: [
    {
      id: 'run-1',
      workflow_type: 'email_campaign',
      status: 'SUCCESS',
      created_at: '2024-01-15T10:30:00Z',
      message: 'Campaign emails sent successfully'
    }
  ]
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // In a real implementation, you would query your database
    // SELECT * FROM campaigns WHERE id = ? AND company_id = ?
    
    if (id !== 'campaign-1') {
      return NextResponse.json(
        { message: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(mockCampaign);
  } catch (error) {
    console.error('Get campaign error:', error);
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
    const updateData = updateCampaignSchema.parse(body);
    
    // In a real implementation, you would:
    // 1. Update the campaign in the database
    // 2. If status is being updated, trigger appropriate workflows
    // 3. Return success message
    
    if (id !== 'campaign-1') {
      return NextResponse.json(
        { message: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Campaign updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Update campaign error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 