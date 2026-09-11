/**
 * Evaluates likely player reception / review sentiment.
 */


import type { NormalizedGame, GameConcept, EstimatedPlayerReception, ConfidenceBand } from '@/lib/domain/types';

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
    .filter((value): value is number =>
      value !== null && Number.isFinite(value) && value >= 0 && value <= 1)
    .sort((a, b) => a - b);

  if (ratios.length === 0) {
    return {
      predictedPositiveRatio: null,
      cohortMedianPositiveRatio: null,
      band: DEFAULT_CONFIDENCE_BAND,
    };
  }

  const ratioMiddle = Math.floor(ratios.length / 2);
  const cohortMedianPositiveRatio = ratios.length % 2
    ? ratios[ratioMiddle]
    : (ratios[ratioMiddle - 1] + ratios[ratioMiddle]) / 2;
  const prices = comparables
    .map(g => g.commercial.priceUsd.value)
    .filter((value): value is number =>
      value !== null && Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);
  const priceMiddle = Math.floor(prices.length / 2);
  const cohortMedianPrice = prices.length === 0
    ? null
    : prices.length % 2
      ? prices[priceMiddle]
      : (prices[priceMiddle - 1] + prices[priceMiddle]) / 2;
  const rawUserPrice = concept.commercial.priceUsd;
  const userPrice = rawUserPrice !== null && Number.isFinite(rawUserPrice) && rawUserPrice >= 0
    ? rawUserPrice
    : null;

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
  const adjustment = userPrice === null || cohortMedianPrice === null
    ? 1
    : Math.max(
        0.92,
        Math.min(
          1.05,
          1 - USER_PRICE_ADJUSTMENT_CALIBRATION * (userPrice - cohortMedianPrice),
        ),
      );

  return {
    predictedPositiveRatio: Math.round(
      Math.max(0, Math.min(1, cohortMedianPositiveRatio * adjustment)) * 100,
    ) / 100,
    cohortMedianPositiveRatio,
    band:
      ratios.length >= HIGH_CONFIDENCE_CUTOFF ? 'HIGH' :
      ratios.length >= MEDIUM_CONFIDENCE_CUTOFF ? 'MEDIUM' : 'LOW',
  };
}
