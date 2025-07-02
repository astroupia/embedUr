import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real implementation, you would query your database
    // SELECT COUNT(*) FROM leads WHERE company_id = ?
    
    const mockCount = 1234;
    
    return NextResponse.json({ total: mockCount });
  } catch (error) {
    console.error('Leads count error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 