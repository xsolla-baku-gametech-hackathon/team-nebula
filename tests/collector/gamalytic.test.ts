import { expect, it, vi } from 'vitest';
import { fetchGamalytic, parseGamalytic } from '@/lib/collector/gamalytic';
import { requestText } from '@/lib/collector/http';
vi.mock('@/lib/collector/http', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/collector/http')>(), requestText:vi.fn(),
}));

it('retains missing revenue, legitimate zeros, and exact AppID matches', () => {
  const result = parseGamalytic({result:[{steamId:'739630',copiesSold:100},{steamId:570,copiesSold:0,revenue:0},{steamId:999,revenue:1000}]},[739630,570]);
  expect(result.games[739630].revenue).toBeUndefined();
  expect(result.games[570].revenue).toBe(0);
  expect(result.games[999]).toBeUndefined();
});
it('isolates malformed records and ambiguous duplicates', () => {
  const result = parseGamalytic({result:[{steamId:1,revenue:-1},{steamId:2,revenue:10},{steamId:2,revenue:20},{steamId:3,revenue:30}]},[1,2,3]);
  expect(result.invalidIds).toEqual([1,2]);
  expect(Object.keys(result.games)).toEqual(['3']);
});
it('batches IDs without authentication and fetches again on subsequent requests', async () => {
  vi.mocked(requestText).mockResolvedValue(JSON.stringify({result:[{steamId:739630,copiesSold:10}]}));
  await fetchGamalytic([739630,1966720]);
  await fetchGamalytic([739630,1966720]);
  expect(requestText).toHaveBeenCalledTimes(2);
  const args = vi.mocked(requestText).mock.calls[0];
  expect(new URL(args[1]).searchParams.get('appids')).toBe('739630,1966720');
  expect(args[2]).toBeUndefined();
});
