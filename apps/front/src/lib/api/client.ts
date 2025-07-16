import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types for API responses
export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}

// User and Company types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'MEMBER' | 'READ_ONLY';
  companyId: string;
  linkedinUrl?: string | null;
  profileUrl?: string | null;
  twitterUsername?: string | null;
  facebookUsername?: string | null;
  instagramUsername?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  schemaName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_DELETION';
  planId?: string | null;
  industry: string;
  location?: string | null;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  employees: number;
  revenue?: number | null;
  linkedinUsername?: string | null;
  twitterUsername?: string | null;
  facebookUsername?: string | null;
  instagramUsername?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface RegisterRequest {
  email: string;
  password: string;
  companyName: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// Lead types
export interface EnrichmentData {
  company?: string;
  title?: string;
  location?: string;
  industry?: string;
  linkedinProfile?: string;
  phone?: string;
  website?: string;
  [key: string]: any;
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  linkedinUrl: string | null;
  enrichmentData: EnrichmentData | null;
  verified: boolean;
  status: 'NEW' | 'CONTACTED' | 'RESPONDED' | 'QUALIFIED' | 'BOOKED' | 'LOST';
  companyId: string;
  campaignId: string;
  createdAt: Date;
  updatedAt: Date;
  campaign?: {
    id: string;
    name: string;
    aiPersona?: {
      id: string;
      name: string;
    } | null;
  } | null;
  score: number;
  isQualified: boolean;
  hasEnrichmentData: boolean;
  companyName: string | null;
  jobTitle: string | null;
  location: string | null;
}

export interface CreateLeadRequest {
  fullName: string;
  email: string;
  linkedinUrl?: string;
  enrichmentData?: Record<string, any>;
  verified?: boolean;
  status?: 'NEW' | 'CONTACTED' | 'RESPONDED' | 'QUALIFIED' | 'BOOKED' | 'LOST';
  campaignId: string;
}

export interface UpdateLeadRequest {
  fullName?: string;
  email?: string;
  linkedinUrl?: string;
  enrichmentData?: Record<string, any>;
  verified?: boolean;
  status?: 'NEW' | 'CONTACTED' | 'RESPONDED' | 'QUALIFIED' | 'BOOKED' | 'LOST';
}

export interface QueryLeadsRequest {
  cursor?: string;
  take?: number;
  status?: 'NEW' | 'CONTACTED' | 'RESPONDED' | 'QUALIFIED' | 'BOOKED' | 'LOST';
  search?: string;
  campaignId?: string;
}

// Campaign types
export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  aiPersonaId?: string | null;
  workflowId?: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  aiPersona?: {
    id: string;
    name: string;
  } | null;
  workflow?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  aiPersonaId?: string;
  workflowId?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  aiPersonaId?: string;
  workflowId?: string;
}

export interface QueryCampaignsRequest {
  cursor?: string;
  take?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  search?: string;
}

// Workflow types
export interface Workflow {
  id: string;
  name: string;
  type: 'ENRICHMENT' | 'EMAIL_SEQUENCE' | 'LEAD_ROUTING';
  n8nWorkflowId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  executionCount: number;
  lastExecution?: {
    id: string;
    status: string;
    startTime: Date;
    endTime?: Date | null;
  } | null;
  isActive: boolean;
  typeDescription: string;
  canBeDeleted: boolean;
  isEnrichmentWorkflow: boolean;
  isEmailSequenceWorkflow: boolean;
  isRoutingWorkflow: boolean;
}

export interface CreateWorkflowRequest {
  name: string;
  type: 'ENRICHMENT' | 'EMAIL_SEQUENCE' | 'LEAD_ROUTING';
  n8nWorkflowId: string;
}

export interface UpdateWorkflowRequest {
  name?: string;
  type?: 'ENRICHMENT' | 'EMAIL_SEQUENCE' | 'LEAD_ROUTING';
  n8nWorkflowId?: string;
}

export interface ExecuteWorkflowRequest {
  inputData: Record<string, any>;
  leadId?: string;
  campaignId?: string;
}

