import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/discovery/discover', () => ({ discoverGames: vi.fn() }));
import { discoverGames } from '@/lib/discovery/discover';
import { DiscoveryError } from '@/lib/discovery/types';
import { POST } from '@/app/api/games/discover/route';
const request = (body: string) => new Request('http://localhost/api/games/discover', { method: 'POST', body });
beforeEach(() => vi.resetAllMocks());
describe('discovery API', () => {
  it('validates JSON before calling AI', async () => {
    expect((await POST(request('{'))).status).toBe(400);
    expect((await POST(request('{"query":"hi"}'))).status).toBe(400);
    expect(discoverGames).not.toHaveBeenCalled();
  });
  it('returns a typed AI error with no-store headers', async () => {
    vi.mocked(discoverGames).mockRejectedValue(new DiscoveryError('AI_UNAVAILABLE', 'Grok unavailable'));
    const response = await POST(request('{"query":"horror"}'));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect((await response.json()).error.code).toBe('AI_UNAVAILABLE');
  });
  it('sanitizes unexpected failures', async () => {
    vi.mocked(discoverGames).mockRejectedValue(new Error('secret'));
    const response = await POST(request('{"query":"horror"}'));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('secret');
  });
});
