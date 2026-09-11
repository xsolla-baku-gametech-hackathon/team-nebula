import { previewGames } from '@/lib/discovery/preview';
import { DiscoverInput, DiscoveryError } from '@/lib/domain/schemas';
import { ProviderError } from '@/lib/collector/types';
import { discoveryErrorResponse } from '@/lib/discovery/http-error';

export const runtime = 'nodejs';
export const maxDuration = 300;
const headers = { 'Cache-Control': 'no-store' };
export async function POST(request: Request) {
  const started = Date.now();
  let input: unknown;
  try { input = await request.json(); }
  catch { return Response.json({ ok: false, error: { code: 'INVALID_INPUT', message: 'Expected a JSON request body' } }, { status: 400, headers }); }
  const parsed = DiscoverInput.safeParse(input);
  if (!parsed.success) return Response.json({ ok: false, error: { code: 'INVALID_INPUT', message: 'Provide a query of 3–2000 characters and an optional limit of 1–10' } }, { status: 400, headers });
  try {
    const data = await previewGames(parsed.data);
    return Response.json({ ok: true, data, meta: { mode: 'live', durationMs: Date.now() - started } }, { headers });
  } catch (error) {
    if (error instanceof DiscoveryError) return discoveryErrorResponse(error);
    if (error instanceof ProviderError) return Response.json({ ok: false, error: { code: 'DISCOVERY_UNAVAILABLE', message: 'IGDB discovery is temporarily unavailable' } }, { status: 503, headers });
    return Response.json({ ok: false, error: { code: 'INTERNAL', message: 'Game discovery failed' } }, { status: 500, headers });
  }
}
