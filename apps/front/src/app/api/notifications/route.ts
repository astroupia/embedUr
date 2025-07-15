import { NextResponse } from 'next/server';
import { Notification } from '@/lib/types/dashboard';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread');
    
    // In a real implementation, you would query your database
    // SELECT * FROM notifications WHERE company_id = ? AND read = ? ORDER BY created_at DESC
    
    const mockNotifications: Notification[] = [
      {
        id: 'notif-1',
        message: 'New lead added: John Doe',
        level: 'INFO',
        created_at: '2024-01-15T10:00:00Z',
        read: false,
        link: '/leads/123'
      },
      {
        id: 'notif-2',
        message: 'Campaign "Q1 Outreach" completed',
        level: 'SUCCESS',
        created_at: '2024-01-15T09:30:00Z',
        read: false,
        link: '/campaigns/456'
      },
      {
        id: 'notif-3',
        message: 'Email verification failed for lead@example.com',
        level: 'WARNING',
        created_at: '2024-01-15T09:00:00Z',
        read: true,
        link: '/leads/789'
      },
      {
        id: 'notif-4',
        message: 'Meeting scheduled with Sarah Johnson',
        level: 'INFO',
        created_at: '2024-01-15T08:30:00Z',
        read: true,
        link: '/bookings/101'
      },
      {
        id: 'notif-5',
        message: 'AI response generated for lead inquiry',
        level: 'SUCCESS',
        created_at: '2024-01-15T08:00:00Z',
        read: true,
        link: '/ai/interactions'
      }
    ];
    
    let filteredNotifications = mockNotifications;
    
    if (unread === 'true') {
      filteredNotifications = mockNotifications.filter(n => !n.read);
    }
    
    return NextResponse.json(filteredNotifications);
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 