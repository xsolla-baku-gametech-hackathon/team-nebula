/**
 * Evaluates likely player reception / review sentiment.
 */


import type { NormalizedGame, GameConcept, EstimatedPlayerReception, ConfidenceBand } from '@/lib/types';

const DEFAULT_PREDICTED_POSITIVE_RATIO: number = 0.80;
const DEFAULT_COHORT_MEDIAN_POSITIVE_REVIEWS: number = 0.80;
const DEFAULT_CONFIDENCE_BAND: ConfidenceBand = 'LOW';

const MEDIUM_CONFIDENCE_CUTOFF: number = 4;
const HIGH_CONFIDENCE_CUTOFF: number = 8;

export function scoreReception(
  concept: GameConcept,
  comparables: NormalizedGame[],
): EstimatedPlayerReception {
  const ratios = comparables
    .map(g => g.reviews.positiveRatio.value)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);

  if (ratios.length === 0){
	return { 
		predictedPositiveRatio: DEFAULT_PREDICTED_POSITIVE_RATIO,
		cohortMedianPositiveRatio: DEFAULT_COHORT_MEDIAN_POSITIVE_REVIEWS,
		band: DEFAULT_CONFIDENCE_BAND 
	};
  } 

  const cohortMedianPositiveRatio = ratios[Math.floor(ratios.length / 2)];
  const cohortMedianPrice = comparables.reduce((s, g) => s + (g.commercial.priceUsd.value ?? 0), 0) / comparables.length;
  const userPrice = concept.commercial.priceUsd ?? 14.99;
  const adj = Math.max(0.92, Math.min(1.05, 1 - 0.004 * (userPrice - cohortMedianPrice)));

  return {
    predictedPositiveRatio: Math.round(cohortMedianPositiveRatio * adj * 100) / 100,
    cohortMedianPositiveRatio: cohortMedianPositiveRatio,
    band: 
		ratios.length >= HIGH_CONFIDENCE_CUTOFF ? 'HIGH' :
		ratios.length >= MEDIUM_CONFIDENCE_CUTOFF ? 'MEDIUM' : 'LOW',
  };
}
