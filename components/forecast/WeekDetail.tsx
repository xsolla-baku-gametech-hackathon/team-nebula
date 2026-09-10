"use client";

import type { ReleaseWindow } from "@/lib/types";

export function WeekDetail({ window: w }: { window: ReleaseWindow }) {
  const vague = w.competingReleases.filter((r) => r.dateConfidence === "vague");
  const dated = w.competingReleases.filter((r) => r.dateConfidence !== "vague");

  return (
    <div className="ml-24 mt-2 mb-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-sm space-y-2">
      <p className="font-medium">
        {w.weekStart} &mdash; {w.weekEnd}
      </p>
      {dated.length === 0 && vague.length === 0 && (
        <p className="text-zinc-500">No close competitors in this window.</p>
      )}
      {dated.length > 0 && (
        <div className="space-y-1">
          {dated.map((r) => (
            <div key={r.steamAppId} className="flex justify-between text-xs">
              <span>{r.name}</span>
              <span className="text-zinc-400">
                {r.expectedDate} · {r.dateConfidence} · sim {r.similarity}
              </span>
            </div>
          ))}
        </div>
      )}
      {vague.length > 0 && (
        <p className="text-xs text-zinc-400">
          + {vague.length} undated game{vague.length > 1 ? "s" : ""} that may land in this window
        </p>
      )}
    </div>
  );
}
