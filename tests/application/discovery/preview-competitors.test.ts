import { describe, expect, it, vi } from 'vitest';
import { PreviewStore } from '@/lib/application/discovery/preview-store';
import { previewGames, type PreviewProviders } from '@/lib/application/discovery/preview-competitors';
import { DiscoveryError, type DescriptionValidation } from '@/lib/domain/schemas';

const ready: DescriptionValidation = { status: 'ready', normalizedDescription: 'Multiplayer horror', confidence: 0.9,
  tags: [
    { name: 'Horror', category: 'theme', priority: 'required', basis: 'explicit' },
    { name: 'Multiplayer', category: 'mode', priority: 'required', basis: 'explicit' },
  ], mustHave: ['horror'], avoid: [], multiplayer: true, questions: [] };
function providers(): PreviewProviders {
  return {
    validate: vi.fn(async () => ready),
    candidates: vi.fn(async () => [
      { igdbId: 1, name: 'Haunted Team', description: 'Long private candidate description', context: 'Horror', gameModes: [2], semanticScore: 0.87 },
      { igdbId: 2, name: 'Second Team', description: 'Another private description', context: 'Horror', gameModes: [2], semanticScore: 0.7 },
    ]),
    rank: vi.fn(async () => ({ selections: [{ igdbId: 1, reason: 'Co-op horror match', matchedTags: ['Horror', 'Multiplayer'] }] })),
    resolve: vi.fn(async () => ({ 1: 100, 2: 200 })), store: new PreviewStore(),
  };
}

