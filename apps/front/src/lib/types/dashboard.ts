// Dashboard-related TypeScript interfaces

export interface DashboardStats {
  totalLeads: number;
  activeCampaigns: number;
  upcomingBookings: {
    count: number;
    next?: {
      id: string;
      meeting_time: string;
    };
  };
  aiInteractions: {
    drafts: number;
    replies: number;
  };
}

export interface WorkflowRun {
  id: string;
  workflow_type: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
  created_at: string;
  message?: string;
}

export interface Notification {
  id: string;
  message: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  created_at: string;
  read: boolean;
  link?: string;
}

export interface Company {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  status: 'NEW' | 'CONTACTED' | 'RESPONDED' | 'BOOKED' | 'FAILED';
  verified: boolean;
  created_at: string;
  job_title?: string;
  linkedin_profile?: string;
  phone?: string;
  company_name?: string;
  company_size?: string;
  data?: Record<string, any>; // Enrichment data
  email_logs?: EmailLog[];
  booking?: Booking;
}

export interface EmailLog {
  id: string;
  lead_id: string;
  email_type: 'SENT' | 'RECEIVED';
  subject?: string;
  content?: string;
  created_at: string;
  status: 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'FAILED';
}

export interface Booking {
  id: string;
  lead_id: string;
  meeting_time: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  ai_persona_id: string;
  ai_persona_name?: string;
  workflow_type: string;
  created_at: string;
  description?: string;
  lead_source?: string;
  routing_config?: Record<string, any>;
  email_logs?: EmailLog[];
  stats?: {
    emails_sent: number;
    open_rate: number;
    reply_rate: number;
    booking_rate: number;
  };
  workflow_runs?: WorkflowRun[];
}

export interface AIPersona {
  id: string;
  name: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateLeadRequest {
  full_name: string;
  email: string;
  linkedin_profile?: string;
  trigger_enrichment?: boolean;
}

export interface UpdateLeadRequest {
  status?: string;
  full_name?: string;
  email?: string;
  linkedin_profile?: string;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  ai_persona_id: string;
  lead_source?: string;
  routing_config?: Record<string, any>;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  status?: string;
  routing_config?: Record<string, any>;
} 