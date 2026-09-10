import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail } from '@/lib/api/envelope';
import { getCorpus } from '@/lib/corpus/load';
import { scoreSaturation, scoreRevenue, scoreReception, scoreReleaseRisk } from '@/lib/scoring';
import type { GameConcept, NormalizedGame, MarketReport } from '@/lib/types';

const Schema = z.object({
  concept: z.unknown(),
  competitorAppIds: z.array(z.number()).min(1).max(30),
  horizonWeeks: z.number().optional().default(26),
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

    // Resolve competitor games from corpus
    const appIdSet = new Set(body.competitorAppIds);
    const comparables: NormalizedGame[] = corpus.games.filter(g =>
      appIdSet.has(g.identity.steamAppId)
    );

    // 1. Saturation
    const saturation = scoreSaturation(comparables, corpus.upcoming.length);

    // 2. Revenue
    const revenue = scoreRevenue(concept, comparables, saturation.score);

    // 3. Reception
    const reception = scoreReception(concept, comparables);

    // 4. Release risk (use upcoming games as empty for demo — no upcoming data)
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

    return ok({ report }, t0, corpus.meta.corpusVersion);
  } catch (e) {
    return fail(e, t0);
  }
}
