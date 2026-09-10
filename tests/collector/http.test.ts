import { afterEach, expect, it, vi } from 'vitest';
import { RequestGate, requestText } from '@/lib/collector/http';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it('spaces concurrent reservations', async () => {
  vi.useFakeTimers();
  const gate = new RequestGate(250, 'igdb');
  const starts: number[] = [];
  const initial = Date.now();
  const tasks = [1,2,3].map(async () => { await gate.enter(); starts.push(Date.now() - initial); });
  await vi.runAllTimersAsync();
  await Promise.all(tasks);
  expect(starts).toEqual([0,250,500]);
});
it('retries a transient failure and strips upstream bodies from permanent errors', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn().mockResolvedValueOnce(new Response('secret', {status:503})).mockResolvedValueOnce(new Response('ok'));
  vi.stubGlobal('fetch', fetcher);
  const task = requestText('igdb', 'https://example.test/');
  await vi.runAllTimersAsync();
  expect(await task).toBe('ok');
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it('blocks queued requests after quota exhaustion', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn(async () => new Response('secret', {status:429, headers:{'retry-after':'3600'}})));
  const task = expect(requestText('gamalytic', 'https://example.test/')).rejects.toMatchObject({code:'rate_limited'});
  await vi.runAllTimersAsync();
  await task;
  await expect(requestText('gamalytic', 'https://example.test/')).rejects.toMatchObject({code:'rate_limited'});
  expect(fetch).toHaveBeenCalledTimes(1);
});
