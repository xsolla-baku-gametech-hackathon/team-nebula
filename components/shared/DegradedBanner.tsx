"use client";

import type { DegradedFlag } from "@/lib/domain/types";

const MESSAGES: Record<DegradedFlag, string> = {
  llm_fallback: "Using simplified analysis \u2014 you can edit fields directly",
  embedding_fallback: "Reduced-precision matching",
  no_gamalytic: "Revenue estimates use our model (Gamalytic data unavailable)",
};

export function DegradedBanner({ flags }: { flags: DegradedFlag[] }) {
  if (flags.length === 0) return null;
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      {flags.map((f) => (
        <p key={f}>{MESSAGES[f]}</p>
      ))}
    </div>
  );
}
