import { describe, expect, it, vi } from 'vitest';
import { conceptHorrorCoop } from '@/lib/fixtures/concept.horror-coop';
import { fetchUpcomingReleases, releaseDateWindow } from '@/lib/application/analysis/upcoming-releases';

describe('live upcoming release collection', () => {
  it.each([
    ['Q4 2026', 'quarter', '2026-10-01', '2027-01-01'],
    ['October 2026', 'month', '2026-10-01', '2026-11-01'],
    ['2026', 'vague', null, null],
    ['TBD', 'vague', null, null],
  ] as const)('parses %s as a %s date window', (human, confidence, start, end) => {
    expect(releaseDateWindow({ id: 1, game: 2, date: '2026-10-16T00:00:00.000Z', human, platform: 6 }))
      .toMatchObject({ dateConfidence: confidence, rangeStart: start, rangeEnd: end });
  });

  it('queries PC releases and separates dated and uncertain matches', async () => {
    const call = vi.fn(async (name: string, args: Record<string, unknown>) => {
      if (name === 'semantic_search_games') {
        return { results: [
          { game: { id: 10, name: 'Dated Horror', platforms: [6], hypes: 32 }, similarity: 0.81 },
          { game: { id: 11, name: 'TBD Horror', platforms: [6] }, similarity: 0.72 },
          { game: { id: 12, name: 'Console Horror', platforms: [48] }, similarity: 0.95 },
          { game: { id: 13, name: 'Weak Match', platforms: [6] }, similarity: 0.1 },
        ] };
      }
      expect(name).toBe('query');
      expect(args).toMatchObject({
        entity: 'release_date',
        filters: { game: { in: [10, 11] }, platform: { eq: 6 } },
      });
      return { results: [
        { id: 100, game: 10, date: '2026-10-16T00:00:00.000Z', human: 'Oct 16, 2026', platform: 6 },
        { id: 101, game: 11, date: '2026-10-01T00:00:00.000Z', human: '2026', platform: 6 },
      ] };
    });
    const runMcp = async <T>(run: (mcpCall: typeof call) => Promise<T>) => run(call);

    const result = await fetchUpcomingReleases(
      conceptHorrorCoop,
      new Date('2026-09-10T00:00:00.000Z'),
      26,
      runMcp,
    );

    expect(result.dated).toHaveLength(1);
    expect(result.dated[0]).toMatchObject({ name: 'Dated Horror', similarity: 81, dateConfidence: 'exact' });
    expect(result.undated).toHaveLength(1);
    expect(result.undated[0]).toMatchObject({ name: 'TBD Horror', dateConfidence: 'vague' });
    expect(call).toHaveBeenCalledTimes(2);
  });
});
