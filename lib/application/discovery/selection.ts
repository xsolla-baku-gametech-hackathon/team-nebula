import { DiscoveryError, RankingSchema, type Candidate, type DescriptionValidation, type Ranking } from '@/lib/domain/schemas';
import { normalizeTagKey } from '@/lib/domain/tag-vocabulary';

/**
 * Ranking is advisory: the backend still owns identity, but a model that invents one
 * id out of twenty should cost that one row, not the whole request. Downstream code
 * in `preview-competitors` already treats an unknown id as a no-op, so dropping here
 * only removes a throw that pre-empted a guard that already existed.
 *
 * A response that cannot be parsed at all is different — there is nothing to salvage,
 * so that still raises INVALID_AI_OUTPUT.
 */

export type RankingDrop =
  | { kind: 'selection'; reason: 'unknown_id' | 'duplicate_id'; igdbId: number }
  | { kind: 'tag'; reason: 'unknown_tag'; igdbId: number };

/** Derived from the schema so the two cannot drift apart. */
export type RankedSelection = Ranking['selections'][number];
export type RankingOutcome = { selections: RankedSelection[]; drops: RankingDrop[] };

export function validateRanking(input: unknown, candidates: Candidate[]): RankingOutcome {
  const parsed = RankingSchema.safeParse(input);
  if (!parsed.success) throw new DiscoveryError('INVALID_AI_OUTPUT', 'Grok returned an invalid candidate ranking');

  const allowed = new Set(candidates.map(candidate => candidate.igdbId));
  const seen = new Set<number>();
  const selections: RankedSelection[] = [];
  const drops: RankingDrop[] = [];

  for (const selected of parsed.data.selections) {
    if (!allowed.has(selected.igdbId)) {
      drops.push({ kind: 'selection', reason: 'unknown_id', igdbId: selected.igdbId });
      continue;
    }
    if (seen.has(selected.igdbId)) {
      drops.push({ kind: 'selection', reason: 'duplicate_id', igdbId: selected.igdbId });
      continue;
    }
    seen.add(selected.igdbId);
    selections.push(selected);
  }

  return { selections, drops };
}

export function validatePreviewRanking(
  input: unknown,
  candidates: Candidate[],
  validation: DescriptionValidation,
): RankingOutcome {
  const { selections, drops } = validateRanking(input, candidates);
  // Matched on a normalized key, then returned in the validated spelling: the ranking
  // stage must not fail the whole request over case or punctuation drift.
  const tags = new Map(validation.tags.map(tag => [normalizeTagKey(tag.name), tag.name]));

  const ranked = selections.map(selection => {
    const matchedTags: string[] = [];
    for (const tag of selection.matchedTags) {
      const canonical = tags.get(normalizeTagKey(tag));
      if (!canonical) {
        drops.push({ kind: 'tag', reason: 'unknown_tag', igdbId: selection.igdbId });
        continue;
      }
      // Two spellings collapsing to one canonical tag is the canonicalizer working,
      // not a degraded response, so a repeat is deduped rather than reported.
      if (!matchedTags.includes(canonical)) matchedTags.push(canonical);
    }
    return { ...selection, matchedTags };
  });

  return { selections: ranked, drops };
}

/** User-facing summaries. Counts only — ids belong in the server log, not the UI. */
export function rankingDropIssues(drops: readonly RankingDrop[]): string[] {
  const selections = drops.filter(drop => drop.kind === 'selection').length;
  const tags = drops.filter(drop => drop.kind === 'tag').length;
  const issues: string[] = [];
  if (selections) {
    issues.push(`${selections} ranked ${selections === 1 ? 'result was' : 'results were'} skipped because Grok returned games outside the candidate pool.`);
  }
  if (tags) {
    issues.push(tags === 1
      ? '1 matched tag was removed because it was not in the validated tag list.'
      : `${tags} matched tags were removed because they were not in the validated tag list.`);
  }
  return issues;
}
