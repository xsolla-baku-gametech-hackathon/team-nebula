import 'server-only';
import { collectGames } from '@/lib/infrastructure/collector/collect-games';
import type { CollectedGame, CollectionFailure } from '@/lib/infrastructure/collector/types';
import { previewStore, type PreviewStore } from './preview-store';
import { ApprovalInput, DiscoveryError, type PreviewCandidate } from '@/lib/domain/schemas';

const defaults = { store: previewStore, collect: collectGames };
export type ApprovalProviders = Omit<typeof defaults, 'store'> & { store: PreviewStore };

export async function approvePreview(input: unknown, deps: ApprovalProviders = defaults) {
  const approval = ApprovalInput.parse(input);
  const record = deps.store.claim(approval.previewId);
  try {
    const selectedIds = 'approveAll' in approval ? record.candidates.map(candidate => candidate.steamAppId) : approval.selectedSteamAppIds;
    if (new Set(selectedIds).size !== selectedIds.length) throw new DiscoveryError('INVALID_SELECTION', 'Selected Steam AppIDs must be unique');
    const requested = new Set(selectedIds);
    const selected = record.candidates.filter(candidate => requested.has(candidate.steamAppId));
    if (!selectedIds.length || selected.length !== selectedIds.length) throw new DiscoveryError('INVALID_SELECTION', 'Every selected game must belong to this preview');
    const collected = await deps.collect({ steamAppIds: selected.map(candidate => candidate.steamAppId) });
    const bySteamId = new Map<number, PreviewCandidate>(selected.map(candidate => [candidate.steamAppId, candidate]));
    const failures: CollectionFailure[] = [...collected.failures];
    const games: (CollectedGame & { match: { source: 'xai'; reason: string; matchedTags: string[]; candidateIgdbId: number; semanticScore: number } })[] = [];
    for (const game of collected.games) {
      const candidate = bySteamId.get(game.identity.steamAppId);
      if (!candidate) continue;
      if (game.identity.igdbId !== null && game.identity.igdbId !== candidate.igdbId) {
        failures.push({ steamAppId: game.identity.steamAppId, code: 'invalid_data', message: 'Steam and IGDB identities disagree' });
        continue;
      }
      games.push({ ...game, match: { source: 'xai', reason: candidate.reason,
        matchedTags: candidate.matchedTags, candidateIgdbId: candidate.igdbId,
        semanticScore: candidate.semanticScore } });
    }
    deps.store.complete(record.id);
    return { query: record.query, validation: record.validation, games, failures,
      approval: { previewId: record.id, approvedCount: selected.length, returnedCount: games.length,
        complete: games.length === selected.length } };
  } catch (error) {
    deps.store.release(record.id);
    throw error;
  }
}
