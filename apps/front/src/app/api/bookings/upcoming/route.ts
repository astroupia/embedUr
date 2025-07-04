import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real implementation, you would query your database
    // SELECT COUNT(*) FROM bookings WHERE meeting_time >= NOW() AND company_id = ?
    // SELECT * FROM bookings WHERE meeting_time >= NOW() AND company_id = ? ORDER BY meeting_time ASC LIMIT 1
    
    const mockData = {
      count: 3,
      next: {
        id: 'booking-1',
        meeting_time: '2024-01-15T10:00:00Z'
      }
    };
    
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Upcoming bookings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 