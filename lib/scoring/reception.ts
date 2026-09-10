import type { NormalizedGame, GameConcept, ConfidenceBand } from '@/lib/types';

export function scoreReception(
  concept: GameConcept,
  comparables: NormalizedGame[],
): { predictedPositiveRatio: number; cohortMedian: number; band: ConfidenceBand } {
  const ratios = comparables
    .map(g => g.reviews.positiveRatio.value)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);

  if (ratios.length === 0) return { predictedPositiveRatio: 0.80, cohortMedian: 0.80, band: 'LOW' };

  const cohortMedian = ratios[Math.floor(ratios.length / 2)];
  const cohortMedianPrice = comparables.reduce((s, g) => s + (g.commercial.priceUsd.value ?? 0), 0) / comparables.length;
  const userPrice = concept.commercial.priceUsd ?? 14.99;
  const adj = Math.max(0.92, Math.min(1.05, 1 - 0.004 * (userPrice - cohortMedianPrice)));

  return {
    predictedPositiveRatio: Math.round(cohortMedian * adj * 100) / 100,
    cohortMedian,
    band: ratios.length >= 8 ? 'HIGH' : ratios.length >= 4 ? 'MEDIUM' : 'LOW',
  };
}
