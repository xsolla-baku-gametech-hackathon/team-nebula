import 'server-only';
import { z } from 'zod';
import { withMcp } from '@/lib/infrastructure/mcp/client';
import { parseProvider } from '@/lib/infrastructure/collector/http';
import type { GameConcept, UpcomingRelease } from '@/lib/domain/types';

const PC_PLATFORM_ID = 6;
const MIN_SIMILARITY = 0.3;

const SemanticResults = z.object({
  results: z.array(z.object({
    game: z.object({
      id: z.number().int().positive(),
      name: z.string().min(1),
      summary: z.string().nullish(),
      platforms: z.array(z.number().int()).nullish(),
      first_release_date: z.string().nullish(),
      hypes: z.number().int().nonnegative().nullish(),
    }),
    similarity: z.number().min(0).max(1),
  })),
});

const ReleaseDates = z.object({
  results: z.array(z.object({
    id: z.number().int().positive(),
    game: z.number().int().positive(),
    date: z.string().min(1),
    human: z.string().nullish(),
    platform: z.number().int().nullish(),
  })),
});

type SemanticGame = z.infer<typeof SemanticResults>['results'][number];
type ReleaseDateRow = z.infer<typeof ReleaseDates>['results'][number];
type DateWindow = Pick<UpcomingRelease,
  'expectedDate' | 'dateLabel' | 'dateConfidence' | 'rangeStart' | 'rangeEnd'>;

const monthNumbers: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
  apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10,
  october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function utcDate(year: number, month: number, day = 1): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function plusDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function releaseDateWindow(row: ReleaseDateRow): DateWindow {
  const label = row.human?.trim() || isoDate(new Date(row.date));
  const quarter = label.match(/^Q([1-4])\s+(\d{4})$/i);
  if (quarter) {
    const start = utcDate(Number(quarter[2]), (Number(quarter[1]) - 1) * 3 + 1);
    const end = utcDate(Number(quarter[2]), (Number(quarter[1]) - 1) * 3 + 4);
    return { expectedDate: isoDate(start), dateLabel: label, dateConfidence: 'quarter',
      rangeStart: isoDate(start), rangeEnd: isoDate(end) };
  }

  const month = label.match(/^([A-Za-z]+)\s+(\d{4})$/);
  const monthNumber = month ? monthNumbers[month[1].toLocaleLowerCase()] : undefined;
  if (month && monthNumber) {
    const start = utcDate(Number(month[2]), monthNumber);
    const end = monthNumber === 12
      ? utcDate(Number(month[2]) + 1, 1)
      : utcDate(Number(month[2]), monthNumber + 1);
    return { expectedDate: isoDate(start), dateLabel: label, dateConfidence: 'month',
      rangeStart: isoDate(start), rangeEnd: isoDate(end) };
  }

  if (/^\d{4}$/.test(label) || /^tbd$/i.test(label)) {
    return { expectedDate: null, dateLabel: label, dateConfidence: 'vague',
      rangeStart: null, rangeEnd: null };
  }

  const exact = new Date(row.date);
  if (Number.isNaN(exact.getTime())) {
    return { expectedDate: null, dateLabel: label, dateConfidence: 'vague',
      rangeStart: null, rangeEnd: null };
  }
  return { expectedDate: isoDate(exact), dateLabel: label, dateConfidence: 'exact',
    rangeStart: isoDate(exact), rangeEnd: isoDate(plusDays(exact, 1)) };
}

function buildQuery(concept: GameConcept): string {
  const taxonomy = concept.taxonomy;
  return [
    concept.concept.shortDescription || concept.concept.rawText,
    taxonomy.primaryGenre,
    ...taxonomy.secondaryGenres,
    ...taxonomy.themes,
    ...taxonomy.mechanics,
    ...taxonomy.gameModes,
    taxonomy.perspective,
    'upcoming unreleased PC release',
  ].filter(Boolean).join(', ').slice(0, 500);
}

function popularityThreat(similarity: number, hypes: number | null): number {
  const similarityScore = Math.round(similarity * 100);
  const hypeBoost = hypes ? Math.min(20, Math.round(Math.log2(hypes + 1) * 5)) : 0;
  return Math.min(100, similarityScore + hypeBoost);
}

function toUpcoming(candidate: SemanticGame, date: DateWindow): UpcomingRelease {
  const similarity = Math.round(candidate.similarity * 100);
  const hypes = candidate.game.hypes ?? null;
  return {
    igdbId: candidate.game.id,
    steamAppId: null,
    name: candidate.game.name,
    ...date,
    similarity,
    threat: popularityThreat(candidate.similarity, hypes),
    hypes,
    followers: null,
    isMajorPublisher: false,
  };
}

export type UpcomingCollection = {
  dated: UpcomingRelease[];
  undated: UpcomingRelease[];
  fetchedAt: string;
  issues: string[];
};

export async function fetchUpcomingReleases(
  concept: GameConcept,
  today: Date,
  horizonWeeks: number,
  runMcp: typeof withMcp = withMcp,
): Promise<UpcomingCollection> {
  const horizonEnd = plusDays(today, horizonWeeks * 7);
  return runMcp(async call => {
    const semantic = parseProvider('igdb', SemanticResults, await call('semantic_search_games', {
      query: buildQuery(concept),
      limit: 50,
      fields: ['id', 'name', 'summary', 'platforms', 'first_release_date', 'hypes'],
    }));
    const candidates = semantic.results.filter(result =>
      result.similarity >= MIN_SIMILARITY
      && (result.game.platforms ?? []).includes(PC_PLATFORM_ID));
    if (!candidates.length) {
      return { dated: [], undated: [], fetchedAt: new Date().toISOString(),
        issues: ['No similar upcoming PC releases were found.'] };
    }

    const ids = candidates.map(candidate => candidate.game.id);
    const releaseDates = parseProvider('igdb', ReleaseDates, await call('query', {
      entity: 'release_date',
      filters: {
        game: { in: ids },
        platform: { eq: PC_PLATFORM_ID },
        date: {
          gte: Math.floor(today.getTime() / 1000),
          lte: Math.floor(horizonEnd.getTime() / 1000),
        },
      },
      fields: ['id', 'game', 'date', 'human', 'platform'],
      sort: { field: 'date', order: 'ASC' },
      limit: 100,
    }));

    const dateByGame = new Map<number, ReleaseDateRow>();
    for (const releaseDate of releaseDates.results) {
      if (!dateByGame.has(releaseDate.game)) dateByGame.set(releaseDate.game, releaseDate);
    }

    const dated: UpcomingRelease[] = [];
    const undated: UpcomingRelease[] = [];
    for (const candidate of candidates) {
      const releaseDate = dateByGame.get(candidate.game.id);
      if (releaseDate) {
        const upcoming = toUpcoming(candidate, releaseDateWindow(releaseDate));
        if (upcoming.dateConfidence === 'vague') undated.push(upcoming);
        else dated.push(upcoming);
        continue;
      }
      if (!candidate.game.first_release_date) {
        undated.push(toUpcoming(candidate, {
          expectedDate: null,
          dateLabel: 'TBD',
          dateConfidence: 'vague',
          rangeStart: null,
          rangeEnd: null,
        }));
      }
    }

    return {
      dated: dated.sort((a, b) => (a.rangeStart ?? '').localeCompare(b.rangeStart ?? '')),
      undated: undated.sort((a, b) => b.similarity - a.similarity),
      fetchedAt: new Date().toISOString(),
      issues: dated.length || undated.length ? [] : ['No similar upcoming PC releases were found.'],
    };
  });
}
