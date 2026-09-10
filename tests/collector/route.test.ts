import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/collector/collect', () => ({ collectGames: vi.fn() }));
import { collectGames } from '@/lib/collector/collect';
import { POST } from '@/app/api/games/collect/route';
const request = (body: string) => new Request('http://localhost/api/games/collect', { method: 'POST', body });
beforeEach(() => vi.resetAllMocks());
describe('collection API', () => {
  it('rejects malformed JSON and invalid selections before fetching', async () => {
    expect((await POST(request('{'))).status).toBe(400);
    expect((await POST(request('{"steamAppIds":[]}'))).status).toBe(400);
    expect(collectGames).not.toHaveBeenCalled();
  });
  it('returns sanitized failures with no-store headers', async () => {
    vi.mocked(collectGames).mockRejectedValue(new Error('secret'));
    const response = await POST(request('{"steamAppIds":[1]}'));
    expect(response.status).toBe(500);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).not.toContain('secret');
  });
  it('reports an entirely unavailable batch as 502', async () => {
    vi.mocked(collectGames).mockResolvedValue({ games: [], failures: [{ steamAppId: 1, code: 'not_found', message: 'Unavailable' }] });
    expect((await POST(request('{"steamAppIds":[1]}'))).status).toBe(502);
  });
});
