import { describe, expect, it } from 'vitest';
import { DiscoverInput, type Candidate } from '@/lib/discovery/types';
import { validatePreviewRanking, validateRanking } from '@/lib/discovery/selection';
import { parseCandidates } from '@/lib/discovery/candidates';
import { steamIdentity } from '@/lib/discovery/steam-identities';
const intent = { multiplayer: true };
const candidates: Candidate[] = [{ igdbId: 1, name: 'Game', description: 'Horror', context: '', gameModes: [2] }];
const validation = { status: 'ready' as const, normalizedDescription: 'Horror multiplayer', confidence: 0.9,
  tags: [
    { name: 'Horror', category: 'theme' as const, priority: 'required' as const, basis: 'explicit' as const },
    { name: 'Multiplayer', category: 'mode' as const, priority: 'required' as const, basis: 'explicit' as const },
  ], mustHave: ['horror'], avoid: [], multiplayer: true, questions: [] };
describe('discovery validation', () => {
  it('defaults to ten games and rejects invalid or excessive requests', () => {
    expect(DiscoverInput.parse({ query: ' horror ' })).toEqual({ query: 'horror', limit: 10 });
    for (const input of [{ query: 'x' }, { query: 'horror', limit: 11 }, { query: 'horror', steamAppIds: [1] }]) expect(DiscoverInput.safeParse(input).success).toBe(false);
  });
  it('rejects hallucinated and duplicate model IDs', () => {
    expect(() => validateRanking({ selections: [{ igdbId: 2, reason: 'Invented' }] }, candidates)).toThrow('unknown');
    expect(() => validateRanking({ selections: [{ igdbId: 1, reason: 'a' }, { igdbId: 1, reason: 'b' }] }, candidates)).toThrow('duplicate');
    expect(validateRanking({ selections: [] }, candidates)).toEqual([]);
  });
  it('rejects match tags that were not validated', () => {
    expect(() => validatePreviewRanking({ selections: [{ igdbId: 1, reason: 'Match', matchedTags: ['Survival'] }] }, candidates, validation)).toThrow('unknown');
    expect(validatePreviewRanking({ selections: [{ igdbId: 1, reason: 'Match', matchedTags: ['Horror'] }] }, candidates, validation)[0].matchedTags).toEqual(['Horror']);
  });
  it('filters missing multiplayer evidence and empty descriptions', () => {
    const result = parseCandidates({ results: [
      { game: { id: 1, name: 'Solo', summary: 'Horror', game_modes: [1] } },
      { game: { id: 2, name: 'Co-op', summary: '<b>Horror</b>', game_modes: [1, 3] } },
      { game: { id: 3, name: 'Empty', game_modes: [2] } },
    ] }, intent);
    expect(result.map(game => game.igdbId)).toEqual([2]);
    expect(result[0].description).toBe('Horror');
  });
  it('matches only one exact Steam identity', () => {
    const link = (game: number, uid: string, source = 1) => ({ game, uid, external_game_source: source });
    expect(steamIdentity({ results: [link(1, '100'), link(2, '200'), link(1, '300', 5)] }, 1)).toBe(100);
    expect(steamIdentity({ results: [link(1, '100'), link(1, '200')] }, 1)).toBeNull();
    expect(steamIdentity({ results: [link(1, 'not-an-id')] }, 1)).toBeNull();
  });
});
