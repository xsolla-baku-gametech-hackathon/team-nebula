import { describe, expect, it } from 'vitest';
import { scoreSimilarity } from '@/lib/domain/scoring/similarity';
import { conceptHorrorCoop } from '@/lib/fixtures/concept.horror-coop';
import type { NormalizedGame } from '@/lib/types';

function game(overrides: Partial<NormalizedGame['metadata']> = {}): NormalizedGame {
  return {
    identity: { steamAppId: 1, igdbId: 2, name: 'Comparable', steamUrl: 'https://store.steampowered.com/app/1' },
    metadata: {
      summary: '', genres: ['Horror'], themes: ['Supernatural'], tags: [],
      keywords: ['evidence gathering', 'proximity voice chat'], gameModes: ['Online Co-op'],
      perspectives: ['First person'], platforms: ['PC'], developers: [], publishers: [], ...overrides,
    },
    release: { date: '2025-01-01', isReleased: true, isEarlyAccess: false },
    commercial: {
      priceUsd: { value: 14.99, source: 'steam', estimated: false },
      estimatedCopiesSold: { value: null, source: 'gamalytic', estimated: true },
      estimatedRevenueUsd: { value: null, source: 'gamalytic', estimated: true },
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

describe('canonical competitor similarity', () => {
  it('returns a normalized score with populated structured components', () => {
    const result = scoreSimilarity(conceptHorrorCoop, game(), 0.9);

    expect(result.score).toBeGreaterThan(0.6);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.components).toMatchObject({ semantic: 0.9, genre: 0.6, gameMode: 1, price: 1 });
    expect(result.components.mechanics).toBeGreaterThan(0);
    expect(result.components.theme).toBeGreaterThan(0);
  });

  it('reweights around missing optional game metadata', () => {
    const complete = scoreSimilarity(conceptHorrorCoop, game(), 0.9);
    const sparse = scoreSimilarity(conceptHorrorCoop, game({ keywords: [], themes: [], gameModes: [] }), 0.9);

    expect(sparse.score).toBeGreaterThan(0);
    expect(sparse.score).not.toBe(complete.score);
    expect(sparse.drivers.map(driver => driver.label)).not.toContain('mechanics');
  });

  it('clamps invalid semantic evidence into the public score range', () => {
    expect(scoreSimilarity(conceptHorrorCoop, game(), Number.NaN).score).toBeGreaterThanOrEqual(0);
    expect(scoreSimilarity(conceptHorrorCoop, game(), 9).components.semantic).toBe(1);
  });

  it('omits invalid prices from similarity evidence', () => {
    const invalidPriceConcept = {
      ...conceptHorrorCoop,
      commercial: { ...conceptHorrorCoop.commercial, priceUsd: Number.NaN },
    };
    const result = scoreSimilarity(invalidPriceConcept, game(), 0.9);

    expect(result.components.price).toBe(0);
    expect(result.drivers.map(driver => driver.label)).not.toContain('price');
  });
});
