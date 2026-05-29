import { z } from 'zod';
import type { CurationItem } from '@types/index';

export class CurationParseError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: string,
  ) {
    super(message);
    this.name = 'CurationParseError';
  }
}

const CurationItemSchema = z.object({
  event_id: z.string().min(1),
  score: z.number().min(0).max(1),
  reasoning: z.string().max(200),
});

const CurationResponseSchema = z.array(CurationItemSchema);

/**
 * Parses and validates a raw GPT-4o JSON response into typed CurationItem[].
 * Throws CurationParseError if the response is invalid — callers must handle this.
 */
export function parseCurationResponse(rawResponse: string): CurationItem[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawResponse.trim());
  } catch {
    throw new CurationParseError(
      `GPT response is not valid JSON: ${rawResponse.slice(0, 100)}`,
      rawResponse,
    );
  }

  const result = CurationResponseSchema.safeParse(parsed);

  if (!result.success) {
    throw new CurationParseError(
      `GPT response failed schema validation: ${result.error.message}`,
      rawResponse,
    );
  }

  return result.data;
}
