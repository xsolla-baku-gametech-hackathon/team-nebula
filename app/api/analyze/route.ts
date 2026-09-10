import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail } from '@/lib/api/envelope';
import { getCorpus } from '@/lib/corpus/load';
import { scoreSaturation, scoreRevenue, scoreReception, scoreReleaseRisk } from '@/lib/scoring';
import type { GameConcept, NormalizedGame, MarketReport } from '@/lib/types';

const Schema = z.object({
  concept: z.unknown(),
  comparables: z.array(z.unknown()).min(1).max(10).optional(),
  competitorAppIds: z.array(z.number()).min(1).max(30).optional(),
  horizonWeeks: z.number().optional().default(26),
}).refine(
  body => Boolean(body.comparables?.length || body.competitorAppIds?.length),
  { message: 'Provide live comparables or competitorAppIds' },
);

export async function POST(req: NextRequest) {
  const t0 = performance.now();
  try {
    const body = Schema.parse(await req.json());
    const concept = body.concept as GameConcept;
    let comparables = (body.comparables ?? []) as NormalizedGame[];
    let upcomingCount = 0;
    let corpusVersion = 'live';

    // Keep the old ID-based contract available while the main UI uses live records.
    if (!comparables.length && body.competitorAppIds?.length) {
      const corpus = getCorpus();
      const appIdSet = new Set(body.competitorAppIds);
      comparables = corpus.games.filter(game => appIdSet.has(game.identity.steamAppId));
      upcomingCount = corpus.upcoming.length;
      corpusVersion = corpus.meta.corpusVersion;
    }

    if (!comparables.length) {
      throw new Error('No comparable game records were supplied');
    }

    const saturation = scoreSaturation(comparables, upcomingCount);
    const revenue = scoreRevenue(concept, comparables, saturation.score);
    const reception = scoreReception(concept, comparables);
    const releaseRisk = scoreReleaseRisk(concept, [], new Date(), body.horizonWeeks);

    const report: MarketReport = {
      saturation: {
        score: saturation.score,
        band: saturation.band,
        drivers: saturation.drivers,
      },
      revenue: {
        conservative: revenue.conservative,
        base: revenue.base,
        upside: revenue.upside,
        currency: 'USD',
        confidence: revenue.confidence,
        basedOnCount: revenue.basedOnCount,
        method: revenue.method,
      },
      reception: {
        predictedPositiveRatio: reception.predictedPositiveRatio,
        cohortMedian: reception.cohortMedianPositiveRatio,
        band: reception.band,
      },
      releaseWindows: releaseRisk.windows,
      verdict: releaseRisk.verdict,
    };

    return ok({ report }, t0, corpusVersion);
  } catch (e) {
    return fail(e, t0);
  }
}
