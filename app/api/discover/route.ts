import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail } from '@/lib/api/envelope';
import { getCorpus } from '@/lib/infrastructure/corpus/load';
import { embedConcept } from '@/lib/infrastructure/embeddings/client';
import { rankCorpus } from '@/lib/application/discovery/rank-corpus';
import type { GameConcept } from '@/lib/domain/types';

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

    let query: Float32Array | null = null;
    // The bundled demo corpus has tag-only vectors, incompatible with text embeddings.
    if (corpus.meta.embeddingModel === 'text-embedding-3-small') {
      try {
        query = await embedConcept(concept);
      } catch {
        // Provider failure still permits honest structured-only ranking.
      }
    }
    const candidates = rankCorpus(concept, corpus.games, corpus.vecs, query, corpus.meta.dims, body);

    return ok(
      { competitors: candidates, totalCandidates: corpus.games.length, filterRelaxed: false },
      t0,
      corpus.meta.corpusVersion,
      candidates.some(candidate => candidate.similarity.components.semantic === null)
        ? ['embedding_fallback'] : undefined,
    );
  } catch (e) {
    return fail(e, t0);
  }
}
