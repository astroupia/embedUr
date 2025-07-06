import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Campaign, PaginatedResponse, CreateCampaignRequest } from '@/lib/types/dashboard';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  ai_persona_id: z.string().min(1, 'AI persona is required'),
  lead_source: z.string().optional(),
  routing_config: z.record(z.any()).optional()
});

// Mock data - replace with actual database queries
const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Q1 Outreach',
    status: 'ACTIVE',
    ai_persona_id: 'persona-1',
    ai_persona_name: 'Sales Pro',
    workflow_type: 'email_sequence',
    created_at: '2024-01-15T10:00:00Z',
    description: 'Q1 sales outreach campaign',
    lead_source: 'linkedin',
    stats: {
      emails_sent: 150,
      open_rate: 24.5,
      reply_rate: 8.2,
      booking_rate: 2.1
    }
  },
  {
    id: 'campaign-2',
    name: 'Product Launch',
    status: 'DRAFT',
    ai_persona_id: 'persona-2',
    ai_persona_name: 'Marketing Expert',
    workflow_type: 'announcement',
    created_at: '2024-01-14T15:30:00Z',
    description: 'New product launch campaign'
  },
  {
    id: 'campaign-3',
    name: 'Follow-up Sequence',
    status: 'PAUSED',
    ai_persona_id: 'persona-1',
    ai_persona_name: 'Sales Pro',
    workflow_type: 'follow_up',
    created_at: '2024-01-13T09:15:00Z',
    stats: {
      emails_sent: 75,
      open_rate: 18.3,
      reply_rate: 5.1,
      booking_rate: 1.8
    }
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // In a real implementation, you would query your database with pagination and search
    // SELECT * FROM campaigns WHERE company_id = ? AND (name ILIKE ? OR status ILIKE ?) LIMIT ? OFFSET ?
    
    let filteredCampaigns = mockCampaigns;
    
    if (search) {
      filteredCampaigns = mockCampaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(search.toLowerCase()) ||
        campaign.status.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);
    
    const response: PaginatedResponse<Campaign> = {
      data: paginatedCampaigns,
      total: filteredCampaigns.length,
      page,
      limit,
      totalPages: Math.ceil(filteredCampaigns.length / limit)
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Campaigns list error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, ai_persona_id, lead_source, routing_config } = createCampaignSchema.parse(body);
    
    // In a real implementation, you would:
    // 1. Insert the campaign into the database
    // 2. Return the created campaign
    
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name,
      status: 'DRAFT',
      ai_persona_id,
      workflow_type: 'email_sequence',
      created_at: new Date().toISOString(),
      description,
      lead_source,
      routing_config
    };
    
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 