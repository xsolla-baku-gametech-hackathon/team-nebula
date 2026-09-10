/**
 * Reads raw IGDB data exported from MCP queries (data/raw/mcp_games.json)
 * and normalizes it into data/games.json.
 *
 * The MCP queries are run by Claude and saved to data/raw/mcp_games.json.
 * This script handles normalization only.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const RAW_DIR = join(DATA_DIR, 'raw');
const INPUT = join(RAW_DIR, 'mcp_games.json');

if (!existsSync(INPUT)) {
  console.error('No data/raw/mcp_games.json found. Export MCP query results first.');
  process.exit(1);
}

interface McpGame {
  igdbId: number;
  steamAppId: number;
  name: string;
  summary: string;
  releaseDate: string | null;
  genres: string[];
  themes: string[];
  keywords: string[];
  gameModes: string[];
  perspectives: string[];
  rating: number | null;
  ratingCount: number | null;
  reviewTotal?: number | null;
  reviewPositive?: number | null;
  reviewNegative?: number | null;
  reviewDesc?: string | null;
}

function sourced<T>(value: T | null, source: string, estimated: boolean = false, method?: string) {
  return { value, source, estimated, ...(method ? { method } : {}) };
}

const games: McpGame[] = JSON.parse(readFileSync(INPUT, 'utf8'));
console.log(`Normalizing ${games.length} games...`);

const normalized = games.map(g => {
  const total = g.reviewTotal ?? null;
  const positive = g.reviewPositive ?? null;
  const negative = g.reviewNegative ?? null;
  const ratio = total && total > 0 && positive !== null ? Math.round((positive / total) * 100) / 100 : null;

  let estCopies: number | null = null;
  let estRevenue: number | null = null;
  if (total && total > 0) {
    estCopies = total * 32;
    estRevenue = Math.round(estCopies * 14.99 * 0.70 * 0.92 * 0.85);
  }

  return {
    identity: {
      steamAppId: g.steamAppId,
      igdbId: g.igdbId,
      name: g.name,
      steamUrl: `https://store.steampowered.com/app/${g.steamAppId}`,
    },
    metadata: {
      summary: g.summary,
      genres: g.genres,
      themes: g.themes,
      tags: [...g.genres, ...g.themes],
      keywords: g.keywords,
      gameModes: g.gameModes,
      perspectives: g.perspectives,
      platforms: ['PC'] as string[],
      developers: [] as string[],
      publishers: [] as string[],
    },
    release: {
      date: g.releaseDate,
      isReleased: true,
      isEarlyAccess: false,
    },
    commercial: {
      priceUsd: sourced(null, 'steam', false),
      estimatedCopiesSold: sourced(estCopies, 'releasesignal', true, 'boxleiter x32'),
      estimatedRevenueUsd: sourced(estRevenue, 'releasesignal', true, 'boxleiter x32'),
    },
    reviews: {
      total: sourced(total, 'steam', false),
      positive: sourced(positive, 'steam', false),
      negative: sourced(negative, 'steam', false),
      positiveRatio: sourced(ratio, 'steam', false),
      sentimentSummary: sourced(g.reviewDesc ?? null, 'steam', false),
    },
  };
});

const output = {
  meta: {
    corpusVersion: new Date().toISOString(),
    count: normalized.length,
    embeddingModel: 'text-embedding-3-small',
    dims: 1536,
    enrichedCount: normalized.filter(g => g.reviews.total.value !== null).length,
  },
  games: normalized,
};

writeFileSync(join(DATA_DIR, 'games.json'), JSON.stringify(output));
console.log(`Wrote ${normalized.length} games to data/games.json`);

// Placeholder index.bin
const vecSize = normalized.length * 1536 * 4;
writeFileSync(join(DATA_DIR, 'index.bin'), Buffer.alloc(vecSize));
console.log(`Wrote placeholder index.bin (${(vecSize / 1024 / 1024).toFixed(1)} MB)`);

writeFileSync(join(DATA_DIR, 'upcoming.json'), JSON.stringify([]));
console.log('Done.');
