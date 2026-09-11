import { z } from 'zod';
import { ok, fail } from '@/lib/api/envelope';
import { fetchUpcomingReleases, type UpcomingCollection } from '@/lib/analysis/upcoming';
import { getCorpus } from '@/lib/corpus/load';
import { scoreCompetitor, scoreSaturation, scoreRevenue, scoreReception, scoreReleaseRisk } from '@/lib/domain/scoring';
import type { GameConcept, NormalizedGame, MarketReport, ScoredCompetitor } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 120;

const Schema = z.object({
  concept: z.unknown(),
  competitors: z.array(z.unknown()).min(1).max(10).optional(),
  comparables: z.array(z.unknown()).min(1).max(10).optional(),
  competitorAppIds: z.array(z.number()).min(1).max(30).optional(),
  horizonWeeks: z.number().int().min(26).max(52).optional().default(26),
}).refine(
  body => Boolean(body.competitors?.length || body.comparables?.length || body.competitorAppIds?.length),
  { message: 'Provide scored competitors, live comparables, or competitorAppIds' },
);

export async function POST(req: Request) {
  const t0 = performance.now();
  try {
    const body = Schema.parse(await req.json());
    const concept = body.concept as GameConcept;
    let competitors = (body.competitors ?? []) as ScoredCompetitor[];
    let corpusVersion = 'live';

    if (competitors.length) {
      competitors = competitors.map(competitor => scoreCompetitor(
        concept,
        competitor.game,
        competitor.similarity.components.semantic,
        '',
        competitor.userAdded,
      ));
    }

    // Compatibility inputs are scored here; the live UI submits canonical scored competitors.
    if (!competitors.length && body.comparables?.length) {
      competitors = (body.comparables as NormalizedGame[]).map(game =>
        scoreCompetitor(concept, game, 0, 'Semantic evidence was unavailable for this compatibility request.'));
    }

    // Keep the old ID-based contract available while the main UI uses live records.
    if (!competitors.length && body.competitorAppIds?.length) {
      const corpus = getCorpus();
      const appIdSet = new Set(body.competitorAppIds);
      competitors = corpus.games
        .filter(game => appIdSet.has(game.identity.steamAppId))
        .map(game => scoreCompetitor(concept, game, 0, 'Semantic evidence was unavailable for this compatibility request.'));
      corpusVersion = corpus.meta.corpusVersion;
    }

    if (!competitors.length) {
      throw new Error('No scored competitor records were supplied');
    }
    const comparables = competitors.map(competitor => competitor.game);

    const today = new Date();
    let upcoming: UpcomingCollection;
    let releaseStatus: MarketReport['releaseData']['status'] = 'live';
    try {
      upcoming = await fetchUpcomingReleases(concept, today, body.horizonWeeks);
    } catch {
      releaseStatus = 'unavailable';
      upcoming = {
        dated: [],
        undated: [],
        fetchedAt: new Date().toISOString(),
        issues: ['Live upcoming-release data is temporarily unavailable.'],
      };
    }

    const saturation = scoreSaturation(
      comparables,
      releaseStatus === 'live' ? upcoming.dated.length + upcoming.undated.length : 0,
    );
    const revenue = scoreRevenue(concept, competitors, saturation.score);
    const reception = scoreReception(concept, comparables);
    const releaseRisk = releaseStatus === 'live'
      ? scoreReleaseRisk(concept, upcoming.dated, today, body.horizonWeeks)
      : {
          windows: [],
          verdict: {
            decision: 'INSUFFICIENT_DATA' as const,
            currentDate: concept.commercial.plannedRelease,
            recommendedDate: null,
            reasoning: ['Upcoming release data could not be loaded, so no launch verdict was calculated.'],
          },
        };

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
        drivers: revenue.drivers,
      },
      reception: {
        predictedPositiveRatio: reception.predictedPositiveRatio,
        cohortMedian: reception.cohortMedianPositiveRatio,
        band: reception.band,
      },
      releaseWindows: releaseRisk.windows,
      releaseData: {
        status: releaseStatus,
        source: 'igdb-mcp',
        fetchedAt: upcoming.fetchedAt,
        datedCount: upcoming.dated.length,
        undatedCount: upcoming.undated.length,
        issues: upcoming.issues,
      },
      undatedReleases: upcoming.undated,
      verdict: releaseRisk.verdict,
    };

    return ok({ report }, t0, corpusVersion);
  } catch (e) {
    return fail(e, t0);
  }
}
