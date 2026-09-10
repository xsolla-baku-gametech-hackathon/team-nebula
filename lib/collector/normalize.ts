import type { GameMode, Perspective, Platform, Source, Sourced } from '@/lib/types';
import { plainText, steamDate, steamPrices, type SteamDetails } from './steam-details';
import type { ReviewSummary } from './steam-reviews';
import type { GamalyticGame } from './gamalytic';
import type { IgdbMetadata } from './igdb';
import type { CollectedGame, ProviderIssue, ReviewComment } from './types';

const sourced = <T>(value: T | null | undefined, source: Source, estimated = false, method?: string): Sourced<T> =>
  ({ value: value ?? null, source, estimated, ...(method ? { method } : {}) });
export type Enrichment = {
  reviews?: ReviewSummary; comments?: ReviewComment[]; tags?: string[];
  gamalytic?: GamalyticGame; igdb?: IgdbMetadata;
  issues: ProviderIssue[]; fetches: CollectedGame['collection']['fetches'];
};
const modes: Record<number, GameMode> = { 2: 'Singleplayer', 9: 'Online Co-op', 24: 'Local Co-op', 36: 'Online PvP', 37: 'Local PvP', 20: 'MMO' };
const perspectives: Record<string, Perspective> = {
  'First person': 'First person', 'Third person': 'Third person', 'Bird view / Isometric': 'Isometric',
  'Side view': 'Side view', 'Text': 'Text',
};

export function normalizeGame(steam: SteamDetails, extra: Enrichment): CollectedGame {
  const price = steamPrices(steam);
  const date = steamDate(steam.release_date.date);
  const reviews = extra.reviews;
  const issues = [...extra.issues];
  for (const [field, value, provider] of [
    ['commercial.priceUsd', price.current, 'steam'],
    ['commercial.estimatedCopiesSold', extra.gamalytic?.copiesSold, 'gamalytic'],
    ['commercial.estimatedRevenueUsd', extra.gamalytic?.revenue, 'gamalytic'],
  ] as const) {
    if (value == null) issues.push({ provider, code: 'missing_field', field, message: 'Provider did not supply this value' });
  }
  const platforms: Platform[] = [];
  if (steam.platforms.windows) platforms.push('PC');
  if (steam.platforms.mac) platforms.push('Mac');
  if (steam.platforms.linux) platforms.push('Linux');
  return {
    identity: { steamAppId: steam.steam_appid, igdbId: extra.igdb?.id ?? null, name: steam.name, steamUrl: `https://store.steampowered.com/app/${steam.steam_appid}/` },
    metadata: {
      summary: plainText(steam.detailed_description || steam.short_description),
      genres: steam.genres.map(genre => genre.description), themes: extra.igdb?.themes ?? [],
      tags: extra.tags ?? [], keywords: extra.igdb?.keywords ?? [],
      gameModes: [...new Set(steam.categories.flatMap(category => modes[category.id] ? [modes[category.id]] : []))],
      perspectives: [...new Set((extra.igdb?.perspectives ?? []).flatMap(name => perspectives[name] ? [perspectives[name]] : []))],
      platforms, developers: steam.developers, publishers: steam.publishers,
    },
    release: { date: date.date, dateText: steam.release_date.date || null, datePrecision: date.precision,
      isReleased: !steam.release_date.coming_soon, isEarlyAccess: steam.genres.some(genre => genre.id === '70') },
    commercial: {
      currency: 'USD', priceUsd: sourced(price.current, 'steam'), regularPriceUsd: sourced(price.regular, 'steam'),
      estimatedCopiesSold: sourced(extra.gamalytic?.copiesSold, 'gamalytic', true, 'Gamalytic estimate of Steam purchases; not owners'),
      estimatedRevenueUsd: sourced(extra.gamalytic?.revenue, 'gamalytic', true, 'Gamalytic gross USD estimate before platform fees and taxes'),
    },
    reviews: {
      total: sourced(reviews?.total_reviews, 'steam'), positive: sourced(reviews?.total_positive, 'steam'), negative: sourced(reviews?.total_negative, 'steam'),
      positiveRatio: sourced(reviews && reviews.total_reviews > 0 ? reviews.total_positive / reviews.total_reviews : null, 'steam'),
      sentimentSummary: sourced(reviews?.review_score_desc, 'steam'), comments: (extra.comments ?? []).slice(0, 3),
    },
    collection: { collectedAt: new Date().toISOString(), fetches: extra.fetches, issues,
      sources: { identity: 'steam', 'identity.igdbId': 'igdb', 'metadata.summary': 'steam', 'metadata.genres': 'steam',
        'metadata.tags': 'steam', 'metadata.themes': 'igdb', 'metadata.keywords': 'igdb', 'metadata.perspectives': 'igdb',
        'metadata.gameModes': 'steam', 'metadata.platforms': 'steam', 'metadata.developers': 'steam', 'metadata.publishers': 'steam', release: 'steam', reviews: 'steam' } },
  };
}
