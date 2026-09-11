import { describe, expect, it } from 'vitest';
import { scoreReleaseRisk } from '@/lib/domain/scoring/release-risk';
import { conceptHorrorCoop } from '@/lib/fixtures/concept.horror-coop';
import type { GameConcept, UpcomingRelease } from '@/lib/domain/types';

function conceptWithDate(plannedRelease: string | null): GameConcept {
  return {
    ...conceptHorrorCoop,
    commercial: { ...conceptHorrorCoop.commercial, plannedRelease },
  };
}

function release(overrides: Partial<UpcomingRelease> = {}): UpcomingRelease {
  return {
    igdbId: 42,
    steamAppId: null,
    name: 'Competing Horror',
    expectedDate: '2026-10-16',
    dateLabel: 'Oct 16, 2026',
    dateConfidence: 'exact',
    rangeStart: '2026-10-16',
    rangeEnd: '2026-10-17',
    similarity: 90,
    threat: 90,
    hypes: 100,
    followers: null,
    isMajorPublisher: false,
    ...overrides,
  };
}

describe('release window scoring', () => {
  it('recommends moving away from a crowded planned week', () => {
    const result = scoreReleaseRisk(
      conceptWithDate('2026-10-16'),
      [release()],
      new Date('2026-09-10T00:00:00.000Z'),
      26,
    );

    const planned = result.windows.find((window) => window.competingReleases.length);
    expect(planned?.risk).toBe(90);
    expect(result.verdict.decision).toBe('MOVE');
    expect(result.verdict.recommendedDate).not.toBe('2026-10-16');
  });

  it('distributes an uncertain month across every overlapping week', () => {
    const result = scoreReleaseRisk(
      conceptWithDate('2026-10-16'),
      [release({ dateConfidence: 'month', rangeStart: '2026-10-01', rangeEnd: '2026-11-01' })],
      new Date('2026-09-10T00:00:00.000Z'),
      26,
    );
    const affected = result.windows.filter((window) => window.competingReleases.length);

    expect(affected.length).toBeGreaterThan(4);
    expect(Math.max(...affected.map((window) => window.risk))).toBeLessThan(20);
  });

  it('does not claim a verdict without a planned release date', () => {
    const result = scoreReleaseRisk(
      conceptWithDate(null),
      [],
      new Date('2026-09-10T00:00:00.000Z'),
      26,
    );
    expect(result.verdict.decision).toBe('INSUFFICIENT_DATA');
  });

  it('does not multiply an upstream threat by similarity again', () => {
    const result = scoreReleaseRisk(
      conceptWithDate('2026-10-16'),
      [release({ similarity: 50, threat: 80 })],
      new Date('2026-09-10T00:00:00.000Z'),
      26,
    );
    const planned = result.windows.find((window) => window.competingReleases.length);

    expect(planned?.risk).toBe(80);
  });

  it('anchors weeks to Monday at midnight UTC', () => {
    const result = scoreReleaseRisk(
      conceptWithDate('2026-09-14'),
      [],
      new Date('2026-09-13T23:30:00-04:00'),
      2,
    );

    expect(result.windows.map((window) => window.weekStart)).toEqual(['2026-09-14', '2026-09-21']);
  });

  it('measures move distance from the planned launch week', () => {
    const result = scoreReleaseRisk(
      conceptWithDate('2027-01-27'),
      [release({
        expectedDate: '2027-01-27',
        dateLabel: 'Jan 27, 2027',
        rangeStart: '2027-01-27',
        rangeEnd: '2027-01-28',
        threat: 90,
      })],
      new Date('2026-09-10T00:00:00.000Z'),
      26,
    );

    expect(result.verdict.decision).toBe('MITIGATE');
    expect(result.verdict.reasoning[0]).toContain('17 weeks');
  });

  it('reports only evidence-backed release pressure drivers', () => {
    const result = scoreReleaseRisk(
      conceptWithDate('2026-10-16'),
      [release()],
      new Date('2026-09-10T00:00:00.000Z'),
      26,
    );
    const drivers = result.windows.flatMap((window) => window.drivers);

    expect(new Set(drivers.map((item) => item.label))).toEqual(new Set(['Upcoming competitor pressure']));
    expect(drivers.some((item) => /seasonal|historical/i.test(item.detail))).toBe(false);
  });
});
