import { NextResponse } from 'next/server';
import { DashboardStats } from '@/lib/types/dashboard';

// Mock data - replace with actual database queries
const mockDashboardStats: DashboardStats = {
  totalLeads: 2847,
  activeCampaigns: 8,
  upcomingBookings: {
    count: 12,
    next: {
      id: 'booking-1',
      meeting_time: '2024-01-15T14:30:00Z'
    }
  },
  aiInteractions: {
    drafts: 156,
    replies: 89
  }
};

export async function GET() {
  try {
    // In a real implementation, you would:
    // 1. Get total leads from /leads/count
    // 2. Get active campaigns from /campaigns/count?status=ACTIVE
    // 3. Get upcoming bookings from /bookings/upcoming
    // 4. Get AI interactions from /ai/interactions/summary
    
    // For now, return mock data
    return NextResponse.json(mockDashboardStats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 