export interface WorkflowExecution {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  triggeredBy: string;
  startTime: Date;
  endTime?: Date | null;
  inputData: Record<string, any> | null;
  outputData: Record<string, any> | null;
  durationMs?: number | null;
  leadId?: string | null;
  workflowId: string;
  companyId: string;
  errorMessage?: string;
  isCompleted: boolean;
  isRunning: boolean;
  isSuccessful: boolean;
  isFailed: boolean;
  durationSeconds?: number | null;
  hasError: boolean;
}

export interface QueryWorkflowsRequest {
  cursor?: string;
  take?: number;
  type?: 'ENRICHMENT' | 'EMAIL_SEQUENCE' | 'LEAD_ROUTING';
  search?: string;
}

export interface QueryExecutionsRequest {
  cursor?: string;
  take?: number;
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  workflowId?: string;
  leadId?: string;
}

// Reply types
export interface Reply {
  id: string;
  content: string;
  classification: 'INTERESTED' | 'NOT_INTERESTED' | 'NEUTRAL';
  leadId: string;
  emailLogId: string;
  companyId: string;
  handledBy?: string | null;
  source: 'EMAIL' | 'LINKEDIN' | 'SMS' | 'OTHER';
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  isInterested: boolean;
  isNegative: boolean;
  isNeutral: boolean;
  isAutoReply: boolean;
  sentimentScore: number;
  requiresAttention: boolean;
  summary: string;
  priority: 'high' | 'medium' | 'low';
  isRecent: boolean;
}

export interface CreateReplyRequest {
  content: string;
  leadId: string;
  emailLogId: string;
  source?: 'EMAIL' | 'LINKEDIN' | 'SMS' | 'OTHER';
  metadata?: Record<string, any>;
}

export interface UpdateReplyRequest {
  content?: string;
  classification?: 'INTERESTED' | 'NOT_INTERESTED' | 'NEUTRAL';
  handledBy?: string;
  metadata?: Record<string, any>;
}

export interface QueryRepliesRequest {
  cursor?: string;
  take?: number;
  classification?: 'INTERESTED' | 'NOT_INTERESTED' | 'NEUTRAL';
  source?: 'EMAIL' | 'LINKEDIN' | 'SMS' | 'OTHER';
  leadId?: string;
  search?: string;
}

// Booking types
export interface Booking {
  id: string;
  calendlyLink: string;
  scheduledTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  leadId: string;
  companyId: string;
  replyId?: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isConfirmed: boolean;
  isCancelled: boolean;
  isCompleted: boolean;
  isUpcoming: boolean;
  isToday: boolean;
  timeUntilBooking: number;
  statusLabel: string;
  priority: 'high' | 'medium' | 'low';
  summary: string;
  relativeTime: string;
  calendlyEventId?: string | null;
  isOverdue: boolean;
  durationMinutes?: number | null;
  meetingType?: string | null;
}

export interface CreateBookingRequest {
  calendlyLink: string;
  scheduledTime: string;
  leadId: string;
  replyId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  metadata?: Record<string, any>;
}

export interface UpdateBookingRequest {
  calendlyLink?: string;
  scheduledTime?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  metadata?: Record<string, any>;
}

