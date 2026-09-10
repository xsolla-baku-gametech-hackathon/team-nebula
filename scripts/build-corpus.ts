/**
 * Corpus builder: IGDB + Steam → data/games.json
 *
 * Usage: pnpm corpus:fetch
 *
 * Strategy:
 * 1. Query IGDB for PC games released 2018+ with ratings, paginated
 * 2. Resolve genre/theme/keyword/mode/perspective names
 * 3. Map to Steam AppIDs via IGDB websites (Steam store URLs)
 * 4. Enrich top games with Steam reviews
 * 5. Normalize to NormalizedGame[]
 * 6. Write data/games.json
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { igdbGames, igdbQuery } from './igdb-client';
import { getAppReviews } from './steam-client';

// Load env
import 'dotenv/config';

const DATA_DIR = join(process.cwd(), 'data');
const RAW_DIR = join(DATA_DIR, 'raw');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

// ── Lookup tables ──────────────────────────────────────────────────

type LookupMap = Map<number, string>;

async function buildLookup(endpoint: string): Promise<LookupMap> {
  const map: LookupMap = new Map();
  let offset = 0;
  const limit = 500;
  while (true) {
    const results = await igdbQuery(endpoint, `fields name; limit ${limit}; offset ${offset};`) as { id: number; name: string }[];
    for (const r of results) map.set(r.id, r.name);
    if (results.length < limit) break;
    offset += limit;
  }
  console.log(`  ${endpoint}: ${map.size} entries`);
  return map;
}

// ── Fetch games from IGDB ──────────────────────────────────────────

interface IgdbGame {
  id: number;
  name: string;
  summary?: string;
  first_release_date?: string;
  genres?: number[];
  themes?: number[];
  keywords?: number[];
  game_modes?: number[];
  player_perspectives?: number[];
  platforms?: number[];
  involved_companies?: number[];
  rating?: number;
  rating_count?: number;
  total_rating?: number;
  total_rating_count?: number;
  websites?: number[];
  external_games?: number[];
}

async function fetchIgdbGames(): Promise<IgdbGame[]> {
  const cachePath = join(RAW_DIR, 'igdb_games.json');
  if (existsSync(cachePath)) {
    console.log('  Using cached IGDB games');
    return JSON.parse(readFileSync(cachePath, 'utf8'));
  }

  console.log('Fetching games from IGDB...');
  const allGames: IgdbGame[] = [];
  let offset = 0;
  const limit = 500;

  // PC platform = 6, released, 2018+, has summary
  // Unix timestamp for 2018-01-01 = 1514764800
  const baseQuery = `
    fields name, summary, first_release_date, genres, themes, keywords,
           game_modes, player_perspectives, platforms, involved_companies,
           rating, rating_count, total_rating, total_rating_count, websites;
    where platforms = (6)
      & first_release_date > 1514764800
      & first_release_date < ${Math.floor(Date.now() / 1000)}
      & summary != null
      & total_rating_count > 5
      & game_type = 0;
    sort total_rating_count desc;
  `;

  while (true) {
    const query = `${baseQuery} limit ${limit}; offset ${offset};`;
    const batch = await igdbGames(query) as IgdbGame[];
    allGames.push(...batch);
    console.log(`  fetched ${allGames.length} games (offset=${offset})`);
    if (batch.length < limit) break;
    offset += limit;
    // IGDB caps at 10k results with offset
    if (offset >= 10000) break;
  }

  writeFileSync(cachePath, JSON.stringify(allGames, null, 2));
  console.log(`  Cached ${allGames.length} IGDB games`);
  return allGames;
}

// ── Resolve Steam AppIDs from IGDB websites ────────────────────────

async function resolveSteamIds(games: IgdbGame[]): Promise<Map<number, number>> {
  const cachePath = join(RAW_DIR, 'steam_ids.json');
  if (existsSync(cachePath)) {
    console.log('  Using cached Steam ID map');
    const data = JSON.parse(readFileSync(cachePath, 'utf8'));
    return new Map(Object.entries(data).map(([k, v]) => [Number(k), v as number]));
  }

  console.log('Resolving Steam AppIDs from IGDB websites...');
  const map = new Map<number, number>();

  // Gather all website IDs
  const websiteIds: number[] = [];
  for (const g of games) {
    if (g.websites) websiteIds.push(...g.websites);
  }

  // Fetch websites in batches, look for Steam store URLs (category 13)
  for (let i = 0; i < websiteIds.length; i += 500) {
    const batch = websiteIds.slice(i, i + 500);
    const ids = batch.join(',');
    const results = await igdbQuery('websites', `fields game, url, category; where id = (${ids}) & category = 13; limit 500;`) as {
      id: number; game: number; url: string; category: number;
    }[];

    for (const w of results) {
      const match = w.url.match(/store\.steampowered\.com\/app\/(\d+)/);
      if (match) {
        map.set(w.game, parseInt(match[1], 10));
      }
    }
    if (i % 2000 === 0) console.log(`  resolved ${map.size} Steam IDs (${i}/${websiteIds.length} websites)`);
  }

  // Cache
  const obj: Record<string, number> = {};
  for (const [k, v] of map) obj[String(k)] = v;
  writeFileSync(cachePath, JSON.stringify(obj));
  console.log(`  Found ${map.size} Steam AppIDs`);
  return map;
}

// ── Enrich with Steam reviews ──────────────────────────────────────

async function enrichWithSteamReviews(
  steamIds: number[],
  maxCount: number = 500,
): Promise<Map<number, { total: number; positive: number; negative: number; desc: string }>> {
  const cachePath = join(RAW_DIR, 'steam_reviews.json');
  const existing: Record<string, unknown> = existsSync(cachePath)
    ? JSON.parse(readFileSync(cachePath, 'utf8'))
    : {};

  const map = new Map<number, { total: number; positive: number; negative: number; desc: string }>();
  for (const [k, v] of Object.entries(existing)) {
    map.set(Number(k), v as { total: number; positive: number; negative: number; desc: string });
  }

  const toFetch = steamIds.filter(id => !map.has(id)).slice(0, maxCount);
  console.log(`Enriching ${toFetch.length} games with Steam reviews (${map.size} cached)...`);

  for (let i = 0; i < toFetch.length; i++) {
    const id = toFetch[i];
    const reviews = await getAppReviews(id);
    if (reviews) {
      map.set(id, reviews);
      existing[String(id)] = reviews;
    }
    if ((i + 1) % 50 === 0) {
      console.log(`  reviews: ${i + 1}/${toFetch.length}`);
      writeFileSync(cachePath, JSON.stringify(existing));
    }
  }

  writeFileSync(cachePath, JSON.stringify(existing));
  return map;
}

// ── Normalize ──────────────────────────────────────────────────────

function sourced<T>(value: T | null, source: string, estimated: boolean = false, method?: string) {
  return { value, source, estimated, ...(method ? { method } : {}) };
}

interface NormalizedGame {
  identity: { steamAppId: number; igdbId: number | null; name: string; steamUrl: string };
  metadata: {
    summary: string; genres: string[]; themes: string[]; tags: string[];
    keywords: string[]; gameModes: string[]; perspectives: string[];
    platforms: string[]; developers: string[]; publishers: string[];
  };
  release: { date: string | null; isReleased: boolean; isEarlyAccess: boolean };
  commercial: {
    priceUsd: { value: number | null; source: string; estimated: boolean };
    estimatedCopiesSold: { value: number | null; source: string; estimated: boolean; method?: string };
    estimatedRevenueUsd: { value: number | null; source: string; estimated: boolean; method?: string };
  };
  reviews: {
    total: { value: number | null; source: string; estimated: boolean };
    positive: { value: number | null; source: string; estimated: boolean };
    negative: { value: number | null; source: string; estimated: boolean };
    positiveRatio: { value: number | null; source: string; estimated: boolean };
    sentimentSummary: { value: string | null; source: string; estimated: boolean };
  };
}

function normalizeGame(
  g: IgdbGame,
  steamAppId: number,
  lookups: { genres: LookupMap; themes: LookupMap; keywords: LookupMap; modes: LookupMap; perspectives: LookupMap },
  reviews: { total: number; positive: number; negative: number; desc: string } | undefined,
): NormalizedGame {
  const releaseDate = g.first_release_date
    ? new Date(g.first_release_date).toISOString().slice(0, 10)
    : null;

  const genreNames = (g.genres ?? []).map(id => lookups.genres.get(id)).filter(Boolean) as string[];
  const themeNames = (g.themes ?? []).map(id => lookups.themes.get(id)).filter(Boolean) as string[];
  const keywordNames = (g.keywords ?? []).map(id => lookups.keywords.get(id)).filter(Boolean) as string[];
  const modeNames = (g.game_modes ?? []).map(id => lookups.modes.get(id)).filter(Boolean) as string[];
  const perspNames = (g.player_perspectives ?? []).map(id => lookups.perspectives.get(id)).filter(Boolean) as string[];

  const total = reviews?.total ?? null;
  const positive = reviews?.positive ?? null;
  const negative = reviews?.negative ?? null;
  const ratio = total && total > 0 && positive !== null ? Math.round((positive / total) * 100) / 100 : null;

  // Boxleiter estimate if we have reviews
  let estCopies: number | null = null;
  let estRevenue: number | null = null;
  const MULT = 32;
  if (total && total > 0) {
    estCopies = total * MULT;
    estRevenue = Math.round(estCopies * 14.99 * 0.70 * 0.92 * 0.85);
  }

  return {
    identity: {
      steamAppId,
      igdbId: g.id,
      name: g.name,
      steamUrl: `https://store.steampowered.com/app/${steamAppId}`,
    },
    metadata: {
      summary: g.summary ?? '',
      genres: genreNames,
      themes: themeNames,
      tags: [...genreNames, ...themeNames],
      keywords: keywordNames,
      gameModes: modeNames,
      perspectives: perspNames,
      platforms: ['PC'],
      developers: [],
      publishers: [],
    },
    release: {
      date: releaseDate,
      isReleased: true,
      isEarlyAccess: false,
    },
    commercial: {
      priceUsd: sourced(null, 'steam', false),
      estimatedCopiesSold: sourced(estCopies, 'releasesignal', true, `boxleiter x${MULT}`),
      estimatedRevenueUsd: sourced(estRevenue, 'releasesignal', true, `boxleiter x${MULT}`),
    },
    reviews: {
      total: sourced(total, 'steam', false),
      positive: sourced(positive, 'steam', false),
      negative: sourced(negative, 'steam', false),
      positiveRatio: sourced(ratio, 'steam', false),
      sentimentSummary: sourced(reviews?.desc ?? null, 'steam', false),
    },
  };
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  console.log('=== ReleaseSignal corpus builder ===\n');

  // Step 1: Build lookup tables
  console.log('Building lookup tables...');
  const [genres, themes, keywords, modes, perspectives] = await Promise.all([
    buildLookup('genres'),
    buildLookup('themes'),
    buildLookup('keywords'),
    buildLookup('game_modes'),
    buildLookup('player_perspectives'),
  ]);
  const lookups = { genres, themes, keywords, modes, perspectives };

  // Step 2: Fetch games from IGDB
  const igdbGames = await fetchIgdbGames();
  console.log(`\nTotal IGDB games: ${igdbGames.length}`);

  // Step 3: Resolve Steam AppIDs
  const steamIdMap = await resolveSteamIds(igdbGames);

  // Step 4: Filter to games with Steam IDs
  const withSteam = igdbGames.filter(g => steamIdMap.has(g.id));
  console.log(`\nGames with Steam IDs: ${withSteam.length}`);

  // Step 5: Enrich top games with Steam reviews
  const topSteamIds = withSteam.slice(0, 2000).map(g => steamIdMap.get(g.id)!);
  const reviewsMap = await enrichWithSteamReviews(topSteamIds, 500);

  // Step 6: Normalize
  console.log('\nNormalizing...');
  const normalized: NormalizedGame[] = withSteam.map(g => {
    const steamAppId = steamIdMap.get(g.id)!;
    return normalizeGame(g, steamAppId, lookups, reviewsMap.get(steamAppId));
  });

  // Step 7: Write
  const output = {
    meta: {
      corpusVersion: new Date().toISOString(),
      count: normalized.length,
      embeddingModel: 'text-embedding-3-small',
      dims: 1536,
      enrichedCount: reviewsMap.size,
    },
    games: normalized,
  };

  const outPath = join(DATA_DIR, 'games.json');
  writeFileSync(outPath, JSON.stringify(output));
  console.log(`\nWrote ${normalized.length} games to ${outPath} (${(JSON.stringify(output).length / 1024 / 1024).toFixed(1)} MB)`);

  // Write a placeholder index.bin (zeros) — will be replaced by embedding step
  const vecSize = normalized.length * 1536 * 4;
  const buf = Buffer.alloc(vecSize);
  writeFileSync(join(DATA_DIR, 'index.bin'), buf);
  console.log(`Wrote placeholder index.bin (${(vecSize / 1024 / 1024).toFixed(1)} MB)`);

  // Write empty upcoming.json
  writeFileSync(join(DATA_DIR, 'upcoming.json'), JSON.stringify([]));

  console.log('\n=== Done ===');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
