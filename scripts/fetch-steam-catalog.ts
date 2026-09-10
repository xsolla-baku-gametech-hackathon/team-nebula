/**
 * Step 1: Fetch Steam catalog and save to data/raw/steam_catalog.json
 * Step 2: Fetch appdetails + reviews for selected games
 *
 * Usage: pnpm corpus:fetch
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const RAW_DIR = join(DATA_DIR, 'raw');
if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

const STEAM_KEY = process.env.STEAM_WEB_API_KEY;
if (!STEAM_KEY) { console.error('Missing STEAM_WEB_API_KEY'); process.exit(1); }

// ── Rate limiter ───────────────────────────────────────────────────

let lastReq = 0;
async function rateLimit(ms: number) {
  const wait = Math.max(0, lastReq + ms - Date.now());
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastReq = Date.now();
}

// ── Fetch catalog ──────────────────────────────────────────────────

async function fetchCatalog(): Promise<{ appid: number; name: string }[]> {
  const cachePath = join(RAW_DIR, 'steam_catalog.json');
  if (existsSync(cachePath)) {
    console.log('Using cached catalog');
    return JSON.parse(readFileSync(cachePath, 'utf8'));
  }

  console.log('Fetching Steam catalog...');
  const apps: { appid: number; name: string }[] = [];
  let lastAppId = 0;
  let hasMore = true;

  while (hasMore) {
    await rateLimit(500);
    const url = `https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${STEAM_KEY}&include_games=true&max_results=50000&last_appid=${lastAppId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Catalog ${res.status}`);
    const data = await res.json();
    const batch = data.response?.apps ?? [];
    apps.push(...batch.map((a: { appid: number; name: string }) => ({ appid: a.appid, name: a.name })));
    hasMore = data.response?.have_more_results ?? false;
    if (batch.length > 0) lastAppId = batch[batch.length - 1].appid;
    console.log(`  ${apps.length} apps (cursor=${lastAppId})`);
  }

  writeFileSync(cachePath, JSON.stringify(apps));
  console.log(`Cached ${apps.length} apps`);
  return apps;
}

// ── Fetch app details ──────────────────────────────────────────────

interface AppDetails {
  name: string;
  steam_appid: number;
  type: string;
  short_description: string;
  detailed_description: string;
  genres?: { id: string; description: string }[];
  categories?: { id: number; description: string }[];
  release_date?: { coming_soon: boolean; date: string };
  price_overview?: { final: number; currency: string };
  developers?: string[];
  publishers?: string[];
  is_free?: boolean;
}

async function fetchAppDetails(appId: number): Promise<AppDetails | null> {
  await rateLimit(1500);
  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`);
    if (!res.ok) return null;
    const data = await res.json();
    const entry = data[String(appId)];
    if (!entry?.success) return null;
    return entry.data;
  } catch {
    return null;
  }
}

// ── Fetch reviews ──────────────────────────────────────────────────

async function fetchReviews(appId: number): Promise<{ total: number; positive: number; negative: number; desc: string } | null> {
  await rateLimit(1500);
  try {
    const res = await fetch(`https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all&num_per_page=0`);
    if (!res.ok) return null;
    const data = await res.json();
    const qs = data.query_summary;
    if (!qs) return null;
    return { total: qs.total_reviews ?? 0, positive: qs.total_positive ?? 0, negative: qs.total_negative ?? 0, desc: qs.review_score_desc ?? '' };
  } catch {
    return null;
  }
}

// ── Normalize ──────────────────────────────────────────────────────

function sourced<T>(value: T | null, source: string, estimated: boolean = false, method?: string) {
  return { value, source, estimated, ...(method ? { method } : {}) };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000);
}

function normalizeApp(details: AppDetails, reviews: { total: number; positive: number; negative: number; desc: string } | null) {
  const price = details.price_overview ? details.price_overview.final / 100 : (details.is_free ? 0 : null);
  const total = reviews?.total ?? null;
  const positive = reviews?.positive ?? null;
  const negative = reviews?.negative ?? null;
  const ratio = total && total > 0 && positive !== null ? Math.round((positive / total) * 100) / 100 : null;

  let estCopies: number | null = null;
  let estRevenue: number | null = null;
  const mult = price !== null && price > 30 ? 25 : price !== null && price > 15 ? 32 : price !== null && price > 5 ? 40 : 60;
  if (total && total > 0) {
    estCopies = total * mult;
    estRevenue = Math.round(estCopies * (price ?? 14.99) * 0.70 * 0.92 * 0.85);
  }

  const genres = (details.genres ?? []).map(g => g.description);
  const releaseDate = details.release_date?.date ?? null;

  return {
    identity: {
      steamAppId: details.steam_appid,
      igdbId: null,
      name: details.name,
      steamUrl: `https://store.steampowered.com/app/${details.steam_appid}`,
    },
    metadata: {
      summary: stripHtml(details.short_description || details.detailed_description || ''),
      genres,
      themes: [] as string[],
      tags: genres,
      keywords: [] as string[],
      gameModes: [] as string[],
      perspectives: [] as string[],
      platforms: ['PC'] as string[],
      developers: details.developers ?? [],
      publishers: details.publishers ?? [],
    },
    release: {
      date: releaseDate,
      isReleased: !details.release_date?.coming_soon,
      isEarlyAccess: (details.genres ?? []).some(g => g.description === 'Early Access'),
    },
    commercial: {
      priceUsd: sourced(price, 'steam'),
      estimatedCopiesSold: sourced(estCopies, 'releasesignal', true, `boxleiter x${mult}`),
      estimatedRevenueUsd: sourced(estRevenue, 'releasesignal', true, `boxleiter x${mult}`),
    },
    reviews: {
      total: sourced(total, 'steam'),
      positive: sourced(positive, 'steam'),
      negative: sourced(negative, 'steam'),
      positiveRatio: sourced(ratio, 'steam'),
      sentimentSummary: sourced(reviews?.desc ?? null, 'steam'),
    },
  };
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  console.log('=== ReleaseSignal corpus builder (Steam) ===\n');

  // Step 1: Get catalog
  const catalog = await fetchCatalog();
  console.log(`\nCatalog: ${catalog.length} apps\n`);

  // Step 2: We'll fetch details+reviews for a curated set of popular games
  // For speed, use a pre-selected list of ~500 well-known Steam AppIDs
  // This can be expanded later with the full catalog pipeline
  const detailsCachePath = join(RAW_DIR, 'app_details.json');
  const existingDetails: Record<string, unknown> = existsSync(detailsCachePath)
    ? JSON.parse(readFileSync(detailsCachePath, 'utf8'))
    : {};

  // Take top games from catalog by appid range (recent + popular tend to be higher IDs)
  // For a quick build, select ~800 from catalog that are likely games
  const TARGET = parseInt(process.env.TARGET_SIZE ?? '500', 10);
  const selected = catalog
    .filter(a => a.name.length > 2 && !a.name.includes('DLC') && !a.name.includes('Soundtrack'))
    .slice(0, TARGET * 3); // oversample, will filter by type=game

  console.log(`Fetching details for up to ${selected.length} apps (target: ${TARGET})...\n`);

  const games: ReturnType<typeof normalizeApp>[] = [];
  const existingIds = new Set(Object.keys(existingDetails));

  for (let i = 0; i < selected.length && games.length < TARGET; i++) {
    const app = selected[i];
    const key = String(app.appid);

    let details: AppDetails | null = null;
    if (existingIds.has(key)) {
      details = existingDetails[key] as AppDetails | null;
    } else {
      details = await fetchAppDetails(app.appid);
      existingDetails[key] = details;

      // Save progress every 50
      if (i % 50 === 0) {
        writeFileSync(detailsCachePath, JSON.stringify(existingDetails));
        console.log(`  progress: ${i}/${selected.length}, ${games.length} games collected`);
      }
    }

    if (!details || details.type !== 'game') continue;
    if (!details.short_description && !details.detailed_description) continue;

    // Fetch reviews
    let reviews: { total: number; positive: number; negative: number; desc: string } | null = null;
    const reviewsCachePath = join(RAW_DIR, 'reviews_cache.json');
    const reviewsCache: Record<string, unknown> = existsSync(reviewsCachePath)
      ? JSON.parse(readFileSync(reviewsCachePath, 'utf8'))
      : {};

    if (reviewsCache[key]) {
      reviews = reviewsCache[key] as unknown as typeof reviews;
    } else {
      reviews = await fetchReviews(app.appid);
      reviewsCache[key] = reviews;
      if (i % 50 === 0) writeFileSync(reviewsCachePath, JSON.stringify(reviewsCache));
    }

    games.push(normalizeApp(details, reviews));
  }

  // Save caches
  writeFileSync(detailsCachePath, JSON.stringify(existingDetails));

  console.log(`\nNormalized ${games.length} games`);

  // Write output
  const output = {
    meta: {
      corpusVersion: new Date().toISOString(),
      count: games.length,
      embeddingModel: 'text-embedding-3-small',
      dims: 1536,
      enrichedCount: games.filter(g => g.reviews.total.value !== null).length,
    },
    games,
  };

  writeFileSync(join(DATA_DIR, 'games.json'), JSON.stringify(output));
  console.log(`Wrote data/games.json (${games.length} games)`);

  // Placeholder index.bin
  const vecSize = games.length * 1536 * 4;
  writeFileSync(join(DATA_DIR, 'index.bin'), Buffer.alloc(vecSize));
  console.log(`Wrote placeholder index.bin (${(vecSize / 1024 / 1024).toFixed(1)} MB)`);

  writeFileSync(join(DATA_DIR, 'upcoming.json'), JSON.stringify([]));
  console.log('\n=== Done ===');
}

main().catch(e => { console.error(e); process.exit(1); });
