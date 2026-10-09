import { scoreCompetitor } from '@/lib/domain/scoring/competitor';
import type { GameConcept, NormalizedGame, ScoredCompetitor } from '@/lib/domain/types';

/** Rank with actual vector evidence; unavailable vectors never become tag-derived semantics. */
export function rankCorpus(
  concept: GameConcept,
  games: NormalizedGame[],
  vectors: Float32Array,
  query: Float32Array | null,
  dims: number,
  options: { limit: number; excludeAppIds?: number[]; includeAppIds?: number[] },
): ScoredCompetitor[] {
  const excluded = new Set(options.excludeAppIds ?? []);
  const included = new Set(options.includeAppIds ?? []);
  const queryNorm = query?.reduce((sum, value) => sum + value * value, 0) ?? 0;
  const validQuery = query !== null && query.length === dims
    && Number.isFinite(queryNorm) && queryNorm > 0
    && vectors.length === games.length * dims;

  return games.flatMap((game, index) => {
    if (!game.release.isReleased || excluded.has(game.identity.steamAppId)) return [];
    let semantic: number | null = null;
    if (validQuery) {
      let dot = 0;
      let norm = 0;
      for (let d = 0; d < dims; d++) {
        const value = vectors[index * dims + d];
        dot += query![d] * value;
        norm += value * value;
      }
      if (Number.isFinite(dot) && Number.isFinite(norm) && norm > 0) {
        semantic = Math.max(0, Math.min(1, dot / Math.sqrt(queryNorm * norm)));
      }
    }
    return [scoreCompetitor(
      concept, game, semantic,
      semantic === null ? 'Semantic evidence unavailable; ranked using available structured features.' : '',
      included.has(game.identity.steamAppId),
    )];
  }).sort((a, b) => b.similarity.score - a.similarity.score).slice(0, options.limit);
}
