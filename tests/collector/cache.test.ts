import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataCache } from '@/lib/collector/cache';

afterEach(() => vi.useRealTimers());
describe('provider cache', () => {
  it('shares simultaneous requests, returns independent values, and expires data', async () => {
    vi.useFakeTimers();
    const cache = new DataCache<{ price: number }>(100);
    const load = vi.fn(async () => ({ price: 10 }));
    const [a,b] = await Promise.all([cache.get('game', load), cache.get('game', load)]);
    expect(load).toHaveBeenCalledTimes(1);
    a.data.price = 0;
    expect(b.data.price).toBe(10);
    expect((await cache.get('game', load)).cached).toBe(true);
    vi.advanceTimersByTime(101);
    await cache.get('game', load);
    expect(load).toHaveBeenCalledTimes(2);
  });
  it('evicts least recently used records and does not cache failures', async () => {
    const cache = new DataCache<number>(10000, 1);
    await cache.get('a', async () => 1);
    await cache.get('b', async () => 2);
    expect((await cache.get('a', async () => 3)).data).toBe(3);
    await expect(cache.get('x', async () => { throw new Error('offline'); })).rejects.toThrow();
    expect((await cache.get('x', async () => 4)).data).toBe(4);
  });
});
