"use client";

import { useState } from "react";
import type { ReleaseWindow } from "@/lib/types";
import { ScoreBar } from "@/components/shared/ScoreBar";
import { WeekDetail } from "./WeekDetail";

export function ReleaseCalendar({
  windows,
  currentDate,
  recommendedDate,
}: {
  windows: ReleaseWindow[];
  currentDate: string | null;
  recommendedDate: string | null;
}) {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Who You&apos;re Launching Against</h3>

      <div className="space-y-2">
        {windows.map((w) => {
          const isCurrent = currentDate && currentDate >= w.weekStart && currentDate < w.weekEnd;
          const isBest = recommendedDate === w.weekStart;

          return (
            <div key={w.weekStart}>
              <button
                onClick={() =>
                  setExpandedWeek(expandedWeek === w.weekStart ? null : w.weekStart)
                }
                className="w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-20 text-xs font-mono text-zinc-500">
                    {w.weekStart.slice(5)}
                  </span>
                  <div className="flex-1">
                    <ScoreBar score={w.risk} band={w.band} />
                  </div>
                  <span className="w-8 text-right text-sm font-mono">{w.risk}</span>
                  <span className="w-20 text-xs text-right">
                    {w.band}
                    {isCurrent && (
                      <span className="ml-1 text-red-500">you</span>
                    )}
                    {isBest && (
                      <span className="ml-1 text-green-500">best</span>
                    )}
                  </span>
                </div>
              </button>
              {expandedWeek === w.weekStart && (
                <WeekDetail window={w} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
