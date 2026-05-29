// Queue name constants — never use magic strings
export const QUEUES = {
  INGESTION: 'ingestion',
  CURATION: 'curation',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

// Job names within queues
export const JOB_NAMES = {
  INGEST_EVENTBRITE: 'ingest:eventbrite',
  INGEST_MEETUP: 'ingest:meetup',
  INGEST_FACEBOOK: 'ingest:facebook',
  CURATE_USER: 'curate:user',
} as const;
