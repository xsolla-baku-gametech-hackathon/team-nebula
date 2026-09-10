import { describe, expect, it, vi } from 'vitest';
import { discoverGames, type DiscoveryProviders } from '@/lib/discovery/discover';
import { normalizeGame } from '@/lib/collector/normalize';
import { SteamDetailsSchema } from '@/lib/collector/steam-details';
const game = (id: number) => normalizeGame(SteamDetailsSchema.parse({ steam_appid: id, type: 'game', name: `Game ${id}`, release_date: { coming_soon: false, date: '' } }), { issues: [], fetches: {} });
function providers(): DiscoveryProviders {
  return {
    interpret: vi.fn(async () => ({ summary: 'Horror', searchQueries: ['horror'], mustHave: ['horror'], avoid: [], multiplayer: true })),
    candidates: vi.fn(async () => [1, 2, 3].map(id => ({ igdbId: id, name: `Game ${id}`, description: 'Horror', context: '', gameModes: [2] }))),
    rank: vi.fn(async () => ({ selections: [2, 1, 3].map(id => ({ igdbId: id, reason: `Match ${id}` })) })),
    resolve: vi.fn(async () => ({ 1: 100, 2: 200, 3: 300 })),
    collect: vi.fn(async input => ({ games: (input as { steamAppIds: number[] }).steamAppIds.map(game), failures: [] })),
  };
}
describe('automatic discovery', () => {
  it('uses model ordering and returns names, descriptions, and reasons', async () => {
    const deps = providers();
    const result = await discoverGames({ query: 'multiplayer horror', limit: 2 }, deps);
    expect(deps.interpret).toHaveBeenCalledWith('multiplayer horror');
    expect(result.games.map(game => game.identity.steamAppId)).toEqual([200, 100]);
    expect(result.games[0].match.reason).toBe('Match 2');
    expect(result.discovery.complete).toBe(true);
  });
  it('fills missing games only from model-ranked reserves', async () => {
    const deps = providers();
    vi.mocked(deps.collect).mockResolvedValueOnce({ games: [game(100)], failures: [{ steamAppId: 200, code: 'not_found', message: 'Unavailable' }] });
    const result = await discoverGames({ query: 'horror', limit: 2 }, deps);
    expect(result.games.map(game => game.identity.steamAppId)).toEqual([100, 300]);
    expect(deps.collect).toHaveBeenLastCalledWith({ steamAppIds: [300] });
    expect(result.failures).toHaveLength(1);
  });
  it('reports shortfalls without unrelated padding', async () => {
    const deps = providers();
    vi.mocked(deps.resolve).mockResolvedValue({ 2: 200 });
    const result = await discoverGames({ query: 'horror', limit: 10 }, deps);
    expect(result.games).toHaveLength(1);
    expect(result.discovery.complete).toBe(false);
  });
  it('does not silently fall back after AI failure', async () => {
    const deps = providers();
    vi.mocked(deps.interpret).mockRejectedValue(new Error('AI offline'));
    await expect(discoverGames({ query: 'horror' }, deps)).rejects.toThrow('AI offline');
    expect(deps.candidates).not.toHaveBeenCalled();
    expect(deps.collect).not.toHaveBeenCalled();
  });
});
