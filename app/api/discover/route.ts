import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail } from '@/lib/api/envelope';
import { getCorpus } from '@/lib/infrastructure/corpus/load';
import { tagOverlap } from '@/lib/infrastructure/corpus/search';
import { scoreSimilarity } from '@/lib/domain/scoring';
import { isCanonicalTag } from '@/lib/domain/tag-vocabulary';
import type { GameConcept, ScoredCompetitor } from '@/lib/domain/types';

const Schema = z.object({
  concept: z.unknown(),
  limit: z.number().min(1).max(30).optional().default(12),
  excludeAppIds: z.array(z.number()).optional(),
  includeAppIds: z.array(z.number()).optional(),
});

export async function POST(req: NextRequest) {
  const t0 = performance.now();
  try {
    const body = Schema.parse(await req.json());
    const concept = body.concept as GameConcept;

    let corpus;
    try {
      corpus = getCorpus();
    } catch {
      return fail(new Error('Corpus not available'), t0);
    }

    const excludeSet = new Set(body.excludeAppIds ?? []);
    const includeSet = new Set(body.includeAppIds ?? []);

    // Build concept tags from taxonomy
    const conceptTags = [
      concept.taxonomy.primaryGenre,
      ...concept.taxonomy.secondaryGenres,
      ...concept.taxonomy.themes,
      ...concept.taxonomy.mechanics,
      ...concept.taxonomy.gameModes,
    ].filter(Boolean) as string[];
    const matchableTagCount = Math.max(conceptTags.filter(isCanonicalTag).length, 1);

    // Score all games by tag overlap (no embeddings needed)
    const candidates = corpus.games
      .filter(g => g.release.isReleased)
      .filter(g => !excludeSet.has(g.identity.steamAppId))
      .map(g => {
        const overlap = tagOverlap(conceptTags, [
          ...g.metadata.tags,
          ...g.metadata.genres,
          ...g.metadata.keywords,
          ...g.metadata.gameModes,
        ]);
        // Use tag overlap as a pseudo-semantic score (0-1 range). The divisor counts only
        // tags that could ever match a corpus field; a free-form facet such as a setting is
        // unmatchable, so including it would suppress every candidate's score.
        const pseudoSemantic = Math.min(overlap / matchableTagCount, 1);
        const sim = scoreSimilarity(concept, g, pseudoSemantic);
        return {
          game: g,
          similarity: { score: sim.score, components: sim.components, rationale: sim.rationale },
          competitiveThreat: sim.score * 100,
          userAdded: includeSet.has(g.identity.steamAppId),
        } satisfies ScoredCompetitor;
      })
      .sort((a, b) => b.similarity.score - a.similarity.score)
      .slice(0, body.limit);

    return ok(
      { competitors: candidates, totalCandidates: corpus.games.length, filterRelaxed: false },
      t0,
      corpus.meta.corpusVersion,
    );
  } catch (e) {
    return fail(e, t0);
  }
}
