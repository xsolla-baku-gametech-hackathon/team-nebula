import { z } from 'zod';
import { analyzeMarket } from '@/lib/application/analysis/analyze-market';
import { fail, ok } from '@/lib/api/envelope';
import type { GameConcept, NormalizedGame, ScoredCompetitor } from '@/lib/domain/types';

export const runtime = 'nodejs';
export const maxDuration = 120;

const Schema = z.object({
  concept: z.unknown(),
  competitors: z.array(z.unknown()).min(1).max(10).optional(),
  comparables: z.array(z.unknown()).min(1).max(10).optional(),
  competitorAppIds: z.array(z.number()).min(1).max(30).optional(),
  horizonWeeks: z.number().int().min(26).max(52).optional().default(26),
}).refine(
  (body) => Boolean(body.competitors?.length || body.comparables?.length || body.competitorAppIds?.length),
  { message: 'Provide scored competitors, live comparables, or competitorAppIds' },
);

export async function POST(req: Request) {
  const t0 = performance.now();
  try {
    const body = Schema.parse(await req.json());
    const result = await analyzeMarket({
      concept: body.concept as GameConcept,
      competitors: body.competitors as ScoredCompetitor[] | undefined,
      comparables: body.comparables as NormalizedGame[] | undefined,
      competitorAppIds: body.competitorAppIds,
      horizonWeeks: body.horizonWeeks,
    });
    return ok({ report: result.report }, t0, result.corpusVersion);
  } catch (error) {
    return fail(error, t0);
  }
}
