import { describe, expect, it, vi } from 'vitest';
import { PreviewStore } from '@/lib/discovery/preview-store';
import { previewGames, type PreviewProviders } from '@/lib/discovery/preview';
import type { DescriptionValidation } from '@/lib/domain/schemas';

const ready: DescriptionValidation = { status: 'ready', normalizedDescription: 'Multiplayer horror', confidence: 0.9,
  tags: [
    { name: 'Horror', category: 'theme', priority: 'required', basis: 'explicit' },
    { name: 'Multiplayer', category: 'mode', priority: 'required', basis: 'explicit' },
  ], mustHave: ['horror'], avoid: [], multiplayer: true, questions: [] };
function providers(): PreviewProviders {
  return {
    validate: vi.fn(async () => ready),
    candidates: vi.fn(async () => [{ igdbId: 1, name: 'Haunted Team', description: 'Long private candidate description', context: 'Horror', gameModes: [2], semanticScore: 0.87 }]),
    rank: vi.fn(async () => ({ selections: [{ igdbId: 1, reason: 'Co-op horror match', matchedTags: ['Horror', 'Multiplayer'] }] })),
    resolve: vi.fn(async () => ({ 1: 100 })), store: new PreviewStore(),
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

  it('returns an explicit no-match result without storing it', async () => {
    const deps = providers();
    vi.mocked(deps.resolve).mockResolvedValue({});
    const create = vi.spyOn(deps.store, 'create');
    const result = await previewGames({ query: 'multiplayer horror' }, deps);
    expect(result.status).toBe('no_matches');
    expect(create).not.toHaveBeenCalled();
  });
});