describe('discovery preview', () => {
  it('stops before MCP when Grok requests clarification', async () => {
    const deps = providers();
    vi.mocked(deps.validate).mockResolvedValue({ ...ready, status: 'needs_clarification', confidence: 0.4,
      tags: [], questions: ['What genre is the game?'] });
    const result = await previewGames({ query: 'fun game' }, deps);
    expect(result.status).toBe('needs_clarification');
    expect(deps.candidates).not.toHaveBeenCalled();
    expect(deps.rank).not.toHaveBeenCalled();
    expect(deps.resolve).not.toHaveBeenCalled();
  });

  it('returns compact candidates and stores an approval preview', async () => {
    const deps = providers();
    const result = await previewGames({ query: 'multiplayer horror', limit: 1 }, deps);
    expect(result.status).toBe('ready_for_approval');
    if (result.status !== 'ready_for_approval') throw new Error('Expected ready preview');
    expect(result.candidates).toEqual([{ steamAppId: 100, igdbId: 1, name: 'Haunted Team',
      semanticScore: 0.87, reason: 'Co-op horror match', matchedTags: ['Horror', 'Multiplayer'] }]);
    expect(JSON.stringify(result.candidates)).not.toContain('private candidate description');
    expect(deps.store.get(result.previewId).candidates).toEqual(result.candidates);
  });

  it('restores a stated genre before searching for candidates', async () => {
    const deps = providers();
    vi.mocked(deps.validate).mockResolvedValue({ ...ready,
      tags: [{ name: 'apartment', category: 'setting', priority: 'required', basis: 'explicit' }] });
    vi.mocked(deps.rank).mockResolvedValue({ selections: [{ igdbId: 1, reason: 'Side-scrolling horror', matchedTags: ['Platformer'] }] });

    const result = await previewGames({ query: '2d platformer scary game set in an apartment' }, deps);

    const names = result.validation.tags.map(tag => tag.name);
    expect(names).toEqual(expect.arrayContaining(['Platformer', 'Horror']));
    // The normalized object must be what drives retrieval and ranking, not the raw model output.
    expect(vi.mocked(deps.candidates).mock.calls[0][0].tags.map(tag => tag.name)).toContain('Platformer');
    expect(vi.mocked(deps.rank).mock.calls[0][0].tags.map(tag => tag.name)).toContain('Platformer');
  });

  it('still previews when normalization cannot improve the tags', async () => {
    const deps = providers();
    vi.mocked(deps.validate).mockResolvedValue({ ...ready,
      tags: [{ name: 'Invented Genre', category: 'genre', priority: 'required', basis: 'explicit' }] });
    vi.mocked(deps.rank).mockResolvedValue({ selections: [{ igdbId: 1, reason: 'Closest available', matchedTags: ['Invented Genre'] }] });

    const result = await previewGames({ query: 'a game about nothing in particular' }, deps);

    expect(result.status).toBe('ready_for_approval');
    expect(result.validation.tags.map(tag => tag.name)).toEqual(['Invented Genre']);
  });

  it('keeps a usable preview when Grok invents a candidate id', async () => {
    // Regression: one invented id used to 503 the whole request and wipe the UI.
    const deps = providers();
    vi.mocked(deps.rank).mockResolvedValue({ selections: [
      { igdbId: 1, reason: 'Co-op horror match', matchedTags: ['Horror'] },
      { igdbId: 99999, reason: 'Deus Ex', matchedTags: ['Horror'] },
    ] });

    const result = await previewGames({ query: 'multiplayer horror' }, deps);

    expect(result.status).toBe('ready_for_approval');
    if (result.status !== 'ready_for_approval') throw new Error('Expected ready preview');
    expect(result.candidates.map(candidate => candidate.steamAppId)).toEqual([100]);
    expect(result.discovery.rankedCount).toBe(1);
    expect(result.discovery.complete).toBe(false);
    expect(result.discovery.issues[0]).toMatch(/candidate pool/);
  });

  it('reports dropped match tags without failing the preview', async () => {
    const deps = providers();
    vi.mocked(deps.rank).mockResolvedValue({ selections: [
      { igdbId: 1, reason: 'Co-op horror match', matchedTags: ['Horror', 'Invented'] },
    ] });

    const result = await previewGames({ query: 'multiplayer horror' }, deps);

    expect(result.status).toBe('ready_for_approval');
    if (result.status !== 'ready_for_approval') throw new Error('Expected ready preview');
    expect(result.candidates[0].matchedTags).toEqual(['Horror']);
    expect(result.discovery.issues.join(' ')).toMatch(/validated tag list/);
    expect(result.discovery.complete).toBe(false);
  });

  it('stays complete with no issues when nothing was dropped', async () => {
    const result = await previewGames({ query: 'multiplayer horror', limit: 1 }, providers());
    if (result.status !== 'ready_for_approval') throw new Error('Expected ready preview');
    expect(result.discovery.complete).toBe(true);
    expect(result.discovery.issues).toEqual([]);
  });

  it('logs the drop condition and id without leaking model or candidate text', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const deps = providers();
    vi.mocked(deps.rank).mockResolvedValue({ selections: [
      { igdbId: 1, reason: 'Co-op horror match', matchedTags: ['Horror', 'Invented'] },
      { igdbId: 99999, reason: 'Deus Ex', matchedTags: [] },
    ] });

    await previewGames({ query: 'multiplayer horror' }, deps);

    expect(warn).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(warn.mock.calls);
    expect(logged).toContain('unknown_id');
    expect(logged).toContain('99999');
    expect(logged).not.toContain('private candidate description');
    expect(logged).not.toContain('Invented');
    warn.mockRestore();
  });

  it('still fails hard on an unparseable ranking or a provider outage', async () => {
    const unparseable = providers();
    vi.mocked(unparseable.rank).mockResolvedValue({ selections: 'garbage' } as never);
    await expect(previewGames({ query: 'multiplayer horror' }, unparseable))
      .rejects.toMatchObject({ code: 'INVALID_AI_OUTPUT' });

    // Grok outage now falls back to tag-overlap ranking instead of throwing
    const outage = providers();
    vi.mocked(outage.rank).mockRejectedValue(new DiscoveryError('AI_UNAVAILABLE', 'Grok is down'));
    const fallbackResult = await previewGames({ query: 'multiplayer horror' }, outage);
    expect(fallbackResult.status).toBe('ready_for_approval');
  });

  it('returns an explicit no-match result without storing it', async () => {
    const deps = providers();
    vi.mocked(deps.resolve).mockResolvedValue({});
    const create = vi.spyOn(deps.store, 'create');
    const result = await previewGames({ query: 'multiplayer horror' }, deps);
    expect(result.status).toBe('no_matches');
    expect(create).not.toHaveBeenCalled();
  });
});
