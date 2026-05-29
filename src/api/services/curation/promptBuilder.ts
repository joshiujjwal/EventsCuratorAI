import type { UserProfile, Event, CurationItem } from '@types/index';
import { env } from '@config/env';

/**
 * Builds the prompt payload for GPT-4o event curation.
 * This is the source of truth for the prompt structure — change it here only.
 */
export interface PromptPayload {
  systemPrompt: string;
  userPrompt: string;
}

export interface CandidateEventSummary {
  id: string;
  title: string;
  category: string | null;
  date: string;
  locationName: string | null;
}

export function buildCurationPrompt(
  user: UserProfile,
  candidates: CandidateEventSummary[],
  interactionContext: InteractionContext,
): PromptPayload {
  const systemPrompt = `You are an event curation assistant. Given a user profile and a list of candidate events, return a JSON array of recommendations sorted by relevance.
Each item must have: { "event_id": string, "score": number (0–1), "reasoning": string (max 20 words) }
Only include events with score >= 0.4. Return valid JSON only — no prose, no markdown code blocks.`;

  const candidateList = candidates
    .slice(0, env.CURATION_MAX_CANDIDATES)
    .map(
      (e) =>
        `- ID: ${e.id} | "${e.title}" | ${e.category ?? 'General'} | ${e.date} | ${e.locationName ?? 'Location TBD'}`,
    )
    .join('\n');

  const topCategories = Object.entries(interactionContext.categoryEngagement)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, count]) => `${cat} (${count} interactions)`)
    .join(', ');

  const userPrompt = `User Profile:
- Interests: ${user.interests.join(', ') || 'Not specified'}
- Location: lat ${user.homeLat}, lng ${user.homeLng} (radius: ${user.searchRadius}km)
- Past engagement: ${topCategories || 'No history yet'}

Candidate Events (${candidates.length} total, showing top ${Math.min(candidates.length, env.CURATION_MAX_CANDIDATES)}):
${candidateList}

Return a JSON array of recommendations.`;

  return { systemPrompt, userPrompt };
}

export interface InteractionContext {
  /** Map of category → interaction count (view/save/attend) */
  categoryEngagement: Record<string, number>;
}

// Zod schema for validating GPT response — imported by CurationResponseParser
export const CURATION_RESPONSE_ITEM_KEYS: (keyof CurationItem)[] = [
  'event_id',
  'score',
  'reasoning',
];
