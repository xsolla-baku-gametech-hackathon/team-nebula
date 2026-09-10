/**
 * Predicts revenue range for comparable games or a candidate launch.
 */

import type { NormalizedGame, GameConcept, ConfidenceBand, Driver } from '@/lib/types';
import { driver } from './drivers';

function roundSig(n: number, sig: number): number {
  if (n === 0) return 0;
  const d = Math.ceil(Math.log10(Math.abs(n)));
  const power = sig - d;
  const magnitude = 10 ** power;
  return Math.round(n * magnitude) / magnitude;
}

function weightedPercentile(values: number[], weights: number[], p: number): number {
  const pairs = values.map((v, i) => ({ v, w: weights[i] })).sort((a, b) => a.v - b.v);
  const totalW = pairs.reduce((s, x) => s + x.w, 0);
  if (totalW === 0) return 0;

  let cumW = 0;
  for (const pair of pairs) {
    cumW += pair.w;
    if (cumW / totalW >= p) return pair.v;
  }
  return pairs[pairs.length - 1].v;
}

/**
 * Estimates a likely revenue range for a game concept by comparing it against similar released titles.
 *
 * Each comparable's revenue is normalized to the user's target price using a mild price elasticity
 * adjustment: revenue × (userPrice / comparablePrice)^0.6. The adjusted values are then summarized into
 * a conservative, base, and upside estimate using the 25th, 50th, and 80th percentiles.
 *
 * After the percentile-based estimate is calculated, the model applies a saturation penalty/boost and a
 * first-title discount to account for market crowding and launch experience risk. The result is rounded
 * to 2 significant figures and returned with a confidence band and explanatory drivers.
 */
export function scoreRevenue(
  concept: GameConcept,
  comparables: NormalizedGame[],
  saturationScore: number,
): {
  conservative: number;
  base: number;
  upside: number;
  confidence: ConfidenceBand;
  basedOnCount: number;
  method: string;
  drivers: Driver[];
} {
  const withRevenue = comparables.filter(g => g.commercial.estimatedRevenueUsd.value !== null);

  if (withRevenue.length === 0) {
    return {
      conservative: 0,
      base: 0,
      upside: 0,
      confidence: 'LOW',
      basedOnCount: 0,
      method: 'insufficient data',
      drivers: [driver('No revenue data', 0, 'No comparables have revenue estimates')],
    };
  }

  const userPrice = concept.commercial.priceUsd ?? 14.99;

  const revenues: number[] = [];
  const weights: number[] = [];

  for (const g of withRevenue) {
    const rev = g.commercial.estimatedRevenueUsd.value!;
    const gamePrice = g.commercial.priceUsd.value ?? userPrice;
    const adj = rev * Math.pow(userPrice / gamePrice, 0.6);
    revenues.push(adj);
    weights.push(1); // simplified: equal weights for skeleton
  }

  let conservative = weightedPercentile(revenues, weights, 0.25);
  let base = weightedPercentile(revenues, weights, 0.50);
  let upside = weightedPercentile(revenues, weights, 0.80);

  // Saturation modifier
  if (saturationScore > 70) {
    conservative *= 0.85;
    base *= 0.85;
    upside *= 0.85;
  } else if (saturationScore < 30) {
    conservative *= 1.10;
    base *= 1.10;
    upside *= 1.10;
  }

  // First title modifier
  if (concept.commercial.isFirstTitle) {
    conservative *= 0.75;
    base *= 0.75;
    upside *= 0.75;
  }

  conservative = roundSig(conservative, 2);
  base = roundSig(base, 2);
  upside = roundSig(upside, 2);

  // Confidence
  let confidence: ConfidenceBand = 'LOW';
  if (withRevenue.length >= 10) confidence = 'HIGH';
  else if (withRevenue.length >= 6) confidence = 'MEDIUM';

  const drivers: Driver[] = [
    driver('Comparable cohort', base, `${withRevenue.length} games with revenue data`),
  ];

  return {
    conservative,
    base,
    upside,
    confidence,
    basedOnCount: withRevenue.length,
    method: 'weighted percentile over comparable revenue',
    drivers,
  };
}
