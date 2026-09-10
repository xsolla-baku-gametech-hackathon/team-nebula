import type { NormalizedGame, CorpusMeta } from '@/lib/types';

export function cosine(q: Float32Array, vecs: Float32Array, i: number, dims: number): number {
  let s = 0;
  const o = i * dims;
  for (let d = 0; d < dims; d++) s += q[d] * vecs[o + d];
  return s;
}

export function tagOverlap(conceptTags: string[], gameTags: string[]): number {
  const set = new Set(conceptTags.map(t => t.toLowerCase()));
  return gameTags.filter(t => set.has(t.toLowerCase())).length;
}

export function searchCorpus(
  query: Float32Array,
  games: NormalizedGame[],
  vecs: Float32Array,
  meta: CorpusMeta,
  conceptTags: string[],
  limit: number = 40,
): { game: NormalizedGame; semanticScore: number }[] {
  const MIN_TAG_OVERLAP = 1;
  const RELAX_THRESHOLD = 60;

  let candidates = games
    .map((game, i) => ({ game, i, overlap: tagOverlap(conceptTags, game.metadata.tags) }))
    .filter(c => c.game.release.isReleased && c.game.metadata.summary.length > 50);

  const withTags = candidates.filter(c => c.overlap >= MIN_TAG_OVERLAP);
  if (withTags.length >= RELAX_THRESHOLD) {
    candidates = withTags;
  }

  const scored = candidates.map(c => ({
    game: c.game,
    semanticScore: cosine(query, vecs, c.i, meta.dims),
  }));

  scored.sort((a, b) => b.semanticScore - a.semanticScore);
  return scored.slice(0, limit);
}

export function fuzzySearch(games: NormalizedGame[], query: string, limit: number = 8): NormalizedGame[] {
  const q = query.toLowerCase();
  return games
    .filter(g => g.identity.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aPrefix = a.identity.name.toLowerCase().startsWith(q) ? 1 : 0;
      const bPrefix = b.identity.name.toLowerCase().startsWith(q) ? 1 : 0;
      if (aPrefix !== bPrefix) return bPrefix - aPrefix;
      return (b.reviews.total.value ?? 0) - (a.reviews.total.value ?? 0);
    })
    .slice(0, limit);
}
