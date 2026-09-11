import { describe, expect, it } from 'vitest';
import { scoreReception } from '@/lib/domain/scoring/reception';
import type { GameConcept, NormalizedGame } from '@/lib/domain/types';

function concept(priceUsd: number | null): GameConcept {
  return {
    version: 1,
    concept: { title: null, shortDescription: 'test', rawText: 'test', platforms: ['PC'], targetSteam: true },
    taxonomy: { primaryGenre: 'Horror', secondaryGenres: [], themes: [], mechanics: [], gameModes: [], perspective: null },
    commercial: { priceUsd, plannedRelease: null, teamSize: null, isFirstTitle: null },
    confidence: {},
    missingImportantFields: [],
  };
}

function game(steamAppId: number, ratio: number | null, price: number | null): NormalizedGame {
  return {
    identity: { steamAppId, igdbId: null, name: `Game ${steamAppId}`, steamUrl: 'https://store.steampowered.com' },
    metadata: { summary: '', genres: [], themes: [], tags: [], keywords: [], gameModes: [], perspectives: [], platforms: ['PC'], developers: [], publishers: [] },
    release: { date: null, isReleased: true, isEarlyAccess: false },
    commercial: {
      priceUsd: { value: price, source: 'steam', estimated: false },
      estimatedCopiesSold: { value: null, source: 'gamalytic', estimated: true },
      estimatedRevenueUsd: { value: null, source: 'gamalytic', estimated: true },
    },
    reviews: {
      total: { value: null, source: 'steam', estimated: false },
      positive: { value: null, source: 'steam', estimated: false },
      negative: { value: null, source: 'steam', estimated: false },
      positiveRatio: { value: ratio, source: 'steam', estimated: false },
      sentimentSummary: { value: null, source: 'steam', estimated: false },
    },
  };
}

describe('reception evidence', () => {
  it('abstains instead of inventing a prediction without reviews', () => {
    expect(scoreReception(concept(null), [game(1, null, null)])).toEqual({
      predictedPositiveRatio: null,
      cohortMedianPositiveRatio: null,
      band: 'LOW',
    });
  });

  it('uses true medians for even review and known-price cohorts', () => {
    const result = scoreReception(concept(30), [
      game(1, 0.6, 10),
      game(2, 0.8, 20),
      game(3, 0.8, null),
      game(4, 1, 100),
    ]);

    expect(result.cohortMedianPositiveRatio).toBe(0.8);
    expect(result.predictedPositiveRatio).toBe(0.77);
  });

  it('does not adjust when either price side is unavailable', () => {
    expect(scoreReception(concept(null), [game(1, 0.82, 20)]).predictedPositiveRatio).toBe(0.82);
    expect(scoreReception(concept(30), [game(1, 0.82, null)]).predictedPositiveRatio).toBe(0.82);
  });

  it('clamps the prediction to a valid percentage range', () => {
    const result = scoreReception(concept(0), [game(1, 1, 100)]);
    expect(result.predictedPositiveRatio).toBe(1);
  });

  it('ignores an invalid concept price instead of producing NaN', () => {
    const result = scoreReception(concept(Number.NaN), [game(1, 0.82, 20)]);
    expect(result.predictedPositiveRatio).toBe(0.82);
  });
});
