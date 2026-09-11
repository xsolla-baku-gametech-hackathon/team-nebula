import { describe, expect, it } from 'vitest';
import { scoreRevenue } from '@/lib/domain/scoring/revenue';
import type { GameConcept, NormalizedGame, ScoredCompetitor } from '@/lib/domain/types';

function concept(priceUsd: number | null): GameConcept {
  return {
    version: 1,
    concept: { title: null, shortDescription: 'test', rawText: 'test', platforms: ['PC'], targetSteam: true },
    taxonomy: { primaryGenre: 'Horror', secondaryGenres: [], themes: [], mechanics: [], gameModes: [], perspective: null },
    commercial: { priceUsd, plannedRelease: null, teamSize: null, isFirstTitle: false },
    confidence: {},
    missingImportantFields: [],
  };
}

function game(steamAppId: number, revenue: number | null, price: number | null): NormalizedGame {
  return {
    identity: { steamAppId, igdbId: null, name: `Game ${steamAppId}`, steamUrl: 'https://store.steampowered.com' },
    metadata: { summary: '', genres: [], themes: [], tags: [], keywords: [], gameModes: [], perspectives: [], platforms: ['PC'], developers: [], publishers: [] },
    release: { date: null, isReleased: true, isEarlyAccess: false },
    commercial: {
      priceUsd: { value: price, source: 'steam', estimated: false },
      estimatedCopiesSold: { value: null, source: 'gamalytic', estimated: true },
      estimatedRevenueUsd: { value: revenue, source: 'gamalytic', estimated: true },
    },
    reviews: {
      total: { value: null, source: 'steam', estimated: false },
      positive: { value: null, source: 'steam', estimated: false },
      negative: { value: null, source: 'steam', estimated: false },
      positiveRatio: { value: null, source: 'steam', estimated: false },
      sentimentSummary: { value: null, source: 'steam', estimated: false },
    },
  };
}

function competitor(steamAppId: number, revenue: number | null, price: number | null, similarity: number): ScoredCompetitor {
  return {
    game: game(steamAppId, revenue, price),
    similarity: {
      score: similarity,
      components: { semantic: similarity, mechanics: 0, genre: 0, theme: 0, gameMode: 0, price: 0 },
      rationale: 'test',
    },
    competitiveThreat: Math.round(similarity * 100),
    userAdded: false,
  };
}

describe('similarity-weighted revenue', () => {
  it('abstains instead of returning zeroes without usable revenue evidence', () => {
    const result = scoreRevenue(concept(null), [competitor(1, null, null, 0.9)], 50);

    expect(result).toMatchObject({
      conservative: null,
      base: null,
      upside: null,
      basedOnCount: 0,
      method: 'insufficient revenue evidence',
    });
  });

  it('does not assume a target price when none was provided', () => {
    const result = scoreRevenue(concept(null), [competitor(1, 100_000, 5, 0.9)], 50);

    expect(result.base).toBe(100_000);
    expect(result.drivers.find(item => item.label === 'Price normalization')?.detail).toContain('Target price unavailable');
  });

  it('uses squared similarity as the percentile weight', () => {
    const result = scoreRevenue(concept(null), [
      competitor(1, 100_000, 10, 0.1),
      competitor(2, 1_000_000, 10, 1),
    ], 50);

    expect(result.conservative).toBe(1_000_000);
    expect(result.base).toBe(1_000_000);
    expect(result.upside).toBe(1_000_000);
    expect(result.method).toContain('similarity-weighted');
  });

  it('never divides by a free comparable price', () => {
    const result = scoreRevenue(concept(20), [competitor(1, 250_000, 0, 0.9)], 50);

    expect(result.base).toBe(250_000);
    expect(Number.isFinite(result.base!)).toBe(true);
    expect(result.drivers.find(item => item.label === 'Price normalization')?.detail).toContain('0 of 1');
  });

  it('omits zero-similarity records from the evidence count', () => {
    const result = scoreRevenue(concept(null), [
      competitor(1, 100_000, 10, 0),
      competitor(2, 500_000, 10, 0.8),
    ], 50);

    expect(result.base).toBe(500_000);
    expect(result.basedOnCount).toBe(1);
  });
});
