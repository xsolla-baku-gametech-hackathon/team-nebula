/**
 * IGDB API client with Twitch OAuth.
 * Rate limit: 4 req/s, max 8 concurrent.
 */

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const API_URL = 'https://api.igdb.com/v4';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET');

  const res = await fetch(`${TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);

  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

// Simple rate limiter: 4 req/s
let lastRequest = 0;
async function rateLimit() {
  const now = Date.now();
  const wait = Math.max(0, lastRequest + 250 - now);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequest = Date.now();
}

export async function igdbQuery(endpoint: string, body: string): Promise<unknown[]> {
  await rateLimit();
  const token = await getToken();
  const clientId = process.env.TWITCH_CLIENT_ID!;

  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB ${endpoint} ${res.status}: ${text}`);
  }

  return res.json();
}

export async function igdbGames(query: string): Promise<unknown[]> {
  return igdbQuery('games', query);
}

export async function igdbMultiquery(queries: { name: string; endpoint: string; query: string }[]): Promise<unknown[]> {
  const body = queries.map(q => `query ${q.endpoint} "${q.name}" { ${q.query} };`).join('\n');
  return igdbQuery('multiquery', body);
}
