import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // In a real implementation, you would query your database
    // SELECT COUNT(*) FROM campaigns WHERE company_id = ? AND status = ?
    
    let mockCount = 12; // Total campaigns
    
    if (status === 'ACTIVE') {
      mockCount = 5;
    } else if (status === 'DRAFT') {
      mockCount = 3;
    } else if (status === 'PAUSED') {
      mockCount = 2;
    } else if (status === 'ARCHIVED') {
      mockCount = 2;
    }
    
    return NextResponse.json({ total: mockCount });
  } catch (error) {
    console.error('Campaigns count error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 