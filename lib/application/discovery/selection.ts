import { DiscoveryError, RankingSchema, type Candidate, type DescriptionValidation } from '@/lib/domain/schemas';
import { normalizeTagKey } from '@/lib/domain/tag-vocabulary';

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

export function validatePreviewRanking(input: unknown, candidates: Candidate[], validation: DescriptionValidation) {
  const selections = validateRanking(input, candidates);
  // Matched on a normalized key, then returned in the validated spelling: the ranking
  // stage must not fail the whole request over case or punctuation drift.
  const tags = new Map(validation.tags.map(tag => [normalizeTagKey(tag.name), tag.name]));
  return selections.map(selection => {
    const matchedTags: string[] = [];
    for (const tag of selection.matchedTags) {
      const canonical = tags.get(normalizeTagKey(tag));
      if (!canonical || matchedTags.includes(canonical)) {
        throw new DiscoveryError('INVALID_AI_OUTPUT', 'Grok selected an unknown or duplicate discovery tag');
      }
      matchedTags.push(canonical);
    }
    return { ...selection, matchedTags };
  });
}
