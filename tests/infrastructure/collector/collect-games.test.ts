import { describe, expect, it, vi } from 'vitest';
import { collectGames, type CollectorProviders } from '@/lib/infrastructure/collector/collect-games';
import { SteamDetailsSchema } from '@/lib/infrastructure/steam/details';
import { ProviderError } from '@/lib/infrastructure/collector/types';

const fetched = <T>(data: T) => ({ data, fetchedAt: '2026-09-10T00:00:00.000Z' });
function providers(): CollectorProviders {
  return {
    details: vi.fn(async id => fetched(SteamDetailsSchema.parse({ steam_appid: id, type: 'game', name: `Game ${id}`, is_free: true, release_date: { coming_soon: false, date: 'Sep 18, 2020' } }))),
    reviews: vi.fn(async () => fetched({ total_reviews: 10, total_positive: 8, total_negative: 2, review_score_desc: 'Positive' })),
    comments: vi.fn(async () => fetched([])), tags: vi.fn(async () => fetched(['Horror'])),
    gamalytic: vi.fn(async () => fetched({ games: {}, invalidIds: [] })),
    igdb: vi.fn(async () => fetched({ games: {}, issues: {} })),
  };
}
describe('live collection', () => {
  it('deduplicates in order, uses full aggregates, and never invents estimates', async () => {
    const deps = providers();
    const result = await collectGames({ steamAppIds: [2, 1, 2] }, deps);
    expect(result.games.map(game => game.identity.steamAppId)).toEqual([2, 1]);
    expect(result.games[0].reviews.positiveRatio.value).toBe(0.8);
    expect(result.games[0].commercial.priceUsd.value).toBe(0);
    expect(result.games[0].commercial.estimatedRevenueUsd.value).toBeNull();
    await collectGames({ steamAppIds: [2] }, deps);
    expect(deps.details).toHaveBeenCalledTimes(3);
  });
  it('isolates optional failures and invalid Steam apps', async () => {
    const deps = providers();
    vi.mocked(deps.details).mockRejectedValueOnce(new ProviderError('steam', 'not_found', 'Not a game'));
    vi.mocked(deps.igdb).mockRejectedValue(new Error('sensitive internal error'));
    vi.mocked(deps.tags).mockRejectedValue(new Error('upstream HTML'));
    const result = await collectGames({ steamAppIds: [1, 2] }, deps);
    expect(result.games).toHaveLength(1);
    expect(result.failures[0].steamAppId).toBe(1);
    expect(result.games[0].metadata.tags).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('sensitive');
    expect(deps.comments).toHaveBeenCalledTimes(1);
  });
  it('skips enrichment when every Steam lookup fails', async () => {
    const deps = providers();
    vi.mocked(deps.details).mockRejectedValue(new Error('offline'));
    const result = await collectGames({ steamAppIds: [1] }, deps);
    expect(result.games).toEqual([]);
    expect(deps.gamalytic).not.toHaveBeenCalled();
    expect(deps.igdb).not.toHaveBeenCalled();
  });
});
