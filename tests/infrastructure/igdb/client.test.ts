import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/infrastructure/mcp/client', () => ({ withMcp: vi.fn() }));
import { withMcp } from '@/lib/infrastructure/mcp/client';
import { fetchIgdb } from '@/lib/infrastructure/igdb/client';
import { ProviderError } from '@/lib/infrastructure/collector/types';

describe('IGDB identity matching', () => {
  it('stops remaining lookups after an outage', async () => {
    const call = vi.fn().mockRejectedValue(new Error('private upstream failure'));
    vi.mocked(withMcp).mockImplementation(run => run(call));
    const result = await fetchIgdb([1, 2, 3]);
    expect(call).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.data.issues)).toEqual(['1', '2', '3']);
    expect(JSON.stringify(result)).not.toContain('private');
  });
  it('rejects ambiguous and non-Steam links without guessing by name', async () => {
    const call = vi.fn(async () => ({ results: [
      { uid: '1', game: 10, external_game_source: 1 }, { uid: '1', game: 11, external_game_source: 1 },
      { uid: '2', game: 12, external_game_source: 5 },
    ] }));
    vi.mocked(withMcp).mockImplementation(run => run(call));
    const result = await fetchIgdb([1, 2]);
    expect(result.data.games).toEqual({});
    expect(Object.keys(result.data.issues)).toEqual(['1', '2']);
    expect(call).toHaveBeenCalledTimes(2);
  });
  it('isolates one malformed lookup from the next selected game', async () => {
    const call = vi.fn().mockRejectedValueOnce(new ProviderError('igdb', 'invalid_data', 'Invalid metadata'))
      .mockResolvedValueOnce({ results: [{ uid: '2', game: 20, external_game_source: 1 }] })
      .mockResolvedValueOnce({ results: [{ id: 20 }] });
    vi.mocked(withMcp).mockImplementation(run => run(call));
    const result = await fetchIgdb([1, 2]);
    expect(result.data.games[2].id).toBe(20);
    expect(result.data.issues[1].code).toBe('invalid_data');
    expect(JSON.stringify(result)).not.toContain('private');
  });
});
