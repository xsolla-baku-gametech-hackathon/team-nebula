import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/application/discovery/preview-competitors', () => ({ previewGames: vi.fn() }));
import { previewGames } from '@/lib/application/discovery/preview-competitors';
import { DiscoveryError } from '@/lib/domain/schemas';
import { POST } from '@/app/api/games/discover/route';
const request = (body: string) => new Request('http://localhost/api/games/discover', { method: 'POST', body });
beforeEach(() => vi.resetAllMocks());
describe('discovery API', () => {
  it('validates JSON before calling AI', async () => {
    expect((await POST(request('{'))).status).toBe(400);
    expect((await POST(request('{"query":"hi"}'))).status).toBe(400);
    expect(previewGames).not.toHaveBeenCalled();
  });
  it('returns a typed AI error with no-store headers', async () => {
    vi.mocked(previewGames).mockRejectedValue(new DiscoveryError('AI_UNAVAILABLE', 'Grok unavailable'));
    const response = await POST(request('{"query":"horror"}'));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect((await response.json()).error.code).toBe('AI_UNAVAILABLE');
  });
  it('sanitizes unexpected failures', async () => {
    vi.mocked(previewGames).mockRejectedValue(new Error('secret'));
    const response = await POST(request('{"query":"horror"}'));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('secret');
  });
  it('returns a compact ready preview with no-store headers', async () => {
    vi.mocked(previewGames).mockResolvedValue({ status: 'ready_for_approval', previewId: 'id', expiresAt: 'date',
      query: 'horror', validation: {} as never, candidates: [{ steamAppId: 1, igdbId: 2, name: 'Game', semanticScore: 0.88, reason: 'Match', matchedTags: ['Horror'] }],
      discovery: { provider: 'xai', model: 'grok', candidateCount: 1, rankedCount: 1, requestedCount: 1, returnedCount: 1, complete: true, issues: [] } });
    const response = await POST(request('{"query":"horror","limit":1}'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = await response.json();
    expect(body.data.candidates[0]).toEqual({ steamAppId: 1, igdbId: 2, name: 'Game', semanticScore: 0.88, reason: 'Match', matchedTags: ['Horror'] });
    expect(body.data.candidates[0].description).toBeUndefined();
  });
  it('returns a degraded preview as a success, not an error', async () => {
    // Dropped selections are a valid discovery outcome, not a transport failure.
    const issues = ['1 ranked result was skipped because Grok returned games outside the candidate pool.'];
    vi.mocked(previewGames).mockResolvedValue({ status: 'ready_for_approval', previewId: 'id', expiresAt: 'date',
      query: 'horror', validation: {} as never, candidates: [{ steamAppId: 1, igdbId: 2, name: 'Game', semanticScore: 0.88, reason: 'Match', matchedTags: ['Horror'] }],
      discovery: { provider: 'xai', model: 'grok', candidateCount: 2, rankedCount: 1, requestedCount: 2, returnedCount: 1, complete: false, issues } });
    const response = await POST(request('{"query":"horror","limit":2}'));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data.discovery.complete).toBe(false);
    expect(body.data.discovery.issues).toEqual(issues);
    expect(body.data.candidates).toHaveLength(1);
  });
});
