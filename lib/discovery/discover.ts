import 'server-only';
import { collectGames } from '@/lib/collector/collect';
import type { CollectedGame, CollectionFailure } from '@/lib/collector/types';
import { findCandidates } from './candidates';
import { grokModelId, interpretQuery, rankCandidates } from './grok';
import { validateRanking } from './selection';
import { resolveSteamIds } from './steam-identities';
import { DiscoverInput } from './types';

const defaults = { interpret: interpretQuery, candidates: findCandidates, rank: rankCandidates, resolve: resolveSteamIds, collect: collectGames };
export type DiscoveryProviders = typeof defaults;
export async function discoverGames(input: unknown, deps: DiscoveryProviders = defaults) {
  const request = DiscoverInput.parse(input);
  const intent = await deps.interpret(request.query);
  const candidates = await deps.candidates(intent);
  const ranked = candidates.length ? validateRanking(await deps.rank(intent, candidates), candidates) : [];
  const identities = ranked.length ? await deps.resolve(ranked.map(game => game.igdbId)) : {};
  const seen = new Set<number>();
  const selected = ranked.flatMap(game => {
    const steamAppId = identities[game.igdbId];
    if (!steamAppId || seen.has(steamAppId)) return [];
    seen.add(steamAppId);
    return [{ ...game, steamAppId }];
  });
  const games: (CollectedGame & { match: { source: 'xai'; reason: string; candidateIgdbId: number } })[] = [];
  const failures: CollectionFailure[] = [];
  // Reserve candidates replace unavailable Steam apps; the model alone determines order.
  for (let offset = 0; offset < selected.length && games.length < request.limit;) {
    const batch = selected.slice(offset, offset + request.limit - games.length);
    offset += batch.length;
    const collected = await deps.collect({ steamAppIds: batch.map(game => game.steamAppId) });
    failures.push(...collected.failures);
    for (const game of collected.games) {
      const match = batch.find(candidate => candidate.steamAppId === game.identity.steamAppId)!;
      if (game.identity.igdbId !== null && game.identity.igdbId !== match.igdbId) {
        failures.push({ steamAppId: game.identity.steamAppId, code: 'invalid_data', message: 'Steam and IGDB identities disagree' });
        continue;
      }
      games.push({ ...game, match: { source: 'xai', reason: match.reason, candidateIgdbId: match.igdbId } });
    }
  }
  return {
    query: request.query, intent, games, failures,
    discovery: { provider: 'xai' as const, model: grokModelId(), candidateCount: candidates.length,
      rankedCount: ranked.length, steamCandidateCount: selected.length, requestedCount: request.limit,
      returnedCount: games.length, complete: games.length === request.limit,
      issues: games.length < request.limit ? ['Not enough verified matching Steam games were available; results were not padded.'] : [] },
  };
}
