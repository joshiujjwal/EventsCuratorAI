import { describe, it, expect } from 'vitest';
import { parseCurationResponse, CurationParseError } from './responseParser';

describe('CurationResponseParser', () => {
  it('parses a valid GPT JSON response into CurationItem[]', () => {
    const raw = JSON.stringify([
      { event_id: 'evt-1', score: 0.92, reasoning: 'Matches your interest in tech meetups' },
      { event_id: 'evt-2', score: 0.75, reasoning: 'Close to your location and free entry' },
    ]);

    const result = parseCurationResponse(raw);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ event_id: 'evt-1', score: 0.92 });
    expect(result[1]).toMatchObject({ event_id: 'evt-2', score: 0.75 });
  });

  it('throws CurationParseError on invalid JSON', () => {
    expect(() => parseCurationResponse('not json at all')).toThrow(CurationParseError);
    expect(() => parseCurationResponse('not json at all')).toThrow(
      'GPT response is not valid JSON',
    );
  });

  it('throws CurationParseError when score is out of range', () => {
    const raw = JSON.stringify([{ event_id: 'evt-1', score: 1.5, reasoning: 'Too high' }]);
    expect(() => parseCurationResponse(raw)).toThrow(CurationParseError);
  });

  it('throws CurationParseError when event_id is missing', () => {
    const raw = JSON.stringify([{ score: 0.8, reasoning: 'Missing ID' }]);
    expect(() => parseCurationResponse(raw)).toThrow(CurationParseError);
  });

  it('throws CurationParseError when response is a JSON object (not array)', () => {
    const raw = JSON.stringify({ event_id: 'evt-1', score: 0.9, reasoning: 'Wrong shape' });
    expect(() => parseCurationResponse(raw)).toThrow(CurationParseError);
  });

  it('returns empty array for empty GPT response array', () => {
    const result = parseCurationResponse('[]');
    expect(result).toHaveLength(0);
  });

  it('accepts scores exactly at 0 and 1 boundaries', () => {
    const raw = JSON.stringify([
      { event_id: 'evt-min', score: 0.0, reasoning: 'Minimum score' },
      { event_id: 'evt-max', score: 1.0, reasoning: 'Maximum score' },
    ]);
    const result = parseCurationResponse(raw);
    expect(result[0]?.score).toBe(0);
    expect(result[1]?.score).toBe(1);
  });
});
