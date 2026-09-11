"use client";

import type { MarketReport } from "@/lib/domain/types";

const VERDICT_COLORS: Record<string, string> = {
  KEEP: "border-green-500 bg-green-50 dark:bg-green-950",
  MOVE: "border-amber-500 bg-amber-50 dark:bg-amber-950",
  MITIGATE: "border-red-500 bg-red-50 dark:bg-red-950",
};

export function VerdictCard({ verdict }: { verdict: MarketReport["verdict"] }) {
  return (
    <div
      className={`rounded-lg border-2 p-5 space-y-3 ${VERDICT_COLORS[verdict.decision] ?? ""}`}
    >
      <p className="text-2xl font-bold">{verdict.decision}</p>

      {verdict.currentDate && verdict.recommendedDate && (
        <p className="font-mono text-sm">
          {verdict.currentDate} &rarr; {verdict.recommendedDate}
        </p>
      )}

      <ul className="space-y-1 text-sm">
        {verdict.reasoning.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
