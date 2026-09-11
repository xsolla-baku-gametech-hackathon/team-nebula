import { describe, expect, it } from 'vitest';
import { DiscoverInput, type Candidate } from '@/lib/domain/schemas';
import { rankingDropIssues, validatePreviewRanking, validateRanking } from '@/lib/application/discovery/selection';
import { parseCandidates } from '@/lib/infrastructure/igdb/find-candidates';
import { steamIdentity } from '@/lib/infrastructure/igdb/steam-identities';
const intent = { multiplayer: true };
const candidates: Candidate[] = [{ igdbId: 1, name: 'Game', description: 'Horror', context: '', gameModes: [2], semanticScore: 0.8 }];
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
  it('drops hallucinated and duplicate model IDs instead of failing', () => {
    // One invented id out of many should cost that row, not the whole request.
    expect(validateRanking({ selections: [{ igdbId: 2, reason: 'Invented' }] }, candidates)).toEqual({
      selections: [], drops: [{ kind: 'selection', reason: 'unknown_id', igdbId: 2 }],
    });

    const repeated = validateRanking({ selections: [{ igdbId: 1, reason: 'a' }, { igdbId: 1, reason: 'b' }] }, candidates);
    expect(repeated.selections.map(selection => selection.reason)).toEqual(['a']);
    expect(repeated.drops).toEqual([{ kind: 'selection', reason: 'duplicate_id', igdbId: 1 }]);

    const mixed = validateRanking({ selections: [{ igdbId: 2, reason: 'x' }, { igdbId: 1, reason: 'y' }, { igdbId: 1, reason: 'z' }] }, candidates);
    expect(mixed.selections.map(selection => selection.igdbId)).toEqual([1]);
    expect(mixed.drops).toHaveLength(2);
    expect(mixed.selections.length + mixed.drops.length).toBe(3);

    expect(validateRanking({ selections: [] }, candidates)).toEqual({ selections: [], drops: [] });
  });
  it('still rejects a structurally invalid ranking', () => {
    // Nothing to salvage from an unparseable response, so this stays a hard failure.
    for (const input of [{ selections: 'nope' }, {}, { selections: [{ igdbId: 0, reason: 'x' }] }]) {
      expect(() => validateRanking(input, candidates)).toThrow('invalid candidate ranking');
    }
    expect(() => validateRanking({}, candidates)).toThrow(expect.objectContaining({ code: 'INVALID_AI_OUTPUT' }));
  });
  it('drops invented match tags but keeps the selection', () => {
    const invented = validatePreviewRanking({ selections: [{ igdbId: 1, reason: 'Match', matchedTags: ['Survival'] }] }, candidates, validation);
    expect(invented.selections[0].matchedTags).toEqual([]);
    expect(invented.drops).toEqual([{ kind: 'tag', reason: 'unknown_tag', igdbId: 1 }]);

    const partial = validatePreviewRanking({ selections: [{ igdbId: 1, reason: 'Match', matchedTags: ['Horror', 'Survival'] }] }, candidates, validation);
    expect(partial.selections[0].matchedTags).toEqual(['Horror']);
    expect(partial.drops).toHaveLength(1);

    const clean = validatePreviewRanking({ selections: [{ igdbId: 1, reason: 'Match', matchedTags: ['Horror'] }] }, candidates, validation);
    expect(clean.selections[0].matchedTags).toEqual(['Horror']);
    expect(clean.drops).toEqual([]);
  });
  it('tolerates case and punctuation drift and dedupes repeats silently', () => {
    // Canonicalization changes the spellings Grok is asked to copy back, so drift must not 503.
    const drifted = (matchedTags: string[]) => validatePreviewRanking({ selections: [{ igdbId: 1, reason: 'Match', matchedTags }] }, candidates, validation);
    expect(drifted(['horror']).selections[0].matchedTags).toEqual(['Horror']);
    expect(drifted(['MULTIPLAYER', ' Horror ']).selections[0].matchedTags).toEqual(['Multiplayer', 'Horror']);
    // Two spellings collapsing to one canonical tag is the canonicalizer working.
    expect(drifted(['Horror', 'horror'])).toEqual({
      selections: [{ igdbId: 1, reason: 'Match', matchedTags: ['Horror'] }], drops: [],
    });

    const punctuated = { ...validation, tags: [{ name: 'Online Co-Op', category: 'mode' as const, priority: 'required' as const, basis: 'explicit' as const }, ...validation.tags] };
    expect(validatePreviewRanking({ selections: [{ igdbId: 1, reason: 'Match', matchedTags: ['online co op'] }] }, candidates, punctuated).selections[0].matchedTags).toEqual(['Online Co-Op']);
  });
  it('never returns an id outside the supplied pool', () => {
    const { selections } = validatePreviewRanking(
      { selections: [{ igdbId: 99999, reason: 'Deus Ex' }, { igdbId: 1, reason: 'Real' }] }, candidates, validation);
    const allowed = new Set(candidates.map(candidate => candidate.igdbId));
    expect(selections.every(selection => allowed.has(selection.igdbId))).toBe(true);
  });
  it('summarizes drops as counts without leaking ids', () => {
    expect(rankingDropIssues([])).toEqual([]);
    expect(rankingDropIssues([{ kind: 'selection', reason: 'unknown_id', igdbId: 99999 }])[0])
      .toBe('1 ranked result was skipped because Grok returned games outside the candidate pool.');
    expect(rankingDropIssues([
      { kind: 'selection', reason: 'unknown_id', igdbId: 9 },
      { kind: 'selection', reason: 'duplicate_id', igdbId: 1 },
    ])[0]).toContain('2 ranked results were skipped');
    expect(rankingDropIssues([{ kind: 'tag', reason: 'unknown_tag', igdbId: 1 }])[0])
      .toBe('1 matched tag was removed because it was not in the validated tag list.');
    expect(JSON.stringify(rankingDropIssues([{ kind: 'selection', reason: 'unknown_id', igdbId: 99999 }]))).not.toContain('99999');
  });
  it('filters missing multiplayer evidence and empty descriptions', () => {
    const result = parseCandidates({ results: [
      { game: { id: 1, name: 'Solo', summary: 'Horror', game_modes: [1] }, similarity: 0.7 },
      { game: { id: 2, name: 'Co-op', summary: '<b>Horror</b>', game_modes: [1, 3] }, similarity: 0.9 },
      { game: { id: 3, name: 'Empty', game_modes: [2] }, similarity: 0.8 },
    ] }, intent);
    expect(result.map(game => game.igdbId)).toEqual([2]);
    expect(result[0].description).toBe('Horror');
    expect(result[0].semanticScore).toBe(0.9);
  });
  it('matches only one exact Steam identity', () => {
    const link = (game: number, uid: string, source = 1) => ({ game, uid, external_game_source: source });
    expect(steamIdentity({ results: [link(1, '100'), link(2, '200'), link(1, '300', 5)] }, 1)).toBe(100);
    expect(steamIdentity({ results: [link(1, '100'), link(1, '200')] }, 1)).toBeNull();
    expect(steamIdentity({ results: [link(1, 'not-an-id')] }, 1)).toBeNull();
  });
});
