import { NextResponse } from 'next/server';
import { WorkflowRun } from '@/lib/types/dashboard';

export async function GET() {
  try {
    // In a real implementation, you would query your database
    // SELECT * FROM workflow_runs WHERE company_id = ? ORDER BY created_at DESC LIMIT 5
    
    const mockWorkflowRuns: WorkflowRun[] = [
      {
        id: 'run-1',
        workflow_type: 'lead_enrichment',
        status: 'SUCCESS',
        created_at: '2024-01-15T09:30:00Z',
        message: 'Lead enriched successfully'
      },
      {
        id: 'run-2',
        workflow_type: 'email_campaign',
        status: 'SUCCESS',
        created_at: '2024-01-15T09:15:00Z',
        message: 'Campaign emails sent'
      },
      {
        id: 'run-3',
        workflow_type: 'lead_verification',
        status: 'FAILED',
        created_at: '2024-01-15T09:00:00Z',
        message: 'Email verification failed'
      },
      {
        id: 'run-4',
        workflow_type: 'booking_scheduler',
        status: 'SUCCESS',
        created_at: '2024-01-15T08:45:00Z',
        message: 'Meeting scheduled'
      },
      {
        id: 'run-5',
        workflow_type: 'ai_response',
        status: 'SUCCESS',
        created_at: '2024-01-15T08:30:00Z',
        message: 'AI response generated'
      }
    ];
    
    return NextResponse.json(mockWorkflowRuns);
  } catch (error) {
    console.error('Recent workflow runs error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 