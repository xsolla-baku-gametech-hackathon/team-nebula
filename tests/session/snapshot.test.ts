import { describe, expect, it, vi } from 'vitest';
import { conceptHorrorCoop } from '@/tests/fixtures/concept.horror-coop';
import { createSnapshot, snapshotFromImport } from '@/lib/session/snapshot';
import type { MarketReport } from '@/lib/domain/types';

const report: MarketReport = {
  saturation: { score: 20, band: 'LOW', drivers: [] },
  revenue: {
    conservative: 10_000,
    base: 20_000,
    upside: 40_000,
    currency: 'USD',
    confidence: 'MEDIUM',
    basedOnCount: 1,
    method: 'Comparable cohort',
    drivers: [],
  },
  reception: { predictedPositiveRatio: 0.85, cohortMedian: 0.82, band: 'MEDIUM' },
  releaseWindows: [],
  releaseData: {
    status: 'live',
    source: 'igdb-mcp',
    fetchedAt: '2026-09-10T00:00:00.000Z',
    datedCount: 0,
    undatedCount: 0,
    issues: [],
  },
  undatedReleases: [],
  verdict: {
    decision: 'KEEP',
    currentDate: '2026-10-15',
    recommendedDate: null,
    reasoning: ['Risk is low.'],
  },
};

describe('analysis snapshots', () => {
  it('creates an immutable copy independent from live session objects', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-1111-4111-8111-111111111111');
    const concept = structuredClone(conceptHorrorCoop);
    const snapshot = createSnapshot({ concept, competitors: [], report, corpusVersion: 'live' });

    concept.concept.title = 'Changed later';
    expect(snapshot.snapshotId).toBe('11111111-1111-4111-8111-111111111111');
    expect(snapshot.concept.concept.title).toBe('Spectral Protocol');
    expect(Object.isFrozen(snapshot.report)).toBe(true);
  });

  it('recognizes both raw snapshots and JSON export wrappers', () => {
    const snapshot = createSnapshot({
      concept: conceptHorrorCoop,
      competitors: [],
      report,
      corpusVersion: 'live',
    });
    expect(snapshotFromImport(snapshot)).toBe(snapshot);
    expect(snapshotFromImport({ exportVersion: '1', snapshot })).toBe(snapshot);
    expect(snapshotFromImport({ description: 'old draft' })).toBeNull();
  });
});
