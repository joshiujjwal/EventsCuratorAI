// Core shared types for EventsCuratorAI

export type EventSource = 'eventbrite' | 'meetup' | 'facebook' | 'manual';

export type InteractionAction = 'view' | 'save' | 'ignore' | 'attend';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  locationName: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
  source: EventSource;
  externalId: string;
  url: string | null;
  imageUrl: string | null;
  organizer: string | null;
  rawPayload: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  auth0Id: string;
  email: string;
  displayName: string | null;
  interests: string[];
  homeLat: number | null;
  homeLng: number | null;
  searchRadius: number;
  createdAt: Date;
}

export interface Recommendation {
  id: string;
  userId: string;
  eventId: string;
  score: number;
  reasoning: string;
  generatedAt: Date;
  event?: Event;
}

export interface IngestionRun {
  id: string;
  source: EventSource;
  status: 'running' | 'success' | 'failed';
  eventsFetched: number;
  eventsNew: number;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

// Normalized event before DB insert (no id / timestamps)
export type NormalizedEvent = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;

// GPT curation response item (before validation)
export interface CurationItem {
  event_id: string;
  score: number;
  reasoning: string;
}
