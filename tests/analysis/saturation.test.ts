import { describe, expect, it } from 'vitest';
import { scoreSaturation } from '@/lib/scoring/saturation';
import type { NormalizedGame } from '@/lib/types';

function game(revenue: number | null, steamAppId: number): NormalizedGame {
  return {
    identity: { steamAppId, igdbId: null, name: `Game ${steamAppId}`, steamUrl: 'https://store.steampowered.com' },
    metadata: { summary: '', genres: [], themes: [], tags: [], keywords: [], gameModes: [], perspectives: [], platforms: ['PC'], developers: [], publishers: [] },
    release: { date: null, isReleased: true, isEarlyAccess: false },
    commercial: {
      priceUsd: { value: null, source: 'steam', estimated: false },
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

describe('market saturation evidence', () => {
  it('does not count missing revenue as failed games', () => {
    const result = scoreSaturation([
      game(100_000, 1),
      game(100_000, 2),
      game(null, 3),
      game(null, 4),
    ], 0, 50_000);
    const success = result.drivers.find(driver => driver.label === 'Success rate');

    expect(success?.contribution).toBe(0);
    expect(success?.detail).toContain('2 games with revenue data');
  });

  it('omits revenue factors when the cohort has no revenue evidence', () => {
    const result = scoreSaturation([game(null, 1), game(null, 2)], 0);

    expect(result.drivers.find(driver => driver.label === 'Success rate')).toMatchObject({ contribution: 0 });
    expect(result.drivers.find(driver => driver.label === 'Revenue concentration')).toMatchObject({ contribution: 0 });
    expect(result.score).toBe(1);
  });

  it('calculates concentration using only positive known revenue', () => {
    const result = scoreSaturation([game(100_000, 1), game(100_000, 2), game(null, 3)], 0);
    const concentration = result.drivers.find(driver => driver.label === 'Revenue concentration');

    expect(concentration?.detail).toContain('across 2 games');
    expect(concentration?.contribution).toBe(15);
  });
});
