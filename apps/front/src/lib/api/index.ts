// Import API classes
import { AuthAPI } from './auth';
import { LeadsAPI } from './leads';
import { CampaignsAPI } from './campaigns';
import { WorkflowsAPI } from './workflows';
import { RepliesAPI } from './replies';
import { BookingsAPI } from './bookings';
import { AIPersonasAPI } from './ai-personas';
import { EnrichmentAPI } from './enrichment';
import { UsageMetricsAPI } from './usage-metrics';
import { AdminAPI } from './admin';
import { TargetAudienceTranslatorAPI } from './target-audience-translator';

// Main API exports
export { apiClient } from './client';
export { AuthAPI } from './auth';
export { LeadsAPI } from './leads';
export { CampaignsAPI } from './campaigns';
export { WorkflowsAPI } from './workflows';
export { RepliesAPI } from './replies';
export { BookingsAPI } from './bookings';
export { AIPersonasAPI } from './ai-personas';
export { EnrichmentAPI } from './enrichment';
export { UsageMetricsAPI } from './usage-metrics';
export { AdminAPI } from './admin';
export { TargetAudienceTranslatorAPI } from './target-audience-translator';

// Export all types from the main client
export type {
  // Core types
  User,
  Company,
  PaginatedResponse,
  ApiError,
  
  // Auth types
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  LogoutRequest,
  
  // Lead types
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
  QueryLeadsRequest,
  EnrichmentData,
  
  // Campaign types
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  QueryCampaignsRequest,
  
  // Workflow types
  Workflow,
  WorkflowExecution,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  ExecuteWorkflowRequest,
  QueryWorkflowsRequest,
  QueryExecutionsRequest,
  
  // Reply types
  Reply,
  CreateReplyRequest,
  UpdateReplyRequest,
  QueryRepliesRequest,
  
  // Booking types
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  RescheduleBookingRequest,
  CancelBookingRequest,
  QueryBookingsRequest,
  
  // AI Persona types
  AIPersona,
  CreateAIPersonaRequest,
  UpdateAIPersonaRequest,
  
  // Enrichment types
  EnrichmentRequest,
  TriggerEnrichmentRequest,
  RetryEnrichmentRequest,
  QueryEnrichmentRequest,
  
  // Usage Metrics types
  UsageMetric,
  UsageMetricsOverview,
  CreateUsageMetricRequest,
  
  // Admin types
  AdminActionLog,
  GlobalMetricsSummary,
  UpdateCompanyStatusRequest,
  UpdateCompanyPlanRequest,
  CreateSystemNotificationRequest,
  QueryAdminActionLogsRequest,
  
  // Target Audience Translator types
  TargetAudienceTranslator,
  CreateTargetAudienceTranslatorRequest,
  QueryTargetAudienceTranslatorRequest,
  TargetAudienceTranslatorStats,
  EnrichmentField,
  EnrichmentSchema,
  GeneratedLead,
  InterpretedCriteria,
  StructuredTargetingData,
} from './client';

// Export InputFormat as a value
export { InputFormat } from './client';

// Create singleton instances for easy use
export const auth = new AuthAPI();
export const leads = new LeadsAPI();
export const campaigns = new CampaignsAPI();
export const workflows = new WorkflowsAPI();
export const replies = new RepliesAPI();
export const bookings = new BookingsAPI();
export const aiPersonas = new AIPersonasAPI();
export const enrichment = new EnrichmentAPI();
export const usageMetrics = new UsageMetricsAPI();
export const admin = new AdminAPI();
export const targetAudienceTranslator = new TargetAudienceTranslatorAPI(); 