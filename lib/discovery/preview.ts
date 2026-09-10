import 'server-only';
import { findPreviewCandidates } from './candidates';
import { grokModelId, rankPreviewCandidates, validateDescription } from './grok';
import { previewStore, type PreviewStore } from './preview-store';
import { validatePreviewRanking } from './selection';
import { resolveSteamIds } from './steam-identities';
import { DiscoverInput, type PreviewCandidate } from './types';

const defaults = {
  validate: validateDescription, candidates: findPreviewCandidates,
  rank: rankPreviewCandidates, resolve: resolveSteamIds, store: previewStore,
};
export type PreviewProviders = Omit<typeof defaults, 'store'> & { store: PreviewStore };

export async function previewGames(input: unknown, deps: PreviewProviders = defaults) {
  const request = DiscoverInput.parse(input);
  const validation = await deps.validate(request.query, request.clarifications ?? []);
  if (validation.status === 'needs_clarification') {
    return { status: 'needs_clarification' as const, previewId: null, expiresAt: null,
      query: request.query, validation, questions: validation.questions };
  }
  const candidates = await deps.candidates(validation);
  const ranked = candidates.length
    ? validatePreviewRanking(await deps.rank(validation, candidates), candidates, validation)
    : [];
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
      returnedCount: 0, complete: false, issues: ['No matching game with one exact Steam identity was available.'] },
  };
  const record = deps.store.create({ query: request.query, validation, candidates: previewCandidates });
  return {
    status: 'ready_for_approval' as const, previewId: record.id,
    expiresAt: new Date(record.expiresAt).toISOString(), query: request.query, validation,
    candidates: previewCandidates,
    discovery: { provider: 'xai' as const, model: grokModelId(), candidateCount: candidates.length,
      rankedCount: ranked.length, requestedCount: request.limit, returnedCount: previewCandidates.length,
      complete: previewCandidates.length === request.limit,
      issues: previewCandidates.length < request.limit ? ['Fewer verified Steam matches were available than requested.'] : [] },
  };
}
