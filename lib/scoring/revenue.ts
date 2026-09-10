/**
 * Predicts a revenue range from scored comparable games.
 */

import type { ConfidenceBand, EstimatedRevenue, GameConcept, ScoredCompetitor } from '@/lib/types';
import { driver } from './drivers';

type RevenueObservation = {
  adjustedRevenue: number;
  weight: number;
  priceNormalized: boolean;
};

function roundSig(value: number, significantDigits: number): number {
  return Number(value.toPrecision(significantDigits));
}

function weightedPercentile(observations: RevenueObservation[], percentile: number): number | null {
  const sorted = [...observations].sort((a, b) => a.adjustedRevenue - b.adjustedRevenue);
  const totalWeight = sorted.reduce((sum, item) => sum + item.weight, 0);
  if (!sorted.length || !Number.isFinite(totalWeight) || totalWeight <= 0) return null;

  let cumulativeWeight = 0;
  for (const observation of sorted) {
    cumulativeWeight += observation.weight;
    if (cumulativeWeight / totalWeight >= percentile) return observation.adjustedRevenue;
  }
  return sorted.at(-1)?.adjustedRevenue ?? null;
}

function knownNonNegative(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value >= 0;
}

export function scoreRevenue(
  concept: GameConcept,
  competitors: ScoredCompetitor[],
  saturationScore: number,
): EstimatedRevenue {
  const rawTargetPrice = concept.commercial.priceUsd;
  const targetPrice = knownNonNegative(rawTargetPrice) ? rawTargetPrice : null;
  const observations = competitors.flatMap<RevenueObservation>(competitor => {
    const revenue = competitor.game.commercial.estimatedRevenueUsd.value;
    const similarity = competitor.similarity.score;
    if (!knownNonNegative(revenue) || !Number.isFinite(similarity)) return [];

    const boundedSimilarity = Math.max(0, Math.min(1, similarity));
    const weight = boundedSimilarity ** 2;
    if (weight <= 0) return [];

    const comparablePrice = competitor.game.commercial.priceUsd.value;
    const canNormalizePrice = targetPrice !== null
      && targetPrice > 0
      && knownNonNegative(comparablePrice)
      && comparablePrice > 0;
    const adjustedRevenue = canNormalizePrice
      ? revenue * (targetPrice / comparablePrice) ** 0.6
      : revenue;
    if (!Number.isFinite(adjustedRevenue)) return [];

    return [{ adjustedRevenue, weight, priceNormalized: canNormalizePrice }];
  });

  const conservativeValue = weightedPercentile(observations, 0.25);
  const baseValue = weightedPercentile(observations, 0.50);
  const upsideValue = weightedPercentile(observations, 0.80);
  if (conservativeValue === null || baseValue === null || upsideValue === null) {
    return {
      conservative: null,
      base: null,
      upside: null,
      confidence: 'LOW',
      basedOnCount: 0,
      method: 'insufficient revenue evidence',
      drivers: [driver('No usable revenue evidence', 0, 'No comparable combines known revenue with a positive similarity weight')],
    };
  }

  let conservative = conservativeValue;
  let base = baseValue;
  let upside = upsideValue;
  if (saturationScore > 70) {
    conservative *= 0.85;
    base *= 0.85;
    upside *= 0.85;
  } else if (saturationScore < 30) {
    conservative *= 1.10;
    base *= 1.10;
    upside *= 1.10;
  }
  if (concept.commercial.isFirstTitle) {
    conservative *= 0.75;
    base *= 0.75;
    upside *= 0.75;
  }

  conservative = roundSig(conservative, 2);
  base = roundSig(base, 2);
  upside = roundSig(upside, 2);

  let confidence: ConfidenceBand = 'LOW';
  if (observations.length >= 10) confidence = 'HIGH';
  else if (observations.length >= 6) confidence = 'MEDIUM';

  const normalizedCount = observations.filter(item => item.priceNormalized).length;
  const priceDetail = targetPrice === null
    ? 'Target price unavailable; price normalization omitted'
    : targetPrice === 0
      ? 'Free target price; paid-unit price normalization omitted'
      : `${normalizedCount} of ${observations.length} observations price-normalized; free or unknown comparable prices used reported revenue`;

  return {
    conservative,
    base,
    upside,
    confidence,
    basedOnCount: observations.length,
    method: 'similarity-weighted percentiles over comparable revenue',
    drivers: [
      driver('Similarity-weighted cohort', base, `${observations.length} games with usable revenue and similarity evidence`),
      driver('Price normalization', 0, priceDetail),
    ],
  };
}
