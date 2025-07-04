// Auth-related TypeScript interfaces

export interface CompanyPayload {
  name: string;
  schemaName: string;
  email: string;
  industry: string;
  employees: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_DELETION';
  planId?: string | null;
  location?: string | null;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  revenue?: number | null;
  linkedinUsername?: string | null;
  twitterUsername?: string | null;
  facebookUsername?: string | null;
  instagramUsername?: string | null;
}

export interface UserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isVerified?: boolean;
  role?: 'ADMIN' | 'MEMBER' | 'READ_ONLY';
  linkedinUrl?: string | null;
  profileUrl?: string | null;
  twitterUsername?: string | null;
  facebookUsername?: string | null;
  instagramUsername?: string | null;
}

export interface CreateCompanyRequest {
  company: CompanyPayload;
  user: UserPayload;
}

export interface CreateCompanyResponse {
  message: string;
  companyId: string;
  userId: string;
}

export interface JoinCompanyRequest {
  email: string;
  password: string;
  invite_code: string;
}

export interface JoinCompanyResponse {
  message: string;
  userId: string;
  companyId: string;
}

export type RegistrationMode = 'new-company' | 'create-user';

export interface RegistrationFormData {
  email: string;
  password: string;
  company_name?: string;
  industry?: string;
  employees?: string;
  invite_code?: string;
} 