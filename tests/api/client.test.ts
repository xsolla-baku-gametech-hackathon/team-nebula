import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  analyzeMarket,
  ApiClientError,
  collectApprovedGames,
  discoverGamePreview,
} from '@/lib/api/client';
import type { GameConcept, ScoredCompetitor } from '@/lib/types';

const preview = {
  status: 'ready_for_approval',
  previewId: '123e4567-e89b-42d3-a456-426614174000',
  expiresAt: '2026-09-10T20:00:00.000Z',
  query: 'multiplayer horror',
  validation: {
    status: 'ready',
    normalizedDescription: 'A multiplayer horror game.',
    confidence: 0.9,
    tags: [],
    mustHave: [],
    avoid: [],
    multiplayer: true,
    questions: [],
  },
  candidates: [],
  discovery: {
    provider: 'xai',
    model: 'grok',
    candidateCount: 0,
    rankedCount: 0,
    requestedCount: 10,
    returnedCount: 0,
    complete: false,
    issues: [],
  },
};

describe('live discovery API client', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends clarification answers to the Grok preview endpoint', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true, data: preview })));

    await discoverGamePreview(
      'multiplayer horror',
      [{ question: 'Co-op or PvP?', answer: 'Four-player co-op' }],
      10,
    );

    expect(fetchMock).toHaveBeenCalledWith('/api/games/discover', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        query: 'multiplayer horror',
        limit: 10,
        clarifications: [{ question: 'Co-op or PvP?', answer: 'Four-player co-op' }],
      }),
    }));
  });

  it('collects only the Steam games selected from the preview', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      data: { games: [], failures: [] },
    })));

    await collectApprovedGames(preview.previewId, [739630, 1966720]);

    expect(fetchMock).toHaveBeenCalledWith('/api/games/discover/collect', expect.objectContaining({
      body: JSON.stringify({
        previewId: preview.previewId,
        selectedSteamAppIds: [739630, 1966720],
      }),
    }));
  });

  it('preserves the backend error code and user-safe message', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      error: { code: 'AI_UNAVAILABLE', message: 'Grok is temporarily unavailable' },
    }), { status: 503 }));

    await expect(discoverGamePreview('multiplayer horror')).rejects.toEqual(
      expect.objectContaining<ApiClientError>({
        name: 'ApiClientError',
        code: 'AI_UNAVAILABLE',
        status: 503,
        message: 'Grok is temporarily unavailable',
      }),
    );
  });

  it('submits canonical scored competitors to market analysis', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      data: { report: {} },
      meta: { durationMs: 1, corpusVersion: 'live' },
    })));
    const concept = { version: 1 } as GameConcept;
    const competitors = [{
      game: { identity: { steamAppId: 1 } },
      similarity: { score: 0.91 },
    }] as ScoredCompetitor[];

    await analyzeMarket(concept, competitors, 26);

    expect(fetchMock).toHaveBeenCalledWith('/api/analyze', expect.objectContaining({
      body: JSON.stringify({ concept, competitors, horizonWeeks: 26 }),
    }));
  });
});
