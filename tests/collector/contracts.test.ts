import { describe, expect, it } from 'vitest';
import { CollectInput } from '@/lib/collector/types';

describe('collector input', () => {
  it('deduplicates IDs while preserving selection order', () => {
    expect(CollectInput.parse({ steamAppIds: [739630, 1966720, 739630] }).steamAppIds).toEqual([739630, 1966720]);
  });
  it.each([[], [0], [-1], [1.5], ['739630'], [2 ** 32], Array(11).fill(739630)])('rejects invalid or oversized selections %j', ids => {
    expect(CollectInput.safeParse({ steamAppIds: ids }).success).toBe(false);
  });
});
