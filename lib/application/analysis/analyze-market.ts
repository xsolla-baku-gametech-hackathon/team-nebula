import 'server-only';

import { getCorpus } from '@/lib/infrastructure/corpus/load';
import {
  scoreCompetitor,
  scoreReception,
  scoreReleaseRisk,
  scoreRevenue,
  scoreSaturation,
} from '@/lib/domain/scoring';
import type {
  GameConcept,
  MarketReport,
  NormalizedGame,
  ScoredCompetitor,
} from '@/lib/domain/types';
import {
  fetchUpcomingReleases,
  type UpcomingCollection,
} from './upcoming-releases';

export type AnalyzeMarketInput = {
  concept: GameConcept;
  competitors?: ScoredCompetitor[];
  comparables?: NormalizedGame[];
  competitorAppIds?: number[];
  horizonWeeks: number;
};

export type AnalysisProviders = {
  loadCorpus: typeof getCorpus;
  fetchUpcoming: typeof fetchUpcomingReleases;
  now: () => Date;
};

const providers: AnalysisProviders = {
  loadCorpus: getCorpus,
  fetchUpcoming: fetchUpcomingReleases,
  now: () => new Date(),
};

export async function analyzeMarket(
  input: AnalyzeMarketInput,
  deps: AnalysisProviders = providers,
): Promise<{ report: MarketReport; corpusVersion: string }> {
  const { concept, horizonWeeks } = input;
  let competitors = input.competitors ?? [];
  let corpusVersion = 'live';

  if (competitors.length) {
    competitors = competitors.map((competitor) => scoreCompetitor(
      concept,
      competitor.game,
      competitor.similarity.components.semantic,
      '',
      competitor.userAdded,
    ));
  }

  if (!competitors.length && input.comparables?.length) {
    competitors = input.comparables.map((game) => scoreCompetitor(
      concept,
      game,
      0,
      'Semantic evidence was unavailable for this compatibility request.',
    ));
  }

  if (!competitors.length && input.competitorAppIds?.length) {
    const corpus = deps.loadCorpus();
    const appIdSet = new Set(input.competitorAppIds);
    competitors = corpus.games
      .filter((game) => appIdSet.has(game.identity.steamAppId))
      .map((game) => scoreCompetitor(
        concept,
        game,
        0,
        'Semantic evidence was unavailable for this compatibility request.',
      ));
    corpusVersion = corpus.meta.corpusVersion;
  }

  if (!competitors.length) throw new Error('No scored competitor records were supplied');

  const comparables = competitors.map((competitor) => competitor.game);
  const today = deps.now();
  let upcoming: UpcomingCollection;
  let releaseStatus: MarketReport['releaseData']['status'] = 'live';

  try {
    upcoming = await deps.fetchUpcoming(concept, today, horizonWeeks);
  } catch {
    releaseStatus = 'unavailable';
    upcoming = {
      dated: [],
      undated: [],
      fetchedAt: deps.now().toISOString(),
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
    ? scoreReleaseRisk(concept, upcoming.dated, today, horizonWeeks)
    : {
        windows: [],
        verdict: {
          decision: 'INSUFFICIENT_DATA' as const,
          currentDate: concept.commercial.plannedRelease,
          recommendedDate: null,
          reasoning: ['Upcoming release data could not be loaded, so no launch verdict was calculated.'],
        },
      };

  return {
    corpusVersion,
    report: {
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
    },
  };
}
