import type { IngestionAdapter, FetchOptions } from './adapter';
import type { NormalizedEvent } from '@types/index';
import { logger } from '@lib/logger';

/**
 * Eventbrite ingestion adapter.
 * TODO: Implement OAuth2 token refresh and paginated event search.
 * Docs: https://www.eventbrite.com/platform/api
 */
export class EventbriteAdapter implements IngestionAdapter {
  readonly source = 'eventbrite' as const;

  async fetchEvents(_options: FetchOptions): Promise<NormalizedEvent[]> {
    // TODO: implement
    // 1. Build search URL with lat/lng bounding box
    // 2. Paginate via continuation token
    // 3. Map each result through normalizeEvent()
    logger.warn({ source: this.source }, 'Eventbrite adapter not yet implemented');
    return [];
  }
}
