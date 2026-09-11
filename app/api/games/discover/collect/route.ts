import { approvePreview } from '@/lib/discovery/approve';
import { discoveryErrorResponse } from '@/lib/discovery/http-error';
import { ApprovalInput, DiscoveryError } from '@/lib/domain/schemas';

export const runtime = 'nodejs';
export const maxDuration = 180;
const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  const started = Date.now();
  let input: unknown;
  try { input = await request.json(); }
  catch { return Response.json({ ok: false, error: { code: 'INVALID_INPUT', message: 'Expected a JSON request body' } }, { status: 400, headers }); }
  const parsed = ApprovalInput.safeParse(input);
  if (!parsed.success) return Response.json({ ok: false, error: { code: 'INVALID_INPUT',
    message: 'Provide previewId with either approveAll:true or one to ten selectedSteamAppIds' } }, { status: 400, headers });
  try {
    const data = await approvePreview(parsed.data);
    const meta = { mode: 'live' as const, durationMs: Date.now() - started };
    if (!data.games.length) return Response.json({ ok: false, error: { code: 'PROVIDERS_UNAVAILABLE',
      message: 'No approved Steam games could be collected', details: data.failures }, meta }, { status: 502, headers });
    return Response.json({ ok: true, data, meta }, { headers });
  } catch (error) {
    if (error instanceof DiscoveryError) return discoveryErrorResponse(error);
    return Response.json({ ok: false, error: { code: 'INTERNAL', message: 'Approved game collection failed' } }, { status: 500, headers });
  }
}
