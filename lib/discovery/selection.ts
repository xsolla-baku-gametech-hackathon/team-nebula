import { DiscoveryError, RankingSchema, type Candidate } from './types';

export function validateRanking(input: unknown, candidates: Candidate[]) {
  const parsed = RankingSchema.safeParse(input);
  if (!parsed.success) throw new DiscoveryError('INVALID_AI_OUTPUT', 'Grok returned an invalid candidate ranking');
  const allowed = new Set(candidates.map(candidate => candidate.igdbId));
  const seen = new Set<number>();
  for (const selected of parsed.data.selections) {
    if (!allowed.has(selected.igdbId) || seen.has(selected.igdbId)) {
      throw new DiscoveryError('INVALID_AI_OUTPUT', 'Grok selected an unknown or duplicate candidate');
    }
    seen.add(selected.igdbId);
  }
  return parsed.data.selections;
}
