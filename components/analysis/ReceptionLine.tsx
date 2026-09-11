"use client";

import type { MarketReport } from "@/lib/types";

export function ReceptionLine({ reception }: { reception: MarketReport["reception"] }) {
  if (reception.cohortMedian === null || reception.predictedPositiveRatio === null) {
    return (
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Reception</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Insufficient review evidence.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold">Reception</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Comparable games average{" "}
        <span className="font-semibold text-foreground">
          {Math.round(reception.cohortMedian * 100)}% positive
        </span>{" "}
        reviews. That&apos;s your bar.
      </p>
      {reception.predictedPositiveRatio !== reception.cohortMedian && (
        <p className="text-xs text-zinc-500">
          Adjusted for your price positioning:{" "}
          {Math.round(reception.predictedPositiveRatio * 100)}%
        </p>
      )}
    </div>
  );
}
