/**
 * This files is used to measure market saturation; how crowded a release window or genre space is.
 */

import type { NormalizedGame, Driver, SaturationBand } from '@/lib/types';
import { driver } from './drivers';

function clamp(min: number, max: number, v: number): number {
  return Math.max(min, Math.min(max, v));
}

function band(score: number): SaturationBand {
  if (score < 30) return 'LOW';
  if (score < 55) return 'MODERATE';
  if (score < 80) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Scores how crowded a market segment is by combining four signals: density of comparable games,
 * how many of those games clear a revenue floor, the amount of upcoming pressure in the next quarter,
 * and how concentrated revenue is among the top performers.
 *
 * The function converts each signal into a 0–1 factor, weights them into a 100-point score, and then
 * maps the result to a LOW / MODERATE / HIGH / CRITICAL band. It also returns explanatory driver
 * entries so the UI can show why the market looks crowded or open.
 *
 * In practice, the score rises when there are many comparables, fewer of them are commercially successful,
 * more upcoming releases are clustering, and revenue is concentrated in a small number of winners.
 */
export function scoreSaturation(
  comparables: NormalizedGame[],
  upcomingCount: number,
  revenueFloor: number = 50_000,
): { score: number; band: SaturationBand; drivers: Driver[] } {
  if (comparables.length === 0) {
    return { score: 0, band: 'LOW', drivers: [driver('No comparables found', 0, 'Insufficient data')] };
  }

  // Density: how many comparables exist
  const densityFactor = clamp(0, 1, comparables.length / 80);

  // Revenue-based factors must never treat missing estimates as zero.
  const knownRevenue = comparables
    .map(g => g.commercial.estimatedRevenueUsd.value)
    .filter((value): value is number =>
      value !== null && Number.isFinite(value) && value >= 0,
    );
  const aboveFloor = knownRevenue.filter(value => value >= revenueFloor).length;
  const successRate = knownRevenue.length ? aboveFloor / knownRevenue.length : null;
  const successRateFactor = successRate === null ? 0 : clamp(0, 1, 1 - successRate);

  // Upcoming pressure
  const trailingAvgMonthly = comparables.length / 12;
  const upcomingMonthly = upcomingCount / 3;
  const upcomingPressureFactor = trailingAvgMonthly > 0
    ? clamp(0, 1, (upcomingMonthly / trailingAvgMonthly - 1) * 2)
    : 0;

  // Concentration (Herfindahl)
  const positiveRevenue = knownRevenue.filter(value => value > 0);
  const totalRevenue = positiveRevenue.reduce((sum, value) => sum + value, 0);
  let hhi = 0;
  if (totalRevenue > 0) {
    for (const revenue of positiveRevenue) {
      const share = revenue / totalRevenue;
      hhi += share * share;
    }
  }
  const concentrationFactor = clamp(0, 1, hhi * 4);

  const densityContrib = Math.round(35 * densityFactor);
  const successContrib = Math.round(30 * successRateFactor);
  const upcomingContrib = Math.round(20 * upcomingPressureFactor);
  const concentrationContrib = Math.round(15 * concentrationFactor);

  const score = clamp(0, 100, densityContrib + successContrib + upcomingContrib + concentrationContrib);

  const drivers: Driver[] = [
    driver(
      'Comparable releases',
      densityContrib,
      `${comparables.length} comparable games in the corpus`,
    ),
    driver(
      'Success rate',
      successContrib,
      successRate === null
        ? 'Revenue estimates unavailable; success-rate factor omitted'
        : `${Math.round(successRate * 100)}% of ${knownRevenue.length} games with revenue data cleared $${(revenueFloor / 1000).toFixed(0)}k revenue`,
    ),
    driver(
      'Upcoming pressure',
      upcomingContrib,
      `${upcomingCount} upcoming comparable releases`,
    ),
    driver(
      'Revenue concentration',
      concentrationContrib,
      totalRevenue > 0
        ? `HHI ${(hhi * 100).toFixed(0)}% across ${positiveRevenue.length} games with positive revenue estimates`
        : 'Revenue estimates unavailable; concentration factor omitted',
    ),
  ];

  return { score, band: band(score), drivers };
}
