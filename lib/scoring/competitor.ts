import type { GameConcept, NormalizedGame, ScoredCompetitor } from '@/lib/types';
import { scoreSimilarity } from './similarity';

export function scoreCompetitor(
  concept: GameConcept,
  game: NormalizedGame,
  semanticScore: number,
  rationalePrefix = '',
  userAdded = false,
): ScoredCompetitor {
  const similarity = scoreSimilarity(concept, game, semanticScore);
  return {
    game,
    similarity: {
      score: similarity.score,
      components: similarity.components,
      rationale: [rationalePrefix.trim(), similarity.rationale].filter(Boolean).join(' '),
    },
    competitiveThreat: Math.round(similarity.score * 100),
    userAdded,
  };
}
