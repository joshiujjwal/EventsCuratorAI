import { describe, it, expect } from 'vitest';
import { buildCurationPrompt } from './promptBuilder';
import type { UserProfile } from '@types/index';

const mockUser: UserProfile = {
  id: 'user-1',
  auth0Id: 'auth0|abc123',
  email: 'test@example.com',
  displayName: 'Test User',
  interests: ['tech', 'AI', 'startups'],
  homeLat: 37.7749,
  homeLng: -122.4194,
  searchRadius: 25,
  createdAt: new Date(),
};

const mockCandidates = [
  { id: 'evt-1', title: 'AI Summit SF', category: 'Technology', date: '2024-06-15', locationName: 'San Francisco' },
  { id: 'evt-2', title: 'Startup Pitch Night', category: 'Business', date: '2024-06-20', locationName: 'Oakland' },
];

describe('CurationPromptBuilder', () => {
  it('includes user interests in the user prompt', () => {
    const { userPrompt } = buildCurationPrompt(mockUser, mockCandidates, { categoryEngagement: {} });
    expect(userPrompt).toContain('tech');
    expect(userPrompt).toContain('AI');
    expect(userPrompt).toContain('startups');
  });

  it('includes all candidate event IDs in the user prompt', () => {
    const { userPrompt } = buildCurationPrompt(mockUser, mockCandidates, { categoryEngagement: {} });
    expect(userPrompt).toContain('evt-1');
    expect(userPrompt).toContain('evt-2');
  });

  it('includes user location in the user prompt', () => {
    const { userPrompt } = buildCurationPrompt(mockUser, mockCandidates, { categoryEngagement: {} });
    expect(userPrompt).toContain('37.7749');
    expect(userPrompt).toContain('-122.4194');
  });

  it('system prompt instructs JSON-only output', () => {
    const { systemPrompt } = buildCurationPrompt(mockUser, mockCandidates, { categoryEngagement: {} });
    expect(systemPrompt).toContain('JSON');
    expect(systemPrompt).toContain('no prose');
  });

  it('includes interaction context when present', () => {
    const { userPrompt } = buildCurationPrompt(mockUser, mockCandidates, {
      categoryEngagement: { Technology: 5, Business: 2 },
    });
    expect(userPrompt).toContain('Technology');
    expect(userPrompt).toContain('5 interactions');
  });

  it('handles user with no interests gracefully', () => {
    const noInterestUser = { ...mockUser, interests: [] };
    const { userPrompt } = buildCurationPrompt(noInterestUser, mockCandidates, { categoryEngagement: {} });
    expect(userPrompt).toContain('Not specified');
  });
});
