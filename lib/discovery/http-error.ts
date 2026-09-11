import { DiscoveryError } from '@/lib/domain/schemas';

const statuses: Record<DiscoveryError['code'], number> = {
  AI_NOT_CONFIGURED: 503,
  AI_UNAVAILABLE: 503,
  INVALID_AI_OUTPUT: 503,
  DISCOVERY_UNAVAILABLE: 503,
  PREVIEW_NOT_FOUND: 404,
  PREVIEW_EXPIRED: 410,
  PREVIEW_CONSUMED: 409,
  PREVIEW_BUSY: 409,
  INVALID_SELECTION: 400,
};

export function discoveryErrorResponse(error: DiscoveryError) {
  return Response.json({ ok: false, error: { code: error.code, message: error.message } },
    { status: statuses[error.code], headers: { 'Cache-Control': 'no-store' } });
}
