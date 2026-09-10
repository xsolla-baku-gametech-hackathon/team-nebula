import { collectGames } from '@/lib/collector/collect';
import { CollectInput } from '@/lib/collector/types';

export const runtime = 'nodejs';
export const maxDuration = 180;
const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  const started = Date.now();
  let input: unknown;
  try { input = await request.json(); }
  catch { return Response.json({ ok: false, error: { code: 'INVALID_INPUT', message: 'Expected a JSON request body' } }, { status: 400, headers }); }
  const parsed = CollectInput.safeParse(input);
  if (!parsed.success) return Response.json({ ok: false, error: { code: 'INVALID_INPUT', message: 'Provide steamAppIds containing one to ten positive integer AppIDs', details: parsed.error.flatten() } }, { status: 400, headers });
  try {
    const data = await collectGames(parsed.data);
    const meta = { durationMs: Date.now() - started, mode: 'live' as const };
    if (!data.games.length) return Response.json({ ok: false, error: { code: 'PROVIDERS_UNAVAILABLE', message: 'No selected Steam games could be collected', details: data.failures }, meta }, { status: 502, headers });
    return Response.json({ ok: true, data, meta }, { headers });
  } catch {
    return Response.json({ ok: false, error: { code: 'INTERNAL', message: 'Collection failed' } }, { status: 500, headers });
  }
}
