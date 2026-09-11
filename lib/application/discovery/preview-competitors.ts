import 'server-only';
import { findPreviewCandidates } from '@/lib/infrastructure/igdb/find-candidates';
import { grokModelId, rankPreviewCandidates, validateDescription } from '@/lib/infrastructure/grok/discovery';
import { previewStore, type PreviewStore } from './preview-store';
import { rankingDropIssues, validatePreviewRanking, type RankingOutcome } from './selection';
import { resolveSteamIds } from '@/lib/infrastructure/igdb/steam-identities';
import { DiscoverInput, type PreviewCandidate } from '@/lib/domain/schemas';
import { normalizeDiscoveryTags } from '@/lib/domain/discovery-tags';

const defaults = {
  validate: validateDescription, candidates: findPreviewCandidates,
  rank: rankPreviewCandidates, resolve: resolveSteamIds, store: previewStore,
};
export type PreviewProviders = Omit<typeof defaults, 'store'> & { store: PreviewStore };

export async function previewGames(input: unknown, deps: PreviewProviders = defaults) {
  const request = DiscoverInput.parse(input);
  const validation = normalizeDiscoveryTags(
    await deps.validate(request.query, request.clarifications ?? []),
    request.query,
  );
  if (validation.status === 'needs_clarification') {
    return { status: 'needs_clarification' as const, previewId: null, expiresAt: null,
      query: request.query, validation, questions: validation.questions };
  }
  const candidates = await deps.candidates(validation);
  const { selections: ranked, drops }: RankingOutcome = candidates.length
    ? validatePreviewRanking(await deps.rank(validation, candidates), candidates, validation)
    : { selections: [], drops: [] };
  if (drops.length) {
    console.warn('Grok ranking drops', {
      stage: 'rank', candidateCount: candidates.length, selectionCount: ranked.length,
      drops: drops.map(drop => ({ kind: drop.kind, reason: drop.reason, igdbId: drop.igdbId })),
    });
  }
  const dropIssues = rankingDropIssues(drops);
  const identities = ranked.length ? await deps.resolve(ranked.map(candidate => candidate.igdbId)) : {};
  const candidateById = new Map(candidates.map(candidate => [candidate.igdbId, candidate]));
  const seen = new Set<number>();
  const previewCandidates: PreviewCandidate[] = ranked.flatMap(selection => {
    const steamAppId = identities[selection.igdbId];
    const candidate = candidateById.get(selection.igdbId);
    if (!candidate || !steamAppId || seen.has(steamAppId)) return [];
    seen.add(steamAppId);
    return [{ steamAppId, igdbId: selection.igdbId, name: candidate.name,
      semanticScore: candidate.semanticScore,
      reason: selection.reason, matchedTags: selection.matchedTags }];
  }).slice(0, request.limit);
  if (!previewCandidates.length) return {
    status: 'no_matches' as const, previewId: null, expiresAt: null, query: request.query,
    validation, candidates: [], discovery: { provider: 'xai' as const, model: grokModelId(),
      candidateCount: candidates.length, rankedCount: ranked.length, requestedCount: request.limit,
      returnedCount: 0, complete: false,
      // This branch's own message stays first: the UI reads only issues[0] here.
      issues: ['No matching game with one exact Steam identity was available.', ...dropIssues] },
  };
  const record = deps.store.create({ query: request.query, validation, candidates: previewCandidates });
  return {
    status: 'ready_for_approval' as const, previewId: record.id,
    expiresAt: new Date(record.expiresAt).toISOString(), query: request.query, validation,
    candidates: previewCandidates,
    discovery: { provider: 'xai' as const, model: grokModelId(), candidateCount: candidates.length,
      rankedCount: ranked.length, requestedCount: request.limit, returnedCount: previewCandidates.length,
      complete: previewCandidates.length === request.limit && !drops.length,
      issues: [...dropIssues,
        ...(previewCandidates.length < request.limit ? ['Fewer verified Steam matches were available than requested.'] : [])] },
  };
}
