export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  BOOKED = 'BOOKED',
  DO_NOT_CONTACT = 'DO_NOT_CONTACT',
}

export enum LeadSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  FULL_NAME = 'fullName',
  EMAIL = 'email',
  STATUS = 'status',
}

export enum LeadSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export const LEAD_DEFAULT_PAGE_SIZE = 20;
export const LEAD_MAX_PAGE_SIZE = 100;

export const LEAD_SCORE_WEIGHTS = {
  EMAIL_VERIFIED: 10,
  LINKEDIN_URL_PRESENT: 5,
  ENRICHMENT_DATA_PRESENT: 15,
  RECENT_ACTIVITY: 20,
} as const;

export const LEAD_DUPLICATE_THRESHOLD = 0.8; // 80% similarity threshold 