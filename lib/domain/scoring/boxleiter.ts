/**
 * Estimate copies sold and
 * revenue based on price and the game’s market position.
 */

/** 
 * Review-to-copies multiplier by price band.
 * For example, [5, 60] means 60 copies sold per 5 reviews. 
*/
const MULTIPLIERS: [max: number, mult: number][] = [
  [5, 60],
  [15, 40],
  [30, 32],
  [Infinity, 25],
];

const VALVE_CUT = 0.70;
const REFUND_RATE = 0.08;
const AVG_DISCOUNT = 0.15;

export function multiplierForPrice(price: number): number {
  for (const [max, mult] of MULTIPLIERS) {
    if (price <= max) return mult;
  }
  return 25;
}

/**
 * @returns Approximately how many copies will be sold for a game priced at the given price with 
 * the given number of reviews.
 */
export function estimateCopies(reviewCount: number, price: number): number | null {
  if (reviewCount <= 0) return null;
  return Math.round(reviewCount * multiplierForPrice(price));
}

/**
 * Estimates revenue based on the estimated number of copies sold.
 * @returns The revenue in dollars if the estimated number of copier were to be sold,
 * taking into account the average discount rate, average refund rate, and Valve's cut
 * on each sale.
 */
export function estimateRevenue(reviewCount: number, price: number): number | null {
  const copies = estimateCopies(reviewCount, price);
  if (copies === null) return null;
  return Math.round(copies * price * VALVE_CUT * (1 - REFUND_RATE) * (1 - AVG_DISCOUNT));
}
