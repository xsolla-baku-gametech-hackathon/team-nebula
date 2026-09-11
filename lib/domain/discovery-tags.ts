import { DescriptionValidationSchema, type DescriptionValidation, type DiscoveryTag } from './schemas';
import { canonicalTag, explicitGenreTags, normalizeTagKey } from './tag-vocabulary';

/**
 * Deterministic post-LLM normalization of discovery tags.
 *
 * Grok is asked for canonical names but cannot be relied on to produce them, and
 * nothing in the schema requires that a genre stated in the description survives.
 * This closes the `genre` category to the vocabulary and guarantees stated genres
 * appear, while leaving every other category free-form on purpose — see
 * `docs/backend-reference/tag-semantics.md`.
 */

const MAX_TAGS = 12;

/**
 * Canonicalizes a tag's spelling, returning null when it must be dropped.
 *
 * A vocabulary hit also adopts the vocabulary's category, which is what repairs a
 * genre the model filed as a mechanic. Off-vocabulary names survive in every
 * category except `genre`, where free text breaks exact-match scoring.
 */
export function canonicalizeTag(tag: DiscoveryTag): DiscoveryTag | null {
  const canonical = canonicalTag(tag.name);
  if (!canonical) return tag.category === 'genre' ? null : tag;
  return {
    ...tag,
    name: canonical.name,
    category: canonical.category === 'genre' ? 'genre' : tag.category,
  };
}

/** Merges names that differ only by case or punctuation, keeping the stronger claim. */
export function mergeTags(tags: readonly DiscoveryTag[]): DiscoveryTag[] {
  const merged = new Map<string, DiscoveryTag>();
  for (const tag of tags) {
    const key = normalizeTagKey(tag.name);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, tag);
      continue;
    }
    merged.set(key, {
      ...existing,
      priority: existing.priority === 'required' || tag.priority === 'required' ? 'required' : 'preferred',
      basis: existing.basis === 'explicit' || tag.basis === 'explicit' ? 'explicit' : 'inferred',
    });
  }
  return [...merged.values()];
}

/**
 * Trims to the schema cap, dropping the weakest claims first.
 *
 * A plain slice would let a full twelve-tag model response push out the genres we
 * just guaranteed, so ordering is by priority and basis rather than arrival.
 */
export function capTags(tags: readonly DiscoveryTag[], limit: number = MAX_TAGS): DiscoveryTag[] {
  const rank = (tag: DiscoveryTag) =>
    (tag.priority === 'required' ? 0 : 2) + (tag.basis === 'explicit' ? 0 : 1);
  return [...tags]
    .map((tag, index) => ({ tag, index, rank: rank(tag) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit)
    .map(entry => entry.tag);
}

/**
 * Returns a validation whose tags are canonical and include every genre the raw
 * query states outright.
 *
 * Never throws and never mutates its input. A result that cannot be re-validated
 * is discarded in favour of the original, so normalization can never turn a
 * working request into an error.
 */
export function normalizeDiscoveryTags(
  validation: DescriptionValidation,
  rawQuery: string,
): DescriptionValidation {
  if (validation.status !== 'ready') return validation;

  const canonicalized = validation.tags.flatMap(tag => {
    const canonical = canonicalizeTag(tag);
    return canonical ? [canonical] : [];
  });

  const stated: DiscoveryTag[] = explicitGenreTags(rawQuery).map(genre => ({
    name: genre.name, category: 'genre', priority: 'required', basis: 'explicit',
  }));

  const normalized = {
    ...validation,
    tags: capTags(mergeTags([...canonicalized, ...stated])),
  };

  const reparsed = DescriptionValidationSchema.safeParse(normalized);
  return reparsed.success ? reparsed.data : validation;
}
