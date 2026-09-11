import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NormalizedGame } from '@/lib/domain/types';

vi.mock('@/lib/infrastructure/corpus/load', () => ({
  getCorpus: vi.fn(() => {
    throw new Error('the live path must not load the demo corpus');
  }),
}));

vi.mock('@/lib/application/analysis/upcoming-releases', () => ({
  fetchUpcomingReleases: vi.fn(async () => ({
    dated: [{
      igdbId: 999,
      steamAppId: null,
      name: 'Future Fright',
      expectedDate: '2026-10-16',
      dateLabel: 'Oct 16, 2026',
      dateConfidence: 'exact',
      rangeStart: '2026-10-16',
      rangeEnd: '2026-10-17',
      similarity: 85,
      threat: 90,
      hypes: 120,
      followers: null,
      isMajorPublisher: false,
    }],
    undated: [],
    fetchedAt: '2026-09-10T00:00:00.000Z',
    issues: [],
  })),
}));

import { getCorpus } from '@/lib/infrastructure/corpus/load';
import { conceptHorrorCoop } from '@/lib/fixtures/concept.horror-coop';
import { POST } from '@/app/api/analyze/route';

const liveGame: NormalizedGame = {
  identity: {
    steamAppId: 739630,
    igdbId: 123,
    name: 'Live Comparable',
    steamUrl: 'https://store.steampowered.com/app/739630',
  },
  metadata: {
    summary: 'A live comparable returned by approved collection.',
    genres: ['Horror'],
    themes: ['Supernatural'],
    tags: ['Horror', 'Online Co-Op'],
    keywords: ['investigation'],
    gameModes: ['Online Co-op'],
    perspectives: ['First person'],
    platforms: ['PC'],
    developers: ['Studio'],
    publishers: ['Publisher'],
  },
  release: {
    date: '2020-09-04',
    isReleased: true,
    isEarlyAccess: false,
  },
  commercial: {
    priceUsd: { value: 19.99, source: 'steam', estimated: false },
    estimatedCopiesSold: { value: 1_000_000, source: 'gamalytic', estimated: true },
    estimatedRevenueUsd: { value: 20_000_000, source: 'gamalytic', estimated: true },
  },
  reviews: {
    total: { value: 100_000, source: 'steam', estimated: false },
    positive: { value: 90_000, source: 'steam', estimated: false },
    negative: { value: 10_000, source: 'steam', estimated: false },
    positiveRatio: { value: 0.9, source: 'steam', estimated: false },
    sentimentSummary: { value: 'Very Positive', source: 'steam', estimated: false },
  },
};

const liveCompetitor = {
  game: liveGame,
  similarity: {
    score: 0.91,
    rationale: 'Canonical live score',
    components: { semantic: 0.9, mechanics: 0.8, genre: 1, theme: 0.7, gameMode: 1, price: 1 },
  },
  competitiveThreat: 91,
  userAdded: false,
};

const request = () => new Request('http://localhost/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    concept: conceptHorrorCoop,
    competitors: [liveCompetitor],
    horizonWeeks: 26,
  }),
});

describe('live market analysis route', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scores approved live game records without reading data/games.json', async () => {
    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.meta.corpusVersion).toBe('live');
    expect(body.data.report.revenue.basedOnCount).toBe(1);
    expect(body.data.report.revenue.method).toContain('similarity-weighted');
    expect(body.data.report.revenue.drivers).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Similarity-weighted cohort' }),
      expect.objectContaining({ label: 'Price normalization' }),
    ]));
    expect(body.data.report.releaseData).toMatchObject({
      status: 'live',
      source: 'igdb-mcp',
      datedCount: 1,
    });
    expect(body.data.report.releaseWindows).toHaveLength(26);
    expect(getCorpus).not.toHaveBeenCalled();
  });
});
