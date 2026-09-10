/**
 * Steam API client with rate limiting.
 * appdetails: 1 req per 1.5s (hard).
 */

const STORE_URL = 'https://store.steampowered.com';
const API_URL = 'https://api.steampowered.com';

let lastStoreRequest = 0;

async function storeRateLimit() {
  const now = Date.now();
  const wait = Math.max(0, lastStoreRequest + 1500 - now);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastStoreRequest = Date.now();
}

export async function getAppDetails(appId: number): Promise<Record<string, unknown> | null> {
  await storeRateLimit();
  try {
    const res = await fetch(`${STORE_URL}/api/appdetails?appids=${appId}&cc=us&l=en`);
    if (!res.ok) return null;
    const data = await res.json();
    const entry = data[String(appId)];
    if (!entry?.success) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export async function getAppReviews(appId: number): Promise<{ total: number; positive: number; negative: number; desc: string } | null> {
  await storeRateLimit();
  try {
    const res = await fetch(`${STORE_URL}/appreviews/${appId}?json=1&language=all&purchase_type=all&num_per_page=0`);
    if (!res.ok) return null;
    const data = await res.json();
    const qs = data.query_summary;
    if (!qs) return null;
    return {
      total: qs.total_reviews ?? 0,
      positive: qs.total_positive ?? 0,
      negative: qs.total_negative ?? 0,
      desc: qs.review_score_desc ?? '',
    };
  } catch {
    return null;
  }
}

export async function getSteamCatalog(): Promise<{ appid: number; name: string }[]> {
  const key = process.env.STEAM_WEB_API_KEY;
  if (!key) throw new Error('Missing STEAM_WEB_API_KEY');

  const apps: { appid: number; name: string }[] = [];
  let lastAppId = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${API_URL}/IStoreService/GetAppList/v1/?key=${key}&include_games=true&max_results=50000&last_appid=${lastAppId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam catalog ${res.status}`);
    const data = await res.json();
    const batch = data.response?.apps ?? [];
    apps.push(...batch.map((a: { appid: number; name: string }) => ({ appid: a.appid, name: a.name })));
    hasMore = data.response?.have_more_results ?? false;
    if (batch.length > 0) lastAppId = batch[batch.length - 1].appid;
    console.log(`  catalog: ${apps.length} apps (lastAppId=${lastAppId})`);
  }

  return apps;
}