export interface RescheduleBookingRequest {
  scheduledTime: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface QueryBookingsRequest {
  cursor?: string;
  take?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  leadId?: string;
  replyId?: string;
  search?: string;
}

// AI Persona types
export interface AIPersona {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  parameters?: Record<string, any>;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAIPersonaRequest {
  name: string;
  description?: string;
  prompt: string;
  parameters?: Record<string, any>;
}

export interface UpdateAIPersonaRequest {
  name?: string;
  description?: string;
  prompt?: string;
  parameters?: Record<string, any>;
}

// Enrichment types
export interface EnrichmentRequest {
  id: string;
  leadId: string;
  provider: 'APOLLO' | 'HUNTER' | 'CLEARBIT' | 'N8N';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  requestData: Record<string, any> | null;
  responseData: Record<string, any> | null;
  errorMessage?: string | null;
  companyId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  lead?: Lead | null;
}

export interface TriggerEnrichmentRequest {
  leadId: string;
  provider?: 'APOLLO' | 'HUNTER' | 'CLEARBIT' | 'N8N';
  requestData?: Record<string, any>;
}

export interface RetryEnrichmentRequest {
  enrichmentId: string;
}

export interface QueryEnrichmentRequest {
  cursor?: string;
  take?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  provider?: 'APOLLO' | 'HUNTER' | 'CLEARBIT' | 'N8N';
  leadId?: string;
}

// Usage Metrics types
export interface UsageMetric {
  id: string;
  companyId: string;
  metricName: 'LEADS_CREATED' | 'WORKFLOWS_EXECUTED' | 'AI_INTERACTIONS' | 'EMAILS_SENT' | 'ENRICHMENTS_COMPLETED';
  value: number;
  period: string;
  timestamp: Date;
  metadata?: Record<string, any> | null;
}

export interface CreateUsageMetricRequest {
  metricName: 'LEADS_CREATED' | 'WORKFLOWS_EXECUTED' | 'AI_INTERACTIONS' | 'EMAILS_SENT' | 'ENRICHMENTS_COMPLETED';
  value: number;
  period?: string;
  metadata?: Record<string, any>;
}

export interface UsageMetricsOverview {
  totalLeads: number;
  totalWorkflows: number;
  totalAiInteractions: number;
  totalEmails: number;
  totalEnrichments: number;
  period: string;
  metrics: UsageMetric[];
}

// Admin types
export interface AdminActionLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any> | null;
  performedBy: string;
  timestamp: Date;
  performedByUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface UpdateCompanyStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_DELETION';
}

export interface UpdateCompanyPlanRequest {
  planId: string;
}

export interface CreateSystemNotificationRequest {
  title: string;
  message: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  targetCompanyId?: string;
}

export interface QueryAdminActionLogsRequest {
  cursor?: string;
  take?: number;
  action?: string;
  targetType?: string;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
}

// Global metrics for admin
export interface GlobalMetricsSummary {
  totalCompanies: number;
  totalLeads: number;
  totalWorkflows: number;
  totalAiInteractions: number;
  totalEmails: number;
  totalEnrichments: number;
}

// Main API Client Class
class ApiClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          this.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth management
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearAuth() {
    this.accessToken = null;
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance(config);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'API Error');
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>({
      method: 'POST',
      url: '/auth/login',
      data,
    });
  }

  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>({
      method: 'POST',
      url: '/auth/refresh',
      data,
    });
  }

  async logout(data: LogoutRequest): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: '/auth/logout',
      data,
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      method: 'GET',
      url: '/auth/verify',
      params: { token },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      method: 'POST',
      url: '/auth/password/forgot',
      data: { email },
    });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      method: 'POST',
      url: '/auth/password/reset',
      data: { token, password },
    });
  }

  // Lead endpoints
  async createLead(data: CreateLeadRequest): Promise<Lead> {
    return this.request<Lead>({
      method: 'POST',
      url: '/leads',
      data,
    });
  }

  async getLeads(params?: QueryLeadsRequest): Promise<PaginatedResponse<Lead>> {
    return this.request<PaginatedResponse<Lead>>({
      method: 'GET',
      url: '/leads',
      params,
    });
  }

  async getLead(id: string): Promise<Lead> {
    return this.request<Lead>({
      method: 'GET',
      url: `/leads/${id}`,
    });
  }

  async updateLead(id: string, data: UpdateLeadRequest): Promise<Lead> {
    return this.request<Lead>({
      method: 'PATCH',
      url: `/leads/${id}`,
      data,
    });
  }

  async deleteLead(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/leads/${id}`,
    });
  }

  // Campaign endpoints
  async createCampaign(data: CreateCampaignRequest): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'POST',
      url: '/campaigns',
      data,
    });
  }

  async getCampaigns(params?: QueryCampaignsRequest): Promise<PaginatedResponse<Campaign>> {
    return this.request<PaginatedResponse<Campaign>>({
      method: 'GET',
      url: '/campaigns',
      params,
    });
  }

  async getCampaign(id: string): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'GET',
      url: `/campaigns/${id}`,
    });
  }

  async updateCampaign(id: string, data: UpdateCampaignRequest): Promise<Campaign> {
    return this.request<Campaign>({
      method: 'PATCH',
      url: `/campaigns/${id}`,
      data,
    });
  }

  async deleteCampaign(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/campaigns/${id}`,
    });
  }

  // Workflow endpoints
  async createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    return this.request<Workflow>({
      method: 'POST',
      url: '/workflows',
      data,
    });
  }

  async getWorkflows(params?: QueryWorkflowsRequest): Promise<PaginatedResponse<Workflow>> {
    return this.request<PaginatedResponse<Workflow>>({
      method: 'GET',
      url: '/workflows',
      params,
    });
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return this.request<Workflow>({
      method: 'GET',
      url: `/workflows/${id}`,
    });
  }

  async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    return this.request<Workflow>({
      method: 'PATCH',
      url: `/workflows/${id}`,
      data,
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/workflows/${id}`,
    });
  }

  async executeWorkflow(id: string, data: ExecuteWorkflowRequest): Promise<WorkflowExecution> {
    return this.request<WorkflowExecution>({
      method: 'POST',
      url: `/workflows/${id}/execute`,
      data,
    });
  }

  async getWorkflowExecutions(params?: QueryExecutionsRequest): Promise<PaginatedResponse<WorkflowExecution>> {
    return this.request<PaginatedResponse<WorkflowExecution>>({
      method: 'GET',
      url: '/workflows/executions',
      params,
    });
  }

  async getWorkflowExecution(id: string): Promise<WorkflowExecution> {
    return this.request<WorkflowExecution>({
      method: 'GET',
      url: `/workflows/executions/${id}`,
    });
  }

  async retryWorkflowExecution(id: string): Promise<WorkflowExecution> {
    return this.request<WorkflowExecution>({
      method: 'POST',
      url: `/workflows/executions/${id}/retry`,
    });
  }

  // Reply endpoints
  async createReply(data: CreateReplyRequest): Promise<Reply> {
    return this.request<Reply>({
      method: 'POST',
      url: '/replies',
      data,
    });
  }

  async getReplies(params?: QueryRepliesRequest): Promise<PaginatedResponse<Reply>> {
    return this.request<PaginatedResponse<Reply>>({
      method: 'GET',
      url: '/replies',
      params,
    });
  }

  async getReply(id: string): Promise<Reply> {
    return this.request<Reply>({
      method: 'GET',
      url: `/replies/${id}`,
    });
  }

  async updateReply(id: string, data: UpdateReplyRequest): Promise<Reply> {
    return this.request<Reply>({
      method: 'PATCH',
      url: `/replies/${id}`,
      data,
    });
  }

  async deleteReply(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/replies/${id}`,
    });
  }

  // Booking endpoints
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    return this.request<Booking>({
      method: 'POST',
      url: '/bookings',
      data,
    });
  }

  async getBookings(params?: QueryBookingsRequest): Promise<PaginatedResponse<Booking>> {
    return this.request<PaginatedResponse<Booking>>({
      method: 'GET',
      url: '/bookings',
      params,
    });
  }

  async getBooking(id: string): Promise<Booking> {
    return this.request<Booking>({
      method: 'GET',
      url: `/bookings/${id}`,
    });
  }

  async updateBooking(id: string, data: UpdateBookingRequest): Promise<Booking> {
    return this.request<Booking>({
      method: 'PATCH',
      url: `/bookings/${id}`,
      data,
    });
  }

  async deleteBooking(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/bookings/${id}`,
    });
  }

  async rescheduleBooking(id: string, data: RescheduleBookingRequest): Promise<Booking> {
    return this.request<Booking>({
      method: 'PUT',
      url: `/bookings/${id}/reschedule`,
      data,
    });
  }

  async cancelBooking(id: string, data: CancelBookingRequest): Promise<Booking> {
    return this.request<Booking>({
      method: 'PUT',
      url: `/bookings/${id}/cancel`,
      data,
    });
  }

  // AI Persona endpoints
  async createAIPersona(data: CreateAIPersonaRequest): Promise<AIPersona> {
    return this.request<AIPersona>({
      method: 'POST',
      url: '/ai-personas',
      data,
    });
  }

  async getAIPersonas(): Promise<AIPersona[]> {
    return this.request<AIPersona[]>({
      method: 'GET',
      url: '/ai-personas',
    });
  }

  async getAIPersona(id: string): Promise<AIPersona> {
    return this.request<AIPersona>({
      method: 'GET',
      url: `/ai-personas/${id}`,
    });
  }

  async updateAIPersona(id: string, data: UpdateAIPersonaRequest): Promise<AIPersona> {
    return this.request<AIPersona>({
      method: 'PUT',
      url: `/ai-personas/${id}`,
      data,
    });
  }

  async deleteAIPersona(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/ai-personas/${id}`,
    });
  }

  // Enrichment endpoints
  async triggerEnrichment(data: TriggerEnrichmentRequest): Promise<EnrichmentRequest> {
    return this.request<EnrichmentRequest>({
      method: 'POST',
      url: '/enrichment/trigger',
      data,
    });
  }

  async getEnrichmentRequests(params?: QueryEnrichmentRequest): Promise<PaginatedResponse<EnrichmentRequest>> {
    return this.request<PaginatedResponse<EnrichmentRequest>>({
      method: 'GET',
      url: '/enrichment',
      params,
    });
  }

  async getEnrichmentRequest(id: string): Promise<EnrichmentRequest> {
    return this.request<EnrichmentRequest>({
      method: 'GET',
      url: `/enrichment/${id}`,
    });
  }

  async retryEnrichment(data: RetryEnrichmentRequest): Promise<EnrichmentRequest> {
    return this.request<EnrichmentRequest>({
      method: 'POST',
      url: '/enrichment/retry',
      data,
    });
  }

  // Usage Metrics endpoints
  async createUsageMetric(data: CreateUsageMetricRequest): Promise<UsageMetric> {
    return this.request<UsageMetric>({
      method: 'POST',
      url: '/usage-metrics',
      data,
    });
  }

  async getUsageMetrics(period?: string): Promise<UsageMetric[]> {
    return this.request<UsageMetric[]>({
      method: 'GET',
      url: '/usage-metrics',
      params: { period },
    });
  }

  async getUsageOverview(): Promise<UsageMetricsOverview> {
    return this.request<UsageMetricsOverview>({
      method: 'GET',
      url: '/usage-metrics/overview',
    });
  }

  // Admin endpoints
  async getAdminActionLogs(params?: QueryAdminActionLogsRequest): Promise<PaginatedResponse<AdminActionLog>> {
    return this.request<PaginatedResponse<AdminActionLog>>({
      method: 'GET',
      url: '/admin/action-logs',
      params,
    });
  }

  async updateCompanyStatus(companyId: string, data: UpdateCompanyStatusRequest): Promise<Company> {
    return this.request<Company>({
      method: 'PUT',
      url: `/admin/companies/${companyId}/status`,
      data,
    });
  }

  async updateCompanyPlan(companyId: string, data: UpdateCompanyPlanRequest): Promise<Company> {
    return this.request<Company>({
      method: 'PUT',
      url: `/admin/companies/${companyId}/plan`,
      data,
    });
  }

  async createSystemNotification(data: CreateSystemNotificationRequest): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: '/admin/notifications',
      data,
    });
  }

  async getGlobalMetricsSummary(): Promise<GlobalMetricsSummary> {
    return this.request<GlobalMetricsSummary>({
      method: 'GET',
      url: '/admin/usage-metrics/summary',
    });
  }

  async getAllCompaniesMetrics(period?: string, metricNames?: string): Promise<UsageMetric[]> {
    return this.request<UsageMetric[]>({
      method: 'GET',
      url: '/admin/usage-metrics',
      params: { period, metricNames },
    });
  }

  async getCompanyMetricsForAdmin(companyId: string): Promise<UsageMetric[]> {
    return this.request<UsageMetric[]>({
      method: 'GET',
      url: `/admin/usage-metrics/${companyId}`,
    });
  }

  async getCompanyUsageOverviewForAdmin(companyId: string): Promise<UsageMetricsOverview> {
    return this.request<UsageMetricsOverview>({
      method: 'GET',
      url: `/admin/usage-metrics/${companyId}/overview`,
    });
  }

  // Health check
  async getHealth(): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/health',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type {
  User,
  Company,
  Lead,
  Campaign,
  Workflow,
  WorkflowExecution,
  Reply,
  Booking,
  AIPersona,
  EnrichmentRequest,
  UsageMetric,
  UsageMetricsOverview,
  AdminActionLog,
  GlobalMetricsSummary,
  PaginatedResponse,
  ApiError,
}; 