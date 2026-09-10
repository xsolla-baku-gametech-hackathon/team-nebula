import { describe, expect, it } from 'vitest';
import { sessionFromStorage } from '@/lib/session/store';

describe('persisted session restoration', () => {
  it('restores stable data and drops invalid list entries', () => {
    const restored = sessionFromStorage(JSON.stringify({
      version: 1,
      state: {
        phase: 'analytics',
        description: 'A co-op horror game',
        genres: ['Horror', 42],
        questions: ['How many players?', null],
        competitors: [],
        resultsStale: true,
      },
    }));

    expect(restored).toMatchObject({
      phase: 'analytics',
      description: 'A co-op horror game',
      genres: ['Horror'],
      questions: ['How many players?'],
      resultsStale: true,
    });
  });

  it('falls back safely for corrupt storage', () => {
    expect(sessionFromStorage('{')).toMatchObject({ phase: 'landing', competitors: [] });
    expect(sessionFromStorage(JSON.stringify({ state: { phase: 'unknown' } }))).toMatchObject({ phase: 'landing' });
  });
});
