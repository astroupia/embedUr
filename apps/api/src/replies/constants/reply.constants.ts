export enum ReplyClassification {
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  AUTO_REPLY = 'AUTO_REPLY',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
  QUESTION = 'QUESTION',
  NEUTRAL = 'NEUTRAL',
}

export enum BookingStatus {
  BOOKED = 'BOOKED',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}

export enum ReplySource {
  SMARTLEAD = 'SMARTLEAD',
  MANUAL = 'MANUAL',
  WEBHOOK = 'WEBHOOK',
}

export const REPLY_CLASSIFICATION_LABELS = {
  [ReplyClassification.INTERESTED]: 'Interested',
  [ReplyClassification.NOT_INTERESTED]: 'Not Interested',
  [ReplyClassification.AUTO_REPLY]: 'Auto Reply',
  [ReplyClassification.UNSUBSCRIBE]: 'Unsubscribe',
  [ReplyClassification.QUESTION]: 'Question',
  [ReplyClassification.NEUTRAL]: 'Neutral',
};

export const BOOKING_STATUS_LABELS = {
  [BookingStatus.BOOKED]: 'Booked',
  [BookingStatus.RESCHEDULED]: 'Rescheduled',
  [BookingStatus.CANCELLED]: 'Cancelled',
  [BookingStatus.COMPLETED]: 'Completed',
  [BookingStatus.PENDING]: 'Pending',
};

export const REPLY_VALIDATION_RULES = {
  MAX_CONTENT_LENGTH: 10000,
  MIN_CONTENT_LENGTH: 1,
  MAX_SUBJECT_LENGTH: 200,
};

export const BOOKING_VALIDATION_RULES = {
  MAX_CALENDLY_LINK_LENGTH: 500,
  MIN_SCHEDULED_TIME_OFFSET: 15 * 60 * 1000, // 15 minutes in milliseconds
  MAX_SCHEDULED_TIME_OFFSET: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
};

export const REPLY_WORKFLOW_CONFIG = {
  WORKFLOW_TYPE: 'LEAD_ROUTING',
  TRIGGERED_BY: 'ReplyService',
  TIMEOUT_MS: 300000, // 5 minutes
  MAX_RETRIES: 3,
};

export const BOOKING_WORKFLOW_CONFIG = {
  WORKFLOW_TYPE: 'LEAD_ROUTING',
  TRIGGERED_BY: 'BookingService',
  TIMEOUT_MS: 60000, // 1 minute
  MAX_RETRIES: 2,
}; 