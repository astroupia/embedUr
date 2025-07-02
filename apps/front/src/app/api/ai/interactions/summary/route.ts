import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real implementation, you would query your database
    // SELECT COUNT(*) FROM ai_interactions WHERE type = 'DRAFT' AND company_id = ?
    // SELECT COUNT(*) FROM ai_interactions WHERE type = 'REPLY' AND company_id = ?
    
    const mockData = {
      drafts: 50,
      replies: 25
    };
    
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('AI interactions summary error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 