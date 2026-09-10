/**
 * Scores risk of a given release week based on competition and timing.
 */

import type { GameConcept, UpcomingRelease, ReleaseWindow, RiskBand, Verdict, Driver, ReleaseWindowRisk } from '@/lib/types';
import { driver } from './drivers';

const MIN_MOVE_NOTICE_WEEKS = 3;
const MOVE_THRESHOLD = 15;
const MAX_MOVE_WEEKS = 8;
const DATE_CONFIDENCE_WEIGHT = {
  exact: 1,
  month: 0.8,
  quarter: 0.5,
  vague: 0,
} as const;

function weekStart(base: Date, offset: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
  return d;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function riskBand(score: number): RiskBand {
  if (score < 30) return 'LOW';
  if (score < 55) return 'MODERATE';
  if (score < 80) return 'HIGH';
  return 'CRITICAL';
}

function clamp(min: number, max: number, v: number): number {
  return Math.max(min, Math.min(max, v));
}

export function scoreReleaseRisk(
  concept: GameConcept,
  upcoming: UpcomingRelease[],
  today: Date,
  horizonWeeks: number = 26,
): ReleaseWindowRisk {
  const windows: ReleaseWindow[] = [];
  const scheduled = upcoming.filter(release =>
    release.dateConfidence !== 'vague' && release.rangeStart && release.rangeEnd);

  const weekRanges = Array.from({ length: horizonWeeks }, (_, offset) => {
    const start = weekStart(today, offset);
    return { start, end: weekStart(today, offset + 1) };
  });
  const overlapCount = new Map<number, number>();
  for (const release of scheduled) {
    const count = weekRanges.filter(({ start, end }) =>
      release.rangeStart! < iso(end) && release.rangeEnd! > iso(start)).length;
    overlapCount.set(release.igdbId, Math.max(1, count));
  }

  for (let w = 0; w < horizonWeeks; w++) {
    const ws = weekRanges[w].start;
    const we = weekRanges[w].end;

    const inWindow = scheduled.filter(release =>
      release.rangeStart! < iso(we) && release.rangeEnd! > iso(ws));

    const threatSum = inWindow.reduce((sum, release) => {
      const confidence = DATE_CONFIDENCE_WEIGHT[release.dateConfidence];
      const possibleWeeks = overlapCount.get(release.igdbId) ?? 1;
      return sum + (release.threat * release.similarity / 100) * confidence / possibleWeeks;
    }, 0);
    const risk = clamp(0, 100, Math.round(threatSum));

    const drivers: Driver[] = [
      driver('Competitor density', Math.min(risk, 60), `${inWindow.length} releases in window`),
      driver('Residual factors', Math.max(0, risk - 60), 'seasonal + historical'),
    ];

    windows.push({
      weekStart: iso(ws),
      weekEnd: iso(we),
      risk,
      band: riskBand(risk),
      competingReleases: inWindow,
      drivers,
    });
  }

  const plannedDate = concept.commercial.plannedRelease;
  const currentWindow = plannedDate
    ? windows.find(w => plannedDate >= w.weekStart && plannedDate < w.weekEnd)
    : null;
  const currentRisk = currentWindow?.risk ?? 0;

  const eligible = windows.slice(MIN_MOVE_NOTICE_WEEKS);
  const best = eligible.length > 0
    ? eligible.reduce((earliestBest, candidate) =>
        earliestBest.risk <= candidate.risk ? earliestBest : candidate)
    : null;
  const bestRisk = best?.risk ?? currentRisk;

  let decision: Verdict = 'KEEP';
  let recommendedDate: string | null = null;
  const reasoning: string[] = [];

  if (!plannedDate) {
    decision = 'INSUFFICIENT_DATA';
    recommendedDate = best?.weekStart ?? null;
    reasoning.push('Add a planned release date to compare its risk with other weeks.');
  } else if (!currentWindow) {
    decision = 'INSUFFICIENT_DATA';
    reasoning.push('The planned release date falls outside the available analysis horizon.');
  } else if (currentRisk - bestRisk >= MOVE_THRESHOLD) {
    const bestIdx = windows.indexOf(best!);
    if (bestIdx <= MIN_MOVE_NOTICE_WEEKS + MAX_MOVE_WEEKS) {
      decision = 'MOVE';
      recommendedDate = best!.weekStart;
      reasoning.push(
        `Current week risk: ${currentRisk}. Recommended week risk: ${bestRisk}.`,
        `Moving to ${best!.weekStart} avoids ${currentWindow?.competingReleases.length ?? 0} close competitors.`,
      );
    } else {
      decision = 'MITIGATE';
      reasoning.push(
        `A better window exists but is ${bestIdx} weeks out.`,
        'Consider tactical mitigations: shift announcement timing, adjust price positioning.',
      );
    }
  } else {
    reasoning.push(`Current week risk (${currentRisk}) is within ${MOVE_THRESHOLD} points of the best available.`);
  }

  return {
    windows,
    verdict: { decision, currentDate: plannedDate, recommendedDate, reasoning },
  };
}
