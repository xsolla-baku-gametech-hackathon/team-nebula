/**
 * Evaluates likely player reception / review sentiment.
 */


import type { NormalizedGame, GameConcept, EstimatedPlayerReception, ConfidenceBand } from '@/lib/types';

const DEFAULT_PREDICTED_POSITIVE_RATIO: number = 0.80;
const DEFAULT_COHORT_MEDIAN_POSITIVE_REVIEWS: number = 0.80;
const DEFAULT_CONFIDENCE_BAND: ConfidenceBand = 'LOW';

const MEDIUM_CONFIDENCE_CUTOFF: number = 4;
const HIGH_CONFIDENCE_CUTOFF: number = 8;

const USER_PRICE_ADJUSTMENT_CALIBRATION = 0.004;

/**
 * Estimates the reception of the user's concept by looking at the
 * median positive review ratio and price of similar games, and adjusting
 * it by a custom scaling factor based on how different the user's concept's price
 * is from the median price of similar games.
 * @param comparables The list of games similar to the user's concept
 */
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

  /**
   * Adjustment for the predicted positive ratio based on how different the 
   * price of the user's concept is from the median price of similar games.
   * 
   * If the user price is higher, the reviews are adjusted to be slightly lower;
   * if the user price is lower, the reviews are adjusted to be slightly higher.
   * 
   * For example, if the user's game is priced $10 above the median price,
   * the prediction will be nudged down by 0.004 * 10 = 4%.
   */
  const adj = Math.max(
					0.92,
					Math.min(
						1.05,
						1 - USER_PRICE_ADJUSTMENT_CALIBRATION * (userPrice - cohortMedianPrice)
					)
				);

  return {
    predictedPositiveRatio: Math.round(cohortMedianPositiveRatio * adj * 100) / 100,
    cohortMedianPositiveRatio: cohortMedianPositiveRatio,
    band: 
		ratios.length >= HIGH_CONFIDENCE_CUTOFF ? 'HIGH' :
		ratios.length >= MEDIUM_CONFIDENCE_CUTOFF ? 'MEDIUM' : 'LOW',
  };
}
