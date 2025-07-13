export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum CampaignSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  STATUS = 'status',
}

export enum CampaignSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export const CAMPAIGN_DEFAULT_PAGE_SIZE = 20;
export const CAMPAIGN_MAX_PAGE_SIZE = 100;

// Status transition rules
export const VALID_STATUS_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  [CampaignStatus.DRAFT]: [CampaignStatus.ACTIVE, CampaignStatus.ARCHIVED],
  [CampaignStatus.ACTIVE]: [CampaignStatus.PAUSED, CampaignStatus.COMPLETED, CampaignStatus.ARCHIVED],
  [CampaignStatus.PAUSED]: [CampaignStatus.ACTIVE, CampaignStatus.COMPLETED, CampaignStatus.ARCHIVED],
  [CampaignStatus.COMPLETED]: [CampaignStatus.ARCHIVED],
  [CampaignStatus.ARCHIVED]: [], // No transitions allowed from archived
};

// Business rules
export const CAMPAIGN_BUSINESS_RULES = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// Campaign scoring weights
export const CAMPAIGN_SCORE_WEIGHTS = {
  ACTIVE_STATUS: 10,
  HAS_AI_PERSONA: 15,
  HAS_WORKFLOW: 20,
  HAS_LEADS: 25,
} as const; 