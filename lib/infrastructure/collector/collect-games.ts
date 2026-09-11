import 'server-only';
import { fetchSteamDetails } from '@/lib/infrastructure/steam/details';
import { fetchSteamComments, fetchSteamReviews } from '@/lib/infrastructure/steam/reviews';
import { fetchSteamTags } from '@/lib/infrastructure/steam/tags';
import { fetchGamalytic } from '@/lib/infrastructure/gamalytic/client';
import { fetchIgdb } from '@/lib/infrastructure/igdb/client';
import { normalizeGame, type Enrichment } from './normalize-game';
import { CollectInput, providerIssue, type CollectionResult, type Fetched, type Provider } from './types';

const providers = { details: fetchSteamDetails, reviews: fetchSteamReviews, comments: fetchSteamComments,
  tags: fetchSteamTags, gamalytic: fetchGamalytic, igdb: fetchIgdb };
export type CollectorProviders = typeof providers;

/** Results exist only for the lifetime of this invocation. Each invocation fetches anew. */
export async function collectGames(input: unknown, deps: CollectorProviders = providers): Promise<CollectionResult> {
  const { steamAppIds } = CollectInput.parse(input);
  const details = await Promise.allSettled(steamAppIds.map(id => deps.details(id)));
  const validIds = steamAppIds.filter((_, index) => details[index].status === 'fulfilled');
  const result: CollectionResult = { games: [], failures: [] };
  if (!validIds.length) {
    details.forEach((detail, index) => {
      if (detail.status === 'rejected') result.failures.push({ steamAppId: steamAppIds[index], ...providerIssue('steam', detail.reason) });
    });
    return result;
  }
  const [gamalytic, igdb, extras] = await Promise.all([
    Promise.allSettled([deps.gamalytic(validIds)]).then(([value]) => value),
    Promise.allSettled([deps.igdb(validIds)]).then(([value]) => value),
    Promise.all(validIds.map(async id => {
      const [reviews, comments, tags] = await Promise.allSettled([deps.reviews(id), deps.comments(id), deps.tags(id)]);
      return { id, reviews, comments, tags };
    })),
  ]);
  for (let index = 0; index < details.length; index++) {
    const detail = details[index];
    const id = steamAppIds[index];
    if (detail.status === 'rejected') {
      result.failures.push({ steamAppId: id, ...providerIssue('steam', detail.reason) });
      continue;
    }
    const extra: Enrichment = { issues: [], fetches: { steamDetails: { fetchedAt: detail.value.fetchedAt } } };
    function unpack<T>(value: PromiseSettledResult<Fetched<T>>, provider: Provider, field: string): T | undefined {
      if (value.status === 'fulfilled') {
        extra.fetches[field] = { fetchedAt: value.value.fetchedAt };
        return value.value.data;
      }
      extra.issues.push({ ...providerIssue(provider, value.reason), field });
    }
    const supplemental = extras.find(item => item.id === id)!;
    extra.reviews = unpack(supplemental.reviews, 'steam', 'reviews');
    extra.comments = unpack(supplemental.comments, 'steam', 'comments');
    extra.tags = unpack(supplemental.tags, 'steam', 'tags');
    const estimates = unpack(gamalytic, 'gamalytic', 'gamalytic');
    extra.gamalytic = estimates?.games[id];
    if (estimates?.invalidIds.includes(id)) extra.issues.push({ provider: 'gamalytic', code: 'invalid_data', message: 'Invalid or ambiguous estimate record' });
    const metadata = unpack(igdb, 'igdb', 'igdb');
    extra.igdb = metadata?.games[id];
    if (metadata?.issues[id]) extra.issues.push(metadata.issues[id]);
    result.games.push(normalizeGame(detail.value.data, extra));
  }
  return result;
}
