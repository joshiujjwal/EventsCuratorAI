import type { IngestionAdapter, FetchOptions } from './adapter';
import type { NormalizedEvent } from '@types/index';
import { logger } from '@lib/logger';

/**
 * Meetup.com ingestion adapter.
 * TODO: Implement GraphQL API queries.
 * Docs: https://www.meetup.com/api/guide
 */
export class MeetupAdapter implements IngestionAdapter {
  readonly source = 'meetup' as const;

  async fetchEvents(_options: FetchOptions): Promise<NormalizedEvent[]> {
    // TODO: implement
    // 1. Build GraphQL query with lat/lng radius
    // 2. Paginate with cursor
    // 3. Map each result through normalizeEvent()
    logger.warn({ source: this.source }, 'Meetup adapter not yet implemented');
    return [];
  }
}
