import type { NormalizedEvent } from '@types/index';

// Interface all source adapters must implement
export interface IngestionAdapter {
  readonly source: string;
  fetchEvents(options: FetchOptions): Promise<NormalizedEvent[]>;
}

export interface FetchOptions {
  lat: number;
  lng: number;
  radiusKm: number;
  fromDate: Date;
}
