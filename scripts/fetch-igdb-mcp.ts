/**
 * Corpus builder using IGDB via MCP SDK.
 * Connects to the IGDB MCP server as a subprocess, fetches games,
 * resolves lookups, and writes data/games.json.
 *
 * Usage: pnpm corpus:fetch
 * Env: TARGET_SIZE (default 200)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { connectIgdb, disconnectIgdb, igdbQuery, igdbGetDetails } from './igdb-mcp-client';

const DATA_DIR = join(process.cwd(), 'data');
const RAW_DIR = join(DATA_DIR, 'raw');
if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

const TARGET = parseInt(process.env.TARGET_SIZE ?? '200', 10);

// ── Lookup tables ──────────────────────────────────────────────────

type LookupMap = Record<number, string>;

async function buildLookup(entity: string): Promise<LookupMap> {
  const map: LookupMap = {};
  let offset = 0;
  while (true) {
    const { results } = await igdbQuery(entity, { fields: ['name'], limit: 100, offset });
    for (const r of results as { id: number; name: string }[]) {
      map[r.id] = r.name;
    }
    if ((results as unknown[]).length < 100) break;
    offset += 100;
  }
  console.log(`  ${entity}: ${Object.keys(map).length} entries`);
  return map;
}

// ── Fetch games ────────────────────────────────────────────────────

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
  total_rating_count?: number;
}

async function fetchGames(): Promise<IgdbGame[]> {
  const cachePath = join(RAW_DIR, 'igdb_mcp_games.json');
  if (existsSync(cachePath)) {
    console.log('  Using cached IGDB MCP games');
    return JSON.parse(readFileSync(cachePath, 'utf8'));
  }

  console.log(`Fetching games from IGDB MCP (target: ${TARGET})...`);
  const allGames: IgdbGame[] = [];
  let offset = 0;
  const batchSize = 50;

  while (allGames.length < TARGET * 2) {
    try {
      const { results } = await igdbQuery('game', {
        fields: ['name', 'summary', 'first_release_date', 'genres', 'themes', 'keywords', 'game_modes', 'player_perspectives', 'total_rating_count'],
        filters: { total_rating_count: { gte: 10 }, first_release_date: { gte: 1514764800 } },
        sort: { field: 'total_rating_count', order: 'DESC' },
        limit: batchSize,
        offset,
      });
      allGames.push(...(results as IgdbGame[]));
      console.log(`  fetched ${allGames.length} games`);
      if ((results as unknown[]).length < batchSize) break;
      offset += batchSize;
    } catch (e) {
      console.error(`  Error at offset ${offset}:`, e instanceof Error ? e.message : e);
      break;
    }
  }

  writeFileSync(cachePath, JSON.stringify(allGames, null, 2));
  console.log(`  Cached ${allGames.length} games`);
  return allGames;
}

// ── Resolve Steam AppIDs ───────────────────────────────────────────

async function resolveSteamIds(gameIds: number[]): Promise<Record<number, number>> {
  const cachePath = join(RAW_DIR, 'igdb_steam_map.json');
  if (existsSync(cachePath)) {
    console.log('  Using cached Steam ID map');
    return JSON.parse(readFileSync(cachePath, 'utf8'));
  }

  console.log('Resolving Steam AppIDs via IGDB website entity...');
  const map: Record<number, number> = {};

  // Query website entity for Steam URLs (type 13) for each game
  for (let i = 0; i < gameIds.length; i += 5) {
    const batch = gameIds.slice(i, i + 5);
    for (const gid of batch) {
      try {
        const { results } = await igdbQuery('website', {
          fields: ['game', 'url', 'type'],
          filters: { game: { eq: gid }, type: { eq: 13 } },
          limit: 1,
        });
        for (const w of results as { game: number; url: string }[]) {
          const match = w.url?.match(/store\.steampowered\.com\/app\/(\d+)/);
          if (match) {
            map[w.game] = parseInt(match[1], 10);
          }
        }
      } catch {
        // skip
      }
    }
    if ((i + 5) % 50 === 0) console.log(`  resolved ${Object.keys(map).length} Steam IDs (${i}/${gameIds.length})`);
  }

  writeFileSync(cachePath, JSON.stringify(map));
  console.log(`  Found ${Object.keys(map).length} Steam AppIDs`);
  return map;
}

// ── Normalize ──────────────────────────────────────────────────────

function sourced<T>(value: T | null, source: string, estimated: boolean = false, method?: string) {
  return { value, source, estimated, ...(method ? { method } : {}) };
}

function normalizeGame(
  g: IgdbGame,
  steamAppId: number,
  lookups: { genres: LookupMap; themes: LookupMap; keywords: LookupMap; modes: LookupMap; perspectives: LookupMap },
) {
  const releaseDate = g.first_release_date ? g.first_release_date.slice(0, 10) : null;
  const genreNames = (g.genres ?? []).map(id => lookups.genres[id]).filter(Boolean);
  const themeNames = (g.themes ?? []).map(id => lookups.themes[id]).filter(Boolean);
  const keywordNames = (g.keywords ?? []).map(id => lookups.keywords[id]).filter(Boolean);
  const modeNames = (g.game_modes ?? []).map(id => lookups.modes[id]).filter(Boolean);
  const perspNames = (g.player_perspectives ?? []).map(id => lookups.perspectives[id]).filter(Boolean);

  return {
    identity: { steamAppId, igdbId: g.id, name: g.name, steamUrl: `https://store.steampowered.com/app/${steamAppId}` },
    metadata: {
      summary: g.summary ?? '',
      genres: genreNames, themes: themeNames, tags: [...genreNames, ...themeNames],
      keywords: keywordNames, gameModes: modeNames, perspectives: perspNames,
      platforms: ['PC'] as string[], developers: [] as string[], publishers: [] as string[],
    },
    release: { date: releaseDate, isReleased: true, isEarlyAccess: false },
    commercial: {
      priceUsd: sourced(null, 'steam', false),
      estimatedCopiesSold: sourced(null, 'releasesignal', true, 'boxleiter x32'),
      estimatedRevenueUsd: sourced(null, 'releasesignal', true, 'boxleiter x32'),
    },
    reviews: {
      total: sourced(null, 'steam', false),
      positive: sourced(null, 'steam', false),
      negative: sourced(null, 'steam', false),
      positiveRatio: sourced(null, 'steam', false),
      sentimentSummary: sourced(null, 'steam', false),
    },
  };
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  console.log('=== ReleaseSignal corpus builder (IGDB MCP) ===\n');

  console.log('Connecting to IGDB MCP server...');
  await connectIgdb();

  // Step 1: Lookup tables
  console.log('\nBuilding lookup tables...');
  const [genres, themes, keywords, modes, perspectives] = await Promise.all([
    buildLookup('genre'),
    buildLookup('theme'),
    buildLookup('keyword'),
    buildLookup('game_mode'),
    buildLookup('player_perspective'),
  ]);
  const lookups = { genres, themes, keywords, modes, perspectives };

  // Step 2: Fetch games
  const rawGames = await fetchGames();

  // Step 3: Resolve Steam AppIDs
  const steamMap = await resolveSteamIds(rawGames.map(g => g.id));

  // Step 4: Filter + normalize
  const withSteam = rawGames.filter(g => steamMap[g.id]).slice(0, TARGET);
  console.log(`\nGames with Steam IDs: ${withSteam.length}`);

  const games = withSteam.map(g => normalizeGame(g, steamMap[g.id], lookups));

  // Step 5: Write output
  const output = {
    meta: {
      corpusVersion: new Date().toISOString(),
      count: games.length,
      embeddingModel: 'text-embedding-3-small',
      dims: 1536,
      enrichedCount: 0,
    },
    games,
  };

  writeFileSync(join(DATA_DIR, 'games.json'), JSON.stringify(output));
  console.log(`\nWrote ${games.length} games to data/games.json`);

  const vecSize = games.length * 1536 * 4;
  writeFileSync(join(DATA_DIR, 'index.bin'), Buffer.alloc(vecSize));
  console.log(`Wrote placeholder index.bin (${(vecSize / 1024 / 1024).toFixed(1)} MB)`);

  writeFileSync(join(DATA_DIR, 'upcoming.json'), JSON.stringify([]));

  await disconnectIgdb();
  console.log('\n=== Done ===');
}

main().catch(async e => {
  console.error(e);
  await disconnectIgdb();
  process.exit(1);
});